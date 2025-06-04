from pydantic import BaseModel, Field
from typing import List, Optional
from app.models.amadeus_pydantic.flight import FlightOffer
from app.models.amadeus_pydantic.hotel import HotelInfo
from app.models.amadeus_pydantic.vehicle import VehicleInfo


class TripSearchQuery(BaseModel):
    '''
    @class TripSearchQuery
    @brief Query parameters to search for flights, hotels, and vehicles for a trip.

    @var originLocationCode
    Origin location code (IATA).

    @var destinationLocationCode
    Destination location code (IATA).

    @var departureDate
    Departure date (YYYY-MM-DD).

    @var returnDate
    Optional return date (YYYY-MM-DD).

    @var cityCode
    City code for hotel search.

    @var vehicleLocation
    City code for vehicle rental search.

    @var checkInDate
    Hotel check-in date.

    @var checkOutDate
    Hotel check-out date.

    @var adults
    Number of adults.

    @var max
    Maximum number of flight results.

    @var hotelLimit
    Maximum number of hotel results.

    @var vehicleLimit
    Maximum number of vehicle results.

    @var defaultHotelPrice
    Default price per night for hotels.
    '''
    originLocationCode: str = Field(default="MAD", description="Origin location code (IATA)")
    destinationLocationCode: str = Field(default="BCN", description="Destination location code (IATA)")
    departureDate: str = Field(default="2025-08-01", description="Departure date (YYYY-MM-DD)")
    returnDate: Optional[str] = Field(default="2025-08-07", description="Return date (YYYY-MM-DD)")

    cityCode: str = Field(default="BCN", description="City code for hotel search")
    vehicleLocation: str = Field(default="BCN", description="City code for vehicle rental search")

    checkInDate: str = Field(default="2025-08-01", description="Hotel check-in date")
    checkOutDate: str = Field(default="2025-08-07", description="Hotel check-out date")

    adults: int = Field(default=1, ge=1, description="Number of adults")
    max: int = Field(default=5, ge=1, description="Maximum number of flight results")
    hotelLimit: int = Field(default=5, ge=1, description="Maximum number of hotel results")
    vehicleLimit: int = Field(default=5, ge=1, description="Maximum number of vehicle results")

    defaultHotelPrice: float = Field(default=100.0, ge=0, description="Default hotel price per night")


class TripCostSummary(BaseModel):
    '''
    @class TripCostSummary
    @brief Summary of total costs for flights, hotels, and vehicle rentals.

    @var flightTotal
    Total flight cost.

    @var hotelTotal
    Total hotel accommodation cost.

    @var vehicleTotal
    Total vehicle rental cost.

    @var currency
    Currency used (e.g., EUR).

    @var grandTotal
    Total trip cost (flights + hotels + vehicles).
    '''
    flightTotal: float = Field(..., ge=0, description="Total flight cost")
    hotelTotal: float = Field(..., ge=0, description="Total hotel accommodation cost")
    vehicleTotal: float = Field(..., ge=0, description="Total vehicle rental cost")
    currency: str = Field(..., description="Currency used (e.g., EUR)")
    grandTotal: float = Field(..., ge=0, description="Total trip cost (flights + hotel + vehicle)")


class TripSearchResponse(BaseModel):
    '''
    @class TripSearchResponse
    @brief Response model containing lists of flight offers, hotels, vehicles, and a cost summary.

    @var flights
    List of flight offers.

    @var hotels
    List of available hotels.

    @var vehicles
    List of available vehicles.

    @var summary
    Summary of trip costs.
    '''
    flights: List[FlightOffer] = Field(..., description="List of flight offers")
    hotels: List[HotelInfo] = Field(..., description="List of available hotels")
    vehicles: List[VehicleInfo] = Field(..., description="List of available vehicles")
    summary: TripCostSummary = Field(..., description="Summary of trip costs")
