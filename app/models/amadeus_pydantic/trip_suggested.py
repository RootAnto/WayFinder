from pydantic import BaseModel
from typing import List, Optional
from models.amadeus_pydantic.flight import FlightOffer
from models.amadeus_pydantic.hotel import HotelInfo
from models.amadeus_pydantic.vehicle import VehicleInfo


class TripSearchQuery(BaseModel):
    originLocationCode: Optional[str] = "MAD"
    destinationLocationCode: Optional[str] = "BCN"
    departureDate: Optional[str] = "2025-08-01"
    returnDate: Optional[str] = "2025-08-07"
    cityCode: Optional[str] = "BCN"
    vehicleLocation: Optional[str] = "BCN"
    checkInDate: Optional[str] = "2025-08-01"
    checkOutDate: Optional[str] = "2025-08-07"
    adults: Optional[int] = 1
    max: Optional[int] = 5
    hotelLimit: Optional[int] = 5
    vehicleLimit: Optional[int] = 5
    defaultHotelPrice: Optional[float] = 100.0


class TripCostSummary(BaseModel):
    flightTotal: float
    hotelTotal: float
    vehicleTotal: float
    currency: str
    grandTotal: float


class TripSearchResponse(BaseModel):
    flights: List[FlightOffer]
    hotels: List[HotelInfo]
    vehicles: List[VehicleInfo]
    summary: TripCostSummary