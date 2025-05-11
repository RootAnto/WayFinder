from fastapi import APIRouter, HTTPException
from amadeus import Client, ResponseError
from models.amadeus_pydantic.hotel import (
    HotelSearchQuery,
    HotelSearchResponse,
    HotelInfo
)
from datetime import datetime

amadeus = Client(
    client_id='GIsfA7oZrgp2EvhFPAOxZec3BNbb3glg',
    client_secret='0Bf6uymrGEPfB2Vr'
)

router = APIRouter(
    tags=["Hotels"],
     responses={
        200: {"description": "Request completed successfully"},
        400: {"description": "Bad request due to invalid parameters"},
        500: {"description": "Internal server error"},
    },
)

@router.post("/hotel-search", response_model=HotelSearchResponse)
async def search_hotels(query: HotelSearchQuery) -> HotelSearchResponse:
    """
    Search for hotels by city code using the Amadeus API.

    You must provide at least the `cityCode` parameter.

    - **cityCode**: IATA city code (e.g. 'MAD' for Madrid)
    - **checkInDate**: Optional check-in date (not used directly)
    - **checkOutDate**: Optional check-out date (not used directly)
    - **radius**: Optional search radius (not used in city search)
    - **limit**: Maximum number of hotels to return (default is 10)
    - **defaultPrice**: Default price to assign if not provided (default is 100)
    - **nights**: Calculated from checkInDate and checkOutDate
    """
    try:
        # Ensure cityCode is provided
        if not query.cityCode:
            raise HTTPException(
                status_code=400,
                detail="The 'cityCode' parameter is required"
            )

        # Parse checkInDate and checkOutDate
        check_in = datetime.strptime(query.checkInDate, "%Y-%m-%d") \
            if query.checkInDate else None
        check_out = datetime.strptime(query.checkOutDate, "%Y-%m-%d") \
            if query.checkOutDate else None

        # Calculate nights if both dates are provided
        nights = (check_out - check_in).days if check_in and check_out else None

        # Fetch hotel data from Amadeus API
        response = amadeus.reference_data.locations.hotels.by_city.get(
            cityCode=query.cityCode
        )

        hotels = []
        max_results = query.limit or 10
        price = query.defaultPrice or 100.0

        # Prepare the hotel data for response
        for hotel in response.data[:max_results]:
            hotels.append(HotelInfo(
                hotelId=hotel.get('hotelId', ''),
                name=hotel.get('name', ''),
                cityCode=hotel.get('cityCode', ''),
                latitude=hotel.get('geoCode', {}).get('latitude', 0.0),
                longitude=hotel.get('geoCode', {}).get('longitude', 0.0),
                available=True,
                price=price,
                currency="EUR",
                nights=nights  # Include calculated nights
            ))

        # Return the hotel search response
        return HotelSearchResponse(
            data=hotels,
            count=len(hotels)
        )

    except ResponseError as error:
        raise HTTPException(
            status_code=400,
            detail=f"Amadeus API error: {str(error)}"
        )
    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Internal error while searching hotels: {str(error)}"
        )