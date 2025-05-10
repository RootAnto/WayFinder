from pydantic import BaseModel
from typing import List, Optional

class VehicleSearchQuery(BaseModel):
    location: Optional[str] = 'MAD'
    pickUpDate: Optional[str] = '2025-08-01'
    dropOffDate: Optional[str] = '2025-08-07'
    vehicleType: Optional[str] = "economy"
    limit: Optional[int] = 10
    defaultPrice: Optional[float] = 50.0


class VehicleInfo(BaseModel):
    vehicleId: str
    name: str
    cityCode: str
    available: Optional[bool]
    pricePerDay: Optional[float]
    currency: Optional[str]
    vehicleType: Optional[str]
    brand: Optional[str]
    model: Optional[str]
    year: Optional[int]
    seats: Optional[int]
    doors: Optional[int]
    transmission: Optional[str]
    fuelType: Optional[str]


class VehicleSearchResponse(BaseModel):
    data: List[VehicleInfo]
    count: int
