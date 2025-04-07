# controllers/trips.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database.db import SessionLocal
from models.pydantic_models import Travel

# Router travel
router = APIRouter(
    prefix="/travel",
    tags=["travel"],
    responses={404: {"description": "Not found"}},
)

# Function to get the database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Get all travels
@router.get("/")
def get_trips(db: Session = Depends(get_db)):
    viajes = db.query(Travel).all()
    return viajes

# Create a new travel
@router.post("/")
def create_tip(viaje: Travel, db: Session = Depends(get_db)):
    db.add(viaje)
    db.commit()
    db.refresh(viaje)
    return viaje
