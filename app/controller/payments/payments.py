import stripe
from sqlalchemy.orm import Session
from app.models.trips.trip_db import Trip
from app.models.trips.trip_pydantic import TripStatus
from fastapi import HTTPException
from loguru import logger

stripe.api_key = "sk_test_51RTl1TQdIRsrFscj0OC26WaAxd6HpzFhYkz98Ka3sp8Ae7s4G1SHXwupDBqBCBM7jrRScxNWRUr8F5agzOBt2OeE00QE4O6Xej"

def create_payment_intent_from_trip(trip_id: str, db: Session) -> str:
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Reserva no encontrada")

    if trip.status in [TripStatus.aceptada, TripStatus.rechazada]:
        logger.info(f"No se puede confirmar pago para reserva {trip_id} con estado {trip.status}")
        raise HTTPException(status_code=400, detail=f"La reserva ya fue {trip.status.value}")

    intent = stripe.PaymentIntent.create(
        amount=int(trip.total_price * 100),
        currency=trip.currency,
        metadata={"trip_id": trip.id},
        payment_method_types=["card"]
    )

    return intent.client_secret