from pydantic import BaseModel
from typing import List, Optional
from models.pydantics_models.flight_pydantic_models import FlightOffer
from models.pydantics_models.hotel_pydantic_model import HotelInfo
from models.pydantics_models.vehicle_pydantic_model import VehicleInfo


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