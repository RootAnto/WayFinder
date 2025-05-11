from fastapi import APIRouter, HTTPException
from amadeus import Client, ResponseError
from models.amadeus_pydantic.flight import (
        FlightSearchQuery,
        FlightSearchResponse,
        FlightOffer,
        FlightPrice,
        FlightItinerary,
        FlightSegment
    )

amadeus = Client(
    client_id='GIsfA7oZrgp2EvhFPAOxZec3BNbb3glg',
    client_secret='0Bf6uymrGEPfB2Vr'
)

router = APIRouter(
    tags=["Flights"],
     responses={
        200: {"description": "Request completed successfully"},
        400: {"description": "Bad request due to invalid parameters"},
        500: {"description": "Internal server error"},
    },
)

@router.post("/flight-search", response_model=FlightSearchResponse)
async def search_flights(query: FlightSearchQuery) -> FlightSearchResponse:
    try:
        params = {
            "originLocationCode": query.originLocationCode,
            "destinationLocationCode": query.destinationLocationCode,
            "departureDate": query.departureDate,
            "returnDate": query.returnDate,
            "adults": query.adults,
            "max": query.max
        }

        response = amadeus.shopping.flight_offers_search.get(**params)

        results = []
        for offer in response.data:
            itineraries = []
            for itinerary in offer['itineraries']:
                segments = []
                for segment in itinerary['segments']:
                    segments.append(FlightSegment(
                        departureAirport=segment['departure']['iataCode'],
                        departureTime=segment['departure']['at'],
                        arrivalAirport=segment['arrival']['iataCode'],
                        arrivalTime=segment['arrival']['at'],
                        carrierCode=segment['carrierCode'],
                        flightNumber=segment['number'],
                        aircraftCode=segment.get('aircraft', {}).get('code'),
                        duration=segment['duration']
                    ))
                itineraries.append(FlightItinerary(
                    duration=itinerary['duration'],
                    segments=segments
                ))

            price = FlightPrice(
                total=offer['price']['total'],
                currency=offer['price']['currency']
            )

            results.append(FlightOffer(
                id=offer['id'],
                source=offer['source'],
                price=price,
                itineraries=itineraries
            ))

        return FlightSearchResponse(
            success=True,
            offers=results,
            count=len(results),
            currency=results[0].price.currency if results else "EUR"
        )

    except ResponseError as error:
        raise HTTPException(
            status_code=400,
            detail=f"Error en la API de Amadeus: {str(error)}"
        )
    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Error interno al buscar vuelos: {str(error)}"
        )
