from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, date

# Modelo para crear un viaje
class TripCreate(BaseModel):
    user_id: str  # UID de Firebase
    origin: str
    destination: str
    departure_date: date
    return_date: Optional[date] = None
    adults: int = 1
    children: int = 0
    hotel_limit: Optional[int] = 5
    vehicle_limit: Optional[int] = 5
    max_price: Optional[float] = None

# Modelo para salida de un viaje, con IDs adicionales (vuelo, hotel, vehículo)
class TripOut(TripCreate):
    id: str  # UUID como string
    flight_id: Optional[str] = None
    hotel_id: Optional[str] = None
    vehicle_id: Optional[str] = None

    class Config:
        orm_mode = True

# Modelo para crear un billete
class TicketCreate(BaseModel):
    ticket_id: Optional[str] = None
    userId: str
    tripId: str
    issueDate: datetime
    seat_number: Optional[str] = None
    price: Optional[float] = None
    currency: Optional[str] = "USD"
    status: Optional[str] = "issued"
    issue_place: Optional[str] = None
    valid_until: Optional[datetime] = None
    passenger_name: Optional[str] = None
    additional_info: Optional[str] = None

# Opcional: Modelo para salida de un billete si necesitas uno (puede heredar TicketCreate)
class TicketOut(TicketCreate):
    id: str  # ID único del billete

    class Config:
        orm_mode = True
