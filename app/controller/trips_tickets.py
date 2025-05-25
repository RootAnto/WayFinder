from fastapi import APIRouter, HTTPException, Depends
from pydantic import EmailStr
from sqlalchemy.orm import Session
from services.email_service import send_confirmation_email
from models.trips.trip_pydantic import TripCreate, TripOut
from models.trips.trip_db import Trip
from database.db import get_db
from typing import List, Optional
import uuid
from fastapi import Query
router = APIRouter(prefix="/trips", tags=["Trips"])

'''
@brief Create a new trip with a unique UUID.

@param trip Data for the new trip.
@param db Database session dependency.

@note Database insertion is currently disabled (commented out).

@return The newly created Trip object (not saved in DB).
'''

@router.post("/", response_model=TripOut)
def create_trip(
    trip: TripCreate,
    user_email: EmailStr = Query(...),
    user_name: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    trip_id = str(uuid.uuid4())
    trip_data = trip.model_dump()
    trip_data.pop("user_email", None)  # Evitar pasar user_email
    trip_data.pop("user_name", None)   # Evitar pasar user_name

    db_trip = Trip(id=trip_id, **trip_data)

    # db.add(db_trip)
    # db.commit()
    # db.refresh(db_trip)

    send_confirmation_email(
        to_email=user_email,
        to_name=user_name,
        trip=db_trip
    )
    return db_trip

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
