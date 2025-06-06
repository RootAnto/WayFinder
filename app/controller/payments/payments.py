import stripe
from sqlalchemy.orm import Session
from app.database.db import get_db
from app.models.trips.trip_db import Trip
from app.models.trips.trip_pydantic import TripStatus
from fastapi import HTTPException
from loguru import logger
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.config import settings

stripe.api_key = settings.STRIPE_SECRET_KEY

router = APIRouter()

@router.post("/payments/payment-intent")
def payment_intent(trip_id: str, db: Session = Depends(get_db)):
    try:
        client_secret = create_payment_intent_from_trip(trip_id, db)
        return {"client_secret": client_secret}
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


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