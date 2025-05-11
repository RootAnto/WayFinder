from pydantic import BaseModel
from typing import List, Optional

class HotelSearchQuery(BaseModel):
    cityCode: Optional[str] = 'MAD'
    radius: Optional[int] = 10
    checkInDate: Optional[str] = '2025-08-01'
    checkOutDate: Optional[str] = '2025-08-07'
    limit: Optional[int] = 10
    defaultPrice: Optional[float] = 100.0

class HotelInfo(BaseModel):
    hotelId: str
    name: str
    cityCode: str
    available: Optional[bool]
    price: Optional[float]
    currency: Optional[str]
    nights: Optional[int]

class HotelSearchResponse(BaseModel):
    data: List[HotelInfo]
    count: int