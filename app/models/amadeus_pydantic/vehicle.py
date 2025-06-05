from pydantic import BaseModel, Field
from typing import List, Optional


class VehicleSearchQuery(BaseModel):
    '''
    @class VehicleSearchQuery
    @brief Parameters to query available rental vehicles.

    @var location
    Location code for vehicle pick-up (e.g., IATA code).

    @var pickUpDate
    Vehicle pick-up date (YYYY-MM-DD).

    @var dropOffDate
    Vehicle drop-off date (YYYY-MM-DD).

    @var vehicleType
    Desired vehicle type (economy, SUV, etc.).

    @var limit
    Maximum number of results to return.

    @var defaultPrice
    Estimated daily price to filter results.
    '''
    location: str = Field(default='MAD', description="Location code for vehicle pick-up (e.g., IATA code)")
    pickUpDate: str = Field(default='2025-08-01', description="Vehicle pick-up date (YYYY-MM-DD)")
    dropOffDate: str = Field(default='2025-08-07', description="Vehicle drop-off date (YYYY-MM-DD)")
    vehicleType: Optional[str] = Field(default="economy", description="Desired vehicle type (economy, SUV, etc.)")
    limit: int = Field(default=10, description="Maximum number of results to return")
    defaultPrice: float = Field(default=50.0, description="Estimated daily price to filter results")


class VehicleInfo(BaseModel):
    '''
    @class VehicleInfo
    @brief Information about a rental vehicle.

    @var vehicleId
    Unique identifier of the vehicle.

    @var name
    Commercial name of the vehicle.

    @var cityCode
    City code where the vehicle is located.

    @var available
    Indicates if the vehicle is available.

    @var pricePerDay
    Price per day for renting the vehicle.

    @var currency
    Currency of the price (e.g., EUR, USD).

    @var vehicleType
    Vehicle type (economy, SUV, etc.).

    @var brand
    Brand of the vehicle.

    @var model
    Model of the vehicle.

    @var year
    Model year.

    @var seats
    Number of seats.

    @var doors
    Number of doors.

    @var transmission
    Transmission type (manual, automatic).

    @var fuelType
    Fuel type (gasoline, diesel, electric).
    '''
    vehicleId: str = Field(..., description="Unique identifier of the vehicle")
    name: str = Field(..., description="Commercial name of the vehicle")
    cityCode: str = Field(..., description="City code where the vehicle is located")
    available: bool = Field(default=True, description="Indicates if the vehicle is available")
    pricePerDay: float = Field(..., description="Price per day for renting the vehicle")
    currency: str = Field(..., description="Currency of the price (e.g., EUR, USD)")
    vehicleType: Optional[str] = Field(None, description="Vehicle type (economy, SUV, etc.)")
    brand: Optional[str] = Field(None, description="Brand of the vehicle")
    model: Optional[str] = Field(None, description="Model of the vehicle")
    year: Optional[int] = Field(None, description="Model year")
    seats: Optional[int] = Field(None, description="Number of seats")
    doors: Optional[int] = Field(None, description="Number of doors")
    transmission: Optional[str] = Field(None, description="Transmission type (manual, automatic)")
    fuelType: Optional[str] = Field(None, description="Fuel type (gasoline, diesel, electric)")


class VehicleSearchResponse(BaseModel):
    '''
    @class VehicleSearchResponse
    @brief Response containing a list of available rental vehicles.

    @var data
    List of available vehicles.

    @var count
    Total number of vehicles found.
    '''
    data: List[VehicleInfo] = Field(..., description="List of available vehicles")
    count: int = Field(..., description="Total number of vehicles found")
