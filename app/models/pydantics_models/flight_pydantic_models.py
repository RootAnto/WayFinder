from pydantic import BaseModel
from typing import List, Optional

# Modelo para los segmentos de vuelo
class FlightSegment(BaseModel):
    departureAirport: str
    departureTime: str
    arrivalAirport: str
    arrivalTime: str
    carrierCode: str
    flightNumber: str
    aircraftCode: Optional[str] = None
    duration: str

# Modelo para el itinerario de vuelo
class FlightItinerary(BaseModel):
    duration: str
    segments: List[FlightSegment]

# Modelo para el precio del vuelo
class FlightPrice(BaseModel):
    total: str
    currency: str

# Modelo para la oferta de vuelo
class FlightOffer(BaseModel):
    id: str
    source: str
    price: FlightPrice
    itineraries: List[FlightItinerary]

# Modelo para la respuesta de búsqueda de vuelos
class FlightSearchResponse(BaseModel):
    success: bool
    offers: List[FlightOffer]
    count: int
    currency: str

# Modelo para los parámetros de búsqueda
class FlightSearchQuery(BaseModel):
    originLocationCode: str = 'MAD'
    destinationLocationCode: str = 'NYC'
    departureDate: str = '2025-06-15'
    returnDate: Optional[str] = '2025-06-25'
    adults: int = 1
    max: Optional[int] = 5
