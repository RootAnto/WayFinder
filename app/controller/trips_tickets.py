import datetime
from fastapi import APIRouter, HTTPException, Depends
from pydantic import EmailStr
from sqlalchemy.orm import Session
from models.travel_tickets.travel_ticket_db import Ticket
from services.email_service import send_confirmation_tiket, send_ticket_email
from models.trips.trip_pydantic import TripCreate, TripOut, TripStatus
from models.trips.trip_db import Trip
from database.db import get_db
from typing import List, Optional
import uuid
from fastapi import Query
router = APIRouter(prefix="/trips", tags=["Trips"])


@router.post("/", response_model=TripOut)
def create_trip(
    trip: TripCreate,
    user_email: str = Query(...),
    db: Session = Depends(get_db),
):
    trip_id = str(uuid.uuid4())
    trip_data = trip.model_dump()

    # Quitamos user_email y user_name si están en el body
    trip_data.pop("user_email", None)
    user_name = trip_data.pop("user_name", None)

    db_trip = Trip(
        id=trip_id,
        user_email=user_email,
        user_name=user_name,
        status=TripStatus.pendiente,
        **trip_data
    )

    db.add(db_trip)
    db.commit()
    db.refresh(db_trip)

    send_ticket_email(
        to_email=user_email,
        to_name=user_name or "cliente",
        trip=TripOut.from_orm(db_trip)
    )

    return db_trip


@router.get("/reservas/{trip_id}/aceptar")
def aceptar_reserva(trip_id: str, db: Session = Depends(get_db)):
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Reserva no encontrada")

    if trip.status != TripStatus.pendiente:
        return {"mensaje": f"La reserva ya fue {trip.status}"}

    if not (trip.flight_id and trip.hotel_id and trip.vehicle_id):
        raise HTTPException(status_code=400, detail="No se puede generar ticket, faltan datos del viaje")

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

    return {"mensaje": "Reserva aceptada, ticket generado y correo enviado", "ticket_id": ticket.id}



@router.get("/reservas/{trip_id}/rechazar")
def rechazar_reserva(trip_id: str, db: Session = Depends(get_db)):
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Reserva no encontrada")

    if trip.status != TripStatus.pendiente:
        return {"mensaje": f"La reserva ya fue {trip.status}"}

    trip.status = TripStatus.rechazada
    trip.updated_at = datetime.utcnow()
    db.commit()

    # Opcional: enviar notificación por email o registrar log aquí

    return {"mensaje": "Reserva rechazada correctamente"}



@router.get("/confirm-trip")
def confirm_trip(trip_id: str, user_email: str, db: Session = Depends(get_db)):
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


'''
@brief Retrieve a trip by its ID.

@param trip_id The UUID of the trip to retrieve.
@param db Database session dependency.

@throws HTTPException 404 if the trip is not found.

@return The Trip object matching the given ID.
'''
@router.get("/{trip_id}", response_model=TripOut)
def get_trip(trip_id: str, db: Session = Depends(get_db)):
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    return trip

'''
@brief Retrieve all trips belonging to a specific user.

@param user_id The UUID of the user whose trips to retrieve.
@param db Database session dependency.

@return List of Trip objects for the user.
'''
@router.get("/user/{user_id}", response_model=List[TripOut])
def get_user_trips(user_id: str, db: Session = Depends(get_db)):
    trips = db.query(Trip).filter(Trip.user_id == user_id).all()
    return trips

'''
@brief Update an existing trip by its ID.

@param trip_id The UUID of the trip to update.
@param updated_trip Data to update the trip with.
@param db Database session dependency.

@throws HTTPException 404 if the trip is not found.

@note Database commit and refresh are currently disabled (commented out).

@return The updated Trip object (changes not saved in DB).
'''
@router.put("/{trip_id}", response_model=TripOut)
def update_trip(trip_id: str, updated_trip: TripCreate, db: Session = Depends(get_db)):
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    for key, value in updated_trip.model_dump().items():
        setattr(trip, key, value)

    # Database commit and refresh are disabled
    # db.commit()
    # db.refresh(trip)
    return trip

'''
@brief Delete a trip by its ID.

@param trip_id The UUID of the trip to delete.
@param db Database session dependency.

@throws HTTPException 404 if the trip is not found.

@note Database deletion and commit are currently disabled (commented out).

@return Dictionary with success message.
'''
@router.delete("/{trip_id}", response_model=dict)
def delete_trip(trip_id: str, db: Session = Depends(get_db)):
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    # Database deletion is disabled
    # db.delete(trip)
    # db.commit()
    return {"detail": "Trip deleted successfully"}
