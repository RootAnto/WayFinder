from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from models.trips.trip_pydantic import TripCreate, TripOut
from models.trips.trip_db import Trip
from database.db import get_db
import uuid

router = APIRouter(prefix="/trips", tags=["Trips"])

@router.post("/", response_model=TripOut)
def create_trip(trip: TripCreate, db: Session = Depends(get_db)):
    trip_id = str(uuid.uuid4())
    db_trip = Trip(id=trip_id, **trip.dict())
    db.add(db_trip)
    db.commit()
    db.refresh(db_trip)
    return db_trip
