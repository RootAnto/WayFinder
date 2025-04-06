
from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Any, List

class FlightSegment(BaseModel):
    departure: dict
    arrival: dict
    airline: str
    flight_number: str
    duration: str
    aircraft: str

class FlightItinerary(BaseModel):
    segments: list[FlightSegment]
    total_duration: str

class FlightPrice(BaseModel):
    total: str
    currency: str
    base: str

class FlightOffer(BaseModel):
    id: str
    price: FlightPrice
    outbound: FlightItinerary
    return_trip: Optional[FlightItinerary] = None
    cabin: str
    airline: str
    remaining_seats: int

class FlightSearchQuery(BaseModel):
    origin: str
    destination: str
    departure_date: str
    return_date: Optional[str] = None
    adults: int = 0
    children: int = 0
    infants: int = 0
    travel_class: Optional[str] = None
    non_stop: bool = False
    max_results: int = 0

class FlightSearchResponse(BaseModel):
    success: bool
    offers: list[FlightOffer]
    count: int
    currency: str
