import stripe
from sqlalchemy.orm import Session
from app.database.db import get_db
from app.models.trips.trip_db import Trip
from app.models.trips.trip_pydantic import TripStatus
from fastapi import HTTPException
from loguru import logger
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

stripe.api_key = "sk_test_51RTl1TQdIRsrFscj0OC26WaAxd6HpzFhYkz98Ka3sp8Ae7s4G1SHXwupDBqBCBM7jrRScxNWRUr8F5agzOBt2OeE00QE4O6Xej"

router = APIRouter()

@router.post("/payments/payment-intent")
def payment_intent(trip_id: str, db: Session = Depends(get_db)):
    '''
    @brief Creates a Stripe PaymentIntent for a given trip.

    @param trip_id The ID of the trip for which the payment intent is created.
    @param db SQLAlchemy database session.
    @return A dictionary containing the Stripe client secret for frontend payment processing.

    This endpoint validates the trip and uses its total price and currency
    to create a Stripe PaymentIntent. It returns the `client_secret` that
    can be used on the client-side to complete the payment process.
    '''
    try:
        client_secret = create_payment_intent_from_trip(trip_id, db)
        return {"client_secret": client_secret}
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


def create_payment_intent_from_trip(trip_id: str, db: Session) -> str:
    '''
    @brief Helper function to create a Stripe PaymentIntent for a trip.

    @param trip_id The ID of the trip.
    @param db SQLAlchemy database session.
    @return The Stripe client secret for the created PaymentIntent.

    This function retrieves the trip from the database, checks its status,
    and creates a PaymentIntent using Stripe API with trip price and currency.
    '''
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