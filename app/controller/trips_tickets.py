from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
from app.models.travel_tickets.travel_ticket_db import Ticket
from app.services.email_service import *
from app.models.trips.trip_pydantic import TripCreate, TripOut, TripStatus
from app.models.trips.trip_db import Trip
from app.database.db import get_db
from typing import List, Optional
import uuid
from fastapi import Query

router = APIRouter(prefix="/trips", tags=["Trips"])

from fastapi import Query

@router.get("/get-email-from-trip")
def get_user_data_from_trip(trip_id: str = Query(...), db: Session = Depends(get_db)):
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail=f"Trip with id '{trip_id}' not found")

    return {
        "user_email": trip.user_email,
        "user_name": trip.user_name or "Cliente"
    }


@router.post("/", response_model=TripOut)
def create_trip(
    trip: TripCreate,
    user_email: str = Query(...),
    db: Session = Depends(get_db),
) -> TripOut:
    '''
    @brief Creates a new trip and stores it in the database.

    This function receives trip data and a user's email address, stores the trip in the database,
    and sends two emails: one confirmation email and another containing the paid ticket with a QR code.

    @param trip An instance of TripCreate containing the trip's details.
    @param user_email The user's email address, provided as a query parameter.
    @param db A SQLAlchemy database session provided via FastAPI dependency injection.

    @return TripOut object containing the created trip's data.
    '''
    trip_id = str(uuid.uuid4())
    trip_data = trip.model_dump()


    trip_data.pop("user_email", None)
    user_name = trip_data.pop("user_name", None)
    trip_data.pop("flight_id", None)
    trip_data.pop("hotel_id", None)
    trip_data.pop("vehicle_id", None)

    for key in [
        "flight_name", "flight_price", "hotel_name", "hotel_price",
        "hotel_nights", "vehicle_model", "vehicle_price", "vehicle_days",
        "total_price", "currency"
    ]:
        trip_data.pop(key, None)

    db_trip = Trip(
        id=trip_id,
        user_email=user_email,
        user_name=user_name,
        flight_id=trip.flight_id,
        hotel_id=trip.hotel_id,
        vehicle_id=trip.vehicle_id,
        status=TripStatus.pendiente,
        flight_name=trip.flight_name,
        flight_price=trip.flight_price,
        hotel_name=trip.hotel_name,
        hotel_price=trip.hotel_price,
        hotel_nights=trip.hotel_nights,
        vehicle_model=trip.vehicle_model,
        vehicle_price=trip.vehicle_price,
        vehicle_days=trip.vehicle_days,
        total_price=trip.total_price,
        currency=trip.currency,
        **trip_data
    )

    db.add(db_trip)
    db.commit()
    db.refresh(db_trip)

    trip_out = TripOut.from_orm(db_trip)

    send_confirmation_ticket(
        to_email=user_email,
        to_name=user_name or "cliente",
        trip=trip_out
    )

    return trip_out


@router.get("/reservas/{trip_id}/aceptar")
def confirmar_pago(trip_id: str, db: Session = Depends(get_db)):
    logger.info(f"Iniciando confirmación de pago para reserva {trip_id}")

    trip = db.query(Trip).filter(Trip.id == trip_id).first()

    if not trip:
        logger.warning(f"Reserva no encontrada: {trip_id}")
        raise HTTPException(status_code=404, detail="Reserva no encontrada")

    logger.info(f"Estado actual de la reserva {trip_id}: {trip.status}")
    if trip.status in [TripStatus.aceptada, TripStatus.rechazada]:
        logger.info(f"No se puede confirmar pago para reserva {trip_id} con estado {trip.status}")
        return {"mensaje": f"La reserva ya fue {trip.status.value}"}

    logger.info(f"Cambiando estado a aceptada para la reserva {trip_id}")
    trip.status = TripStatus.aceptada

    ticket = Ticket(
        id=str(uuid.uuid4()),
        user_id=trip.user_id,
        flight_id=trip.flight_id,
        hotel_id=trip.hotel_id,
        vehicle_id=trip.vehicle_id,
    )

    db.add(ticket)
    db.commit()
    db.refresh(trip)

    logger.info(f"Ticket {ticket.id} creado para la reserva {trip_id}")

    trip_out = TripOut.from_orm(trip)

    logger.info(f"Enviando correo con ticket a {trip_out.user_email}")
    send_paid_ticket_with_qr(trip_out.user_email, trip_out)  # Aquí se llama la función que envía el mail con QR

    logger.info(f"Confirmación de pago completada para reserva {trip_id}")

    return {"mensaje": "Reserva aceptada, ticket generado y correo enviado", "ticket_id": ticket.id}


@router.get("/reservas/{trip_id}/rechazar")
def rechazar_reserva(trip_id: str, db: Session = Depends(get_db)):
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Reserva no encontrada")

    if trip.status == TripStatus.rechazada:
        return {"mensaje": "La reserva ya fue rechazada"}

    if trip.status == TripStatus.aceptada or trip.confirmed:
        return {"mensaje": "No se puede rechazar una reserva ya aceptada o confirmada/pagada."}

    # Si está pendiente, se puede rechazar
    trip.status = TripStatus.rechazada
    db.commit()
    db.refresh(trip)

    trip_out = TripOut.from_orm(trip)
    send_rejection_email(trip.user_email, trip.user_name or "cliente", trip_out)

    return {"mensaje": "Reserva rechazada y correo enviado"}


@router.get("/confirm-trip")
def confirm_trip(trip_id: str, user_email: str, db: Session = Depends(get_db)) -> dict[str, str]:
    '''
    @brief Confirm a trip reservation by ID and send ticket via email.

    @param trip_id The UUID of the trip to confirm.
    @param user_email Email of the user to send the ticket to.
    @param db Database session dependency.

    @throws HTTPException 404 if the trip is not found.

    @note If the trip is already confirmed, it returns an informational message.
          Otherwise, it marks the trip as confirmed, sets status to 'aceptada',
          saves changes, and sends a ticket email.

    @return Dictionary with confirmation or status message.
    '''
    logger.info(f"Intentando confirmar reserva: trip_id={trip_id}, user_email={user_email}")

    # Limpia espacios del trip_id y log de todos los trips para debug
    trip_id = trip_id.strip()
    all_ids = db.query(Trip.id).all()
    logger.debug(f"IDs disponibles en DB: {[id[0] for id in all_ids]}")

    trip = db.query(Trip).filter(Trip.id == trip_id).first()

    if not trip:
        logger.warning(f"Reserva no encontrada para trip_id={trip_id}")
        raise HTTPException(status_code=404, detail="Reserva no encontrada")

    if not trip.user_email:
        logger.error(f"Reserva sin email registrado: trip_id={trip_id}")
        raise HTTPException(status_code=400, detail="Reserva no tiene correo asignado")

    if trip.user_email.lower() != user_email.lower():
        logger.error(f"El correo '{user_email}' no coincide con la reserva del viaje '{trip.user_email}'")
        raise HTTPException(status_code=400, detail="El correo no coincide con la reserva")

    if trip.confirmed:
        logger.info(f"Reserva ya estaba confirmada: trip_id={trip_id}")
        return {"message": "Reserva ya confirmada."}

    # Confirmar reserva y actualizar estado
    trip.confirmed = True
    trip.status = TripStatus.aceptada  # ✅ Actualiza el estado a "aceptada"
    db.commit()
    logger.success(f"Reserva confirmada y aceptada: trip_id={trip_id}")

    # Preparar trip para el correo
    trip_out = TripOut.from_orm(trip)

    try:
        send_paid_ticket_with_qr(to_email=user_email, trip=trip_out)
        logger.info(f"Correo enviado correctamente a {user_email} con los billetes del viaje.")
    except Exception as e:
        logger.exception(f"Error al enviar el correo de confirmación a {user_email}: {e}")

    return {"message": "Reserva confirmada. Se han enviado los billetes al correo."}



@router.get("/{trip_id}", response_model=TripOut)
def get_trip(trip_id: str, db: Session = Depends(get_db)) -> Trip:
    '''
    @brief Retrieve a trip by its ID.

    @param trip_id The UUID of the trip to retrieve.
    @param db Database session dependency.

    @throws HTTPException 404 if the trip is not found.

    @return The Trip object matching the given ID.
    '''
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Viaje no encontrado")
    return trip


@router.get("/", response_model=List[TripOut])

def get_all_trips(db: Session = Depends(get_db)) -> List[Trip]:
    '''
@brief Retrieve all trips belonging to a specific user.

@param user_id The UUID of the user whose trips to retrieve.
@param db Database session dependency.

@return List of Trip objects for the user.
'''
    trips = db.query(Trip).all()
    return trips


@router.put("/{trip_id}", response_model=TripOut)
def update_trip(
    trip_id: str,
    updated_trip: TripCreate,
    db: Session = Depends(get_db)
) -> Trip:
    '''
    @brief Update an existing trip by its ID.

    @param trip_id The UUID of the trip to update.
    @param updated_trip Data to update the trip with.
    @param db Database session dependency.

    @throws HTTPException 404 if the trip is not found.

    @note The trip is updated in the database and changes are committed.

    @return The updated Trip object.
    '''
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Viaje no encontrado")

    update_data = updated_trip.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(trip, key, value)

    db.commit()
    db.refresh(trip)
    return trip




@router.delete("/{trip_id}", status_code=204)
def delete_trip(trip_id: str, db: Session = Depends(get_db)) -> None:
    '''
    @brief Delete a trip by its ID.

    @param trip_id The UUID of the trip to delete.
    @param db Database session dependency.

    @throws HTTPException: 404 if the trip is not found.

    @note The trip is permanently deleted from the database.

    @return None
    '''
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Viaje no encontrado")

    db.delete(trip)
    db.commit()
    return


@router.delete("/trips/clear", status_code=status.HTTP_204_NO_CONTENT)
def clear_trips(db: Session = Depends(get_db)):
    try:
        deleted = db.query(Trip).delete()
        db.commit()
        return {"message": f"Se eliminaron {deleted} viajes."}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Error al vaciar la tabla de viajes.")


def confirm_trip_logic(trip_id: str, user_email: str, db: Session):
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Reserva no encontrada")
    if trip.confirmed:
        return {"message": "Reserva ya confirmada."}

    trip.confirmed = True
    db.commit()

    trip_out = TripOut.from_orm(trip)

    send_paid_ticket_with_qr(to_email=user_email, trip=trip_out)
    return {"message": "Reserva confirmada. Se han enviado los billetes al correo."}
