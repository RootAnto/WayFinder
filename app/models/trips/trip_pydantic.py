from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import date

class TripCreate(BaseModel):
    user_id: str  # UID de Firebase
    origin: str
    destination: str
    departure_date: date
    return_date: Optional[date]
    adults: int = 1
    children: int = 0
    hotel_limit: Optional[int] = 5
    vehicle_limit: Optional[int] = 5
    max_price: Optional[float] = None
    user_email: Optional[EmailStr] = None
    user_name: Optional[str] = None

class TripOut(TripCreate):
    id: str  # UUID como string
    flight_id: Optional[str]
    hotel_id: Optional[str]
    vehicle_id: Optional[str]

    class Config:
        orm_mode = True

