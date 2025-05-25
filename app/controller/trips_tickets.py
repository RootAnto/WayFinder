from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from models.trips.trip_pydantic import TripCreate, TripOut
from models.trips.trip_db import Trip
from database.db import get_db
from typing import List
import uuid

router = APIRouter(prefix="/trips", tags=["Trips"])


# ✅ Crear un nuevo viaje
@router.post("/", response_model=TripOut)
def create_trip(trip: TripCreate, db: Session = Depends(get_db)):
    trip_id = str(uuid.uuid4())
    db_trip = Trip(id=trip_id, **trip.model_dump())
    #db.add(db_trip)
    #db.commit()
    #db.refresh(db_trip)
    return db_trip


# ✅ Obtener un viaje por ID
@router.get("/{trip_id}", response_model=TripOut)
def get_trip(trip_id: str, db: Session = Depends(get_db)):
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    return trip


# ✅ Obtener todos los viajes de un usuario
@router.get("/user/{user_id}", response_model=List[TripOut])
def get_user_trips(user_id: str, db: Session = Depends(get_db)):
    trips = db.query(Trip).filter(Trip.user_id == user_id).all()
    return trips


# ✅ Actualizar un viaje
def update_trip(trip_id: str, updated_trip: TripCreate, db: Session = Depends(get_db)):
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    for key, value in updated_trip.model_dump().items():
        setattr(trip, key, value)

    db.commit()
    db.refresh(trip)
    return trip


# ✅ Eliminar un viaje
@router.delete("/{trip_id}", response_model=dict)
def delete_trip(trip_id: str, db: Session = Depends(get_db)):
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    db.delete(trip)
    db.commit()
    return {"detail": "Trip deleted successfully"}
