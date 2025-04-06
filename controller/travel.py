from fastapi import APIRouter, HTTPException
from datetime import datetime
from typing import Optional
from pydantic import BaseModel
from amadeus import Client, ResponseError
import os
from models.pydantic_models import FlightSegment, FlightItinerary, FlightPrice,FlightOffer,FlightSearchQuery,FlightSearchResponse

router = APIRouter()

amadeus = Client(
    client_id= 'TQuma09ZE8fjGSmGMZFfJcIBjiVwJXNi',
    client_secret='X0wgECJpBVvsrhmo'
)



def format_duration(duration_str: str) -> str:
    """Formatea la duración PT7H46M a 7h 46m"""
    hours = duration_str.split('PT')[1].split('H')[0]
    minutes = duration_str.split('H')[1].split('M')[0] if 'H' in duration_str else duration_str.split('PT')[1].split('M')[0]
    return f"{hours}h {minutes}m" if 'H' in duration_str else f"{minutes}m"

def format_date(date_str: str) -> str:
    """Formatea fecha 2025-06-10T22:59:00 a 10 Jun 22:59"""
    dt = datetime.strptime(date_str, '%Y-%m-%dT%H:%M:%S')
    return dt.strftime('%d %b %H:%M')

def process_flight_offers(offers: list) -> list[FlightOffer]:
    processed_offers = []
    
    for offer in offers:
        
        outbound = offer['itineraries'][0]
        return_trip = offer['itineraries'][1] if len(offer['itineraries']) > 1 else None

        
        outbound_segments = []
        for segment in outbound['segments']:
            outbound_segments.append({
                'departure': {
                    'airport': segment['departure']['iataCode'],
                    'terminal': segment['departure'].get('terminal', ''),
                    'datetime': format_date(segment['departure']['at'])
                },
                'arrival': {
                    'airport': segment['arrival']['iataCode'],
                    'terminal': segment['arrival'].get('terminal', ''),
                    'datetime': format_date(segment['arrival']['at'])
                },
                'airline': segment['carrierCode'],
                'flight_number': segment['number'],
                'duration': format_duration(segment['duration']),
                'aircraft': segment['aircraft']['code']
            })
        
        
        return_segments = []
        if return_trip:
            for segment in return_trip['segments']:
                return_segments.append({
                    'departure': {
                        'airport': segment['departure']['iataCode'],
                        'terminal': segment['departure'].get('terminal', ''),
                        'datetime': format_date(segment['departure']['at'])
                    },
                    'arrival': {
                        'airport': segment['arrival']['iataCode'],
                        'terminal': segment['arrival'].get('terminal', ''),
                        'datetime': format_date(segment['arrival']['at'])
                    },
                    'airline': segment['carrierCode'],
                    'flight_number': segment['number'],
                    'duration': format_duration(segment['duration']),
                    'aircraft': segment['aircraft']['code']
                })
        
        
        cabin = offer['travelerPricings'][0]['fareDetailsBySegment'][0]['cabin']
        
        processed_offers.append(FlightOffer(
            id=offer['id'],
            price=FlightPrice(
                total=offer['price']['total'],
                currency=offer['price']['currency'],
                base=offer['price']['base']
            ),
            outbound=FlightItinerary(
                segments=outbound_segments,
                total_duration=format_duration(outbound['duration'])
            ),
            return_trip=FlightItinerary(
                segments=return_segments,
                total_duration=format_duration(return_trip['duration'])
            ) if return_trip else None,
            cabin=cabin.capitalize(),
            airline=offer['validatingAirlineCodes'][0],
            remaining_seats=offer['numberOfBookableSeats']
        ))
    
    return processed_offers


@router.post("/buscarViaje", response_model=FlightSearchResponse)
async def search_flights(query: FlightSearchQuery):
    """
    Busca vuelos disponibles usando la API de Amadeus según los parámetros proporcionados.
    
    Parámetros:
    - origin: Código IATA del aeropuerto de origen (3 letras)
    - destination: Código IATA del aeropuerto de destino (3 letras)
    - departure_date: Fecha de salida (YYYY-MM-DD)
    - return_date: Fecha de regreso (opcional, YYYY-MM-DD)
    - adults: Número de adultos (1-10)
    - children: Número de niños (0-10)
    - infants: Número de infantes (0-10)
    - travel_class: Clase de viaje (ECONOMY, PREMIUM_ECONOMY, BUSINESS, FIRST)
    - non_stop: Solo vuelos directos (True/False)
    - max_results: Máximo número de resultados (1-50)
    """
    try:
        
        params = {
            'originLocationCode': query.origin.upper(),
            'destinationLocationCode': query.destination.upper(),
            'departureDate': query.departure_date,
            'adults': query.adults,
            'children': query.children,
            'infants': query.infants,
            'max': min(query.max_results, 50)  
        }
        

        if query.return_date:
            params['returnDate'] = query.return_date
        if query.travel_class:
            params['travelClass'] = query.travel_class.upper()
        if query.non_stop:
            params['nonStop'] = 'true'

        response = amadeus.shopping.flight_offers_search.get(**params)
        

        processed_offers = process_flight_offers(response.data)
        
        return FlightSearchResponse(
            success=True,
            offers=processed_offers,
            count=len(processed_offers),
            currency=processed_offers[0].price.currency if processed_offers else 'EUR'
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