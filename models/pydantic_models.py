
from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Any, List

class FlightSegment(BaseModel):   
    departure: dict[str, Any]
    arrival: dict[str, Any]
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
    return_date: Optional[str] = None  # <--- esto es clave
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








class HotelAddress(BaseModel):
    cityName: Optional[str]
    countryCode: Optional[str]
    lines: Optional[List[str]]

class HotelGeoCode(BaseModel):
    latitude: float
    longitude: float

class Hotel(BaseModel):
    hotelId: str
    name: str
    address: HotelAddress
    geoCode: HotelGeoCode
    rating: Optional[str]
    amenities: Optional[List[str]]

class HotelSearchQuery(BaseModel):
    city_code: str
    check_in_date: str
    check_out_date: str
    adults: int = 1
    radius: Optional[int] = 50  # en kilómetros
    radius_unit: Optional[str] = "KM"
    hotel_source: Optional[str] = "ALL"
    payment_policy: Optional[str] = None
    include_closed: Optional[bool] = False
    best_rate_only: Optional[bool] = True
    view: Optional[str] = "FULL"
    sort: Optional[str] = "PRICE"

class HotelSearchResponse(BaseModel):
    success: bool
    hotels: List[Hotel]
    count: int
    currency: str