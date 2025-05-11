from pydantic import BaseModel
from typing import List

class TripCreate(BaseModel):
    userId: str
    flightId: str
    hotelId: str
    vehicleId: str

class TripOut(BaseModel):
    id: str
    userId: str
    flightId: str
    hotelId: str
    vehicleId: str
