from fastapi import APIRouter, HTTPException
from amadeus import Client, ResponseError
from datetime import datetime
import random
from models.automatic_model_travel import TripSearchQuery, TripSearchResponse, TripCostSummary
from models.pydantic_model_hotel import HotelInfo
from models.pydantic_model_vehicle import VehicleInfo
from models.pydantic_models import FlightOffer, FlightSegment, FlightItinerary, FlightPrice

router = APIRouter(
    prefix="/trip-search",
    tags=["Trip Search"],
    responses={
        200: {"description": "Trip search completed successfully"},
        400: {"description": "Bad request due to invalid parameters"},
        500: {"description": "Internal server error"},
    },
)

amadeus = Client(
    client_id="GIsfA7oZrgp2EvhFPAOxZec3BNbb3glg",
    client_secret="0Bf6uymrGEPfB2Vr"
)


@router.post("/trip-search", response_model=TripSearchResponse)
async def search_trip(query: TripSearchQuery) -> TripSearchResponse:
    """
    Combined search for flights, hotels, and vehicles based on trip parameters.

    Default values will be used if specific inputs are not provided.

    Returns:
        TripSearchResponse: Includes lists of flights, hotels, vehicles,
        and a total cost summary.
    """
    try:
        # ------------------------ FLIGHT SEARCH ------------------------
        flight_params = {
            "originLocationCode": query.originLocationCode,
            "destinationLocationCode": query.destinationLocationCode,
            "departureDate": query.departureDate,
            "returnDate": query.returnDate,
            "adults": query.adults,
            "max": query.max
        }

        flight_response = amadeus.shopping.flight_offers_search.get(
            **flight_params
        )

        flight_offers = []
        total_flight_price = 0.0

        for offer in flight_response.data:
            itineraries = []
            for itinerary in offer['itineraries']:
                segments = [
                    FlightSegment(
                        departureAirport=seg['departure']['iataCode'],
                        departureTime=seg['departure']['at'],
                        arrivalAirport=seg['arrival']['iataCode'],
                        arrivalTime=seg['arrival']['at'],
                        carrierCode=seg['carrierCode'],
                        flightNumber=seg['number'],
                        aircraftCode=seg.get('aircraft', {}).get('code'),
                        duration=seg['duration']
                    )
                    for seg in itinerary['segments']
                ]
                itineraries.append(FlightItinerary(
                    duration=itinerary['duration'],
                    segments=segments
                ))

            price = FlightPrice(
                total=offer['price']['total'],
                currency=offer['price']['currency']
            )
            total_flight_price += float(price.total)

            flight_offers.append(FlightOffer(
                id=offer['id'],
                source=offer['source'],
                price=price,
                itineraries=itineraries
            ))

        currency = flight_offers[0].price.currency if flight_offers else "EUR"

        # ------------------------ HOTEL SEARCH ------------------------
        check_in = datetime.strptime(query.checkInDate, "%Y-%m-%d")
        check_out = datetime.strptime(query.checkOutDate, "%Y-%m-%d")
        nights = (check_out - check_in).days

        hotel_response = amadeus.reference_data.locations.hotels.by_city.get(
            cityCode=query.cityCode
        )

        hotels = []
        total_hotel_price = 0.0

        for h in hotel_response.data[:query.hotelLimit]:
            price = query.defaultHotelPrice * nights
            total_hotel_price += price
            hotels.append(HotelInfo(
                hotelId=h.get('hotelId', ''),
                name=h.get('name', ''),
                cityCode=h.get('cityCode', query.cityCode),
                latitude=h.get('geoCode', {}).get('latitude', 0.0),
                longitude=h.get('geoCode', {}).get('longitude', 0.0),
                available=True,
                price=price,
                currency=currency,
                nights=nights
            ))

        # ------------------------ VEHICLE SEARCH ------------------------
        city_vehicles = {
            "MAD": [("SEAT", "Ibiza"), ("Renault", "Clio"), ("BMW", "X1")],
            "BCN": [("Ford", "Focus"), ("Volkswagen", "Golf"), ("Tesla", "Model 3")],
            "PAR": [("Peugeot", "208"), ("Citroën", "C3"), ("Mercedes", "A-Class")]
        }
        vehicle_brands = city_vehicles.get(
            query.vehicleLocation.upper(), [("Toyota", "Corolla")]
        )

        vehicles = []
        total_vehicle_price = 0.0
        for i in range(query.vehicleLimit):
            brand, model = random.choice(vehicle_brands)
            price = round(random.uniform(30, 100), 2) * nights
            total_vehicle_price += price

            vehicles.append(VehicleInfo(
                vehicleId=f"{query.vehicleLocation[:3]}-{i+1:03d}",
                name=f"{brand} {model}",
                cityCode=query.vehicleLocation,
                available=True,
                pricePerDay=price / nights,
                currency=currency,
                vehicleType="economy",
                brand=brand,
                model=model,
                year=random.randint(2019, 2024),
                seats=5,
                doors=4,
                transmission=random.choice(["Manual", "Automatic"]),
                fuelType=random.choice(["Gasoline", "Electric"])
            ))

        grand_total = total_flight_price + total_hotel_price + total_vehicle_price

        summary = TripCostSummary(
            flightTotal=round(total_flight_price, 2),
            hotelTotal=round(total_hotel_price, 2),
            vehicleTotal=round(total_vehicle_price, 2),
            currency=currency,
            grandTotal=round(grand_total, 2)
        )

        return TripSearchResponse(
            flights=flight_offers,
            hotels=hotels,
            vehicles=vehicles,
            summary=summary
        )

    except ResponseError as error:
        raise HTTPException(
            status_code=400,
            detail=f"Amadeus API error: {str(error)}"
        )
    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Internal error: {str(error)}"
        )
