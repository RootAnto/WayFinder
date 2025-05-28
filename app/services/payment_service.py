from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from controller.payments.payments import create_payment_intent_from_trip
from database.db import get_db

router = APIRouter(prefix="/payments", tags=["Payments"])

@router.post("/payment-intent")
def payment_intent_endpoint(trip_id: str, db: Session = Depends(get_db)):
    client_secret = create_payment_intent_from_trip(trip_id, db)
    return {"client_secret": client_secret}