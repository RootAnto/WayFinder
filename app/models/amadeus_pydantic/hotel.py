from pydantic import BaseModel, Field
from typing import List, Optional

class HotelSearchQuery(BaseModel):
    '''
    @class HotelSearchQuery
    @brief Query parameters for searching hotels.

    @var cityCode
    City code (IATA or internal standard).

    @var radius
    Search radius in kilometers from the city center.

    @var checkInDate
    Hotel check-in date (format YYYY-MM-DD).

    @var checkOutDate
    Hotel check-out date (format YYYY-MM-DD).

    @var limit
    Maximum number of hotel results to return.

    @var defaultPrice
    Estimated base price per night to filter results.
    '''
    cityCode: str = Field(default='MAD', description="City code (IATA or internal standard)")
    radius: int = Field(default=10, description="Search radius in kilometers from the city center")
    checkInDate: str = Field(default='2025-08-01', description="Hotel check-in date (format YYYY-MM-DD)")
    checkOutDate: str = Field(default='2025-08-07', description="Hotel check-out date (format YYYY-MM-DD)")
    limit: int = Field(default=10, description="Maximum number of hotel results to return")
    defaultPrice: float = Field(default=100.0, description="Estimated base price per night to filter results")


class HotelInfo(BaseModel):
    '''
    @class HotelInfo
    @brief Information about a hotel returned in the search results.

    @var hotelId
    Unique identifier for the hotel.

    @var name
    Name of the hotel.

    @var cityCode
    City code where the hotel is located.

    @var available
    Indicates if rooms are available.

    @var price
    Estimated total price for the stay.

    @var currency
    Currency code of the price, e.g., 'EUR'.

    @var nights
    Total number of nights of the stay.
    '''
    hotelId: str = Field(..., description="Unique identifier for the hotel")
    name: str = Field(..., description="Name of the hotel")
    cityCode: str = Field(..., description="City code where the hotel is located")
    available: bool = Field(default=True, description="Indicates if rooms are available")
    price: float = Field(..., description="Estimated total price for the stay")
    currency: str = Field(..., description="Currency code of the price, e.g., 'EUR'")
    nights: int = Field(..., description="Total number of nights of the stay")


class HotelSearchResponse(BaseModel):
    '''
    @class HotelSearchResponse
    @brief Response model for hotel search containing list of hotels found.

    @var data
    List of hotels found.

    @var count
    Total number of hotels found.
    '''
    data: List[HotelInfo] = Field(..., description="List of hotels found")
    count: int = Field(..., description="Total number of hotels found")
