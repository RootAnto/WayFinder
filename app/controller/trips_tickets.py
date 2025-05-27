import datetime
import json
from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
from models.travel_tickets.travel_ticket_db import Ticket
from services.email_service import *
from models.trips.trip_pydantic import TripCreate, TripOut, TripStatus
from models.trips.trip_db import Trip
from database.db import get_db
from typing import List
import uuid
from fastapi import Query

router = APIRouter(prefix="/trips", tags=["Trips"])

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
    send_paid_ticket_with_qr(to_email=user_email, trip=trip_out)

    return trip_out


@router.get("/confirm-trip")
def confirm_trip(trip_id: str, user_email: str, db: Session = Depends(get_db)) -> dict[str, str]:
    '''
    @brief Confirm a trip reservation by ID and send ticket via email.

    @param trip_id The UUID of the trip to confirm.
    @param user_email Email of the user to send the ticket to.
    @param db Database session dependency.

    @throws HTTPException 404 if the trip is not found.

    @note If the trip is already confirmed, it returns an informational message.
          Otherwise, it marks the trip as confirmed, saves changes, and
          sends a ticket email.

    @return Dictionary with confirmation or status message.
    '''
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Reserva no encontrada")
    if trip.confirmed:
        return {"message": "Reserva ya confirmada."}

    trip.confirmed = True
    db.commit()

    # Reenvía el viaje como TripOut
    trip_out = TripOut.from_orm(trip)

    # Envía el correo con los billetes
    send_ticket_email(to_email=user_email, trip=trip_out)

    return {"message": "Reserva confirmada. Se han enviado los billetes al correo."}

@router.get("/reservas/{trip_id}/aceptar")
def aceptar_reserva(trip_id: str, db: Session = Depends(get_db)):
    '''
    @brief Accept a pending reservation and generate a ticket.

    @param trip_id The UUID of the trip to accept.
    @param db Database session dependency.

    @throws HTTPException 404 if the trip is not found.
    @throws HTTPException 400 if trip data is incomplete.

    @note Accepts only reservations with 'pendiente' status. Ensures all
          required trip components (flight, hotel, vehicle) are present before
          generating the ticket.

    @return Dictionary with success message and generated ticket ID.
    '''
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Reserva no encontrada")

    if trip.status != TripStatus.pendiente:
        return {"mensaje": f"La reserva ya fue {trip.status}"}

    if not (trip.flight_id and trip.hotel_id and trip.vehicle_id):
        raise HTTPException(status_code=400, detail="No se puede generar " \
        "ticket, faltan datos del viaje")

    ticket = Ticket(
        id=str(uuid.uuid4()),
        user_id=trip.user_id,
        flight_id=trip.flight_id,
        hotel_id=trip.hotel_id,
        vehicle_id=trip.vehicle_id,
    )

    trip.status = TripStatus.aceptada
    trip.confirmed = True

    db.add(ticket)
    db.commit()
    db.refresh(trip)

    trip_out = TripOut.from_orm(trip)

    user_email = trip.user_email
    user_name = trip.user_name or "cliente"

    send_confirmation_tiket(user_email, trip_out, user_name)

    return {"mensaje": "Reserva aceptada, ticket generado y correo enviado",
            "ticket_id": ticket.id}



@router.get("/reservas/{trip_id}/rechazar")
def rechazar_reserva(
    trip_id: str,
    db: Session = Depends(get_db)
) -> dict[str, str]:
    '''
    @brief Reject a pending trip reservation by its ID.

    @param trip_id The UUID of the trip to reject.
    @param db Database session dependency.

    @throws HTTPException 404 if the trip is not found.

    @note Only reservations with status 'pendiente' can be rejected.
          If the reservation was already confirmed or rejected,
          it returns a status message.

    @return Dictionary with a message indicating the result.
    '''

    trip = db.query(Trip).filter(Trip.id == trip_id).first()


    if not trip:
        raise HTTPException(status_code=404, detail="Reserva no encontrada")

    if trip.status != TripStatus.pendiente:
        return {"mensaje": f"La reserva ya fue {trip.status}"}

    trip.status = TripStatus.rechazada
    trip.updated_at = datetime.utcnow()

    db.commit()

    return {"mensaje": "Reserva rechazada correctamente"}


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