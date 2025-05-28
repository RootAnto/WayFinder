import stripe
from sqlalchemy.orm import Session
from models.trips.trip_db import Trip
from models.trips.trip_pydantic import TripStatus
from fastapi import HTTPException
from loguru import logger

stripe.api_key = "pk_test_51RTl1TQdIRsrFscjY4XaBinOjkD3hFJj7mUDNw8X6pWe7QX2KarXDGb99DgldUcvng2RESJra3vjjlpDUyaMiIKN00RZKTO68m"

def create_payment_intent_from_trip(trip_id: str, db: Session) -> str:
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Reserva no encontrada")

    if trip.status in [TripStatus.aceptada, TripStatus.rechazada]:
        logger.info(f"No se puede confirmar pago para reserva {trip_id} con estado {trip.status}")
        return {"mensaje": f"La reserva ya fue {trip.status.value}"}

    intent = stripe.PaymentIntent.create(
        amount=int(trip.total_price * 100),
        currency=trip.currency,
        metadata={"trip_id": trip.id},
        payment_method_types=["card"]
    )
    return intent.client_secret
