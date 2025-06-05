from pydantic import BaseModel, Field, field_validator
from typing import List, Optional
from datetime import datetime, date
import re

class FlightSegment(BaseModel):
    '''
    @class FlightSegment
    @brief Represents a flight segment with detailed flight information.

    @var departureAirport
    IATA code of the departure airport.

    @var departureTime
    Departure time in ISO 8601 format.

    @var arrivalAirport
    IATA code of the arrival airport.

    @var arrivalTime
    Arrival time in ISO 8601 format.

    @var carrierCode
    Airline code.

    @var flightNumber
    Flight number.

    @var aircraftCode
    Aircraft type code (optional).

    @var duration
    Duration of the flight segment, e.g., 'PT2H30M'.
    '''
    departureAirport: str = Field(..., description="Código IATA del aeropuerto de salida")
    departureTime: datetime = Field(..., description="Hora de salida en formato ISO 8601")
    arrivalAirport: str = Field(..., description="Código IATA del aeropuerto de llegada")
    arrivalTime: datetime = Field(..., description="Hora de llegada en formato ISO 8601")
    carrierCode: str = Field(..., description="Código de la aerolínea")
    flightNumber: str = Field(..., description="Número de vuelo")
    aircraftCode: Optional[str] = Field(None, description="Código del tipo de aeronave")
    duration: str = Field(..., description="Duración del segmento, por ejemplo 'PT2H30M'")

    @field_validator('duration')
    @classmethod
    def duration_must_be_iso8601(cls, v):
        pattern = r'^P(T(\d+H)?(\d+M)?(\d+S)?)?$'
        if not re.match(pattern, v):
            raise ValueError('duration debe seguir el formato ISO 8601 (ej: PT2H30M)')
        return v

class FlightItinerary(BaseModel):
    '''
    @class FlightItinerary
    @brief Represents a flight itinerary consisting of multiple flight segments.

    @var duration
    Total duration of the itinerary in ISO 8601 format, e.g., 'PT5H45M'.

    @var segments
    List of flight segments included in the itinerary.
    '''
    duration: str = Field(..., description="Duración total del itinerario, ejemplo 'PT5H45M'")
    segments: List[FlightSegment] = Field(..., description="Lista de segmentos de vuelo")

    @field_validator('duration')
    @classmethod
    def duration_must_be_iso8601(cls, v):
        '''
        @brief Validates that the duration string follows the ISO 8601 duration format.

        @param v Duration string to validate.
        @return The validated duration string if it matches the ISO 8601 pattern.
        @throws ValueError if the duration does not match the ISO 8601 format.
        '''
        pattern = r'^P(T(\d+H)?(\d+M)?(\d+S)?)?$'
        if not re.match(pattern, v):
            raise ValueError('duration debe seguir el formato ISO 8601 (ej: PT5H45M)')
        return v

class FlightPrice(BaseModel):
    '''
    @class FlightPrice
    @brief Represents the price information for a flight offer.

    @var total
    Total price of the flight as a string.

    @var currency
    Currency code for the price, e.g., 'EUR'.
    '''
    total: str = Field(..., description="Total price of the flight")
    currency: str = Field(..., description="Currency of the price, e.g., 'EUR'")


class FlightOffer(BaseModel):
    '''
    @class FlightOffer
    @brief Represents a flight offer including pricing and itinerary details.

    @var id
    Unique identifier for the flight offer.

    @var source
    Source or provider of the flight offer.

    @var price
    Price details of the flight.

    @var itineraries
    List of flight itineraries included in the offer.
    '''
    id: str = Field(..., description="Unique identifier for the flight offer")
    source: str = Field(..., description="Source of the flight provider")
    price: FlightPrice
    itineraries: List[FlightItinerary]


class FlightSearchResponse(BaseModel):
    '''
    @class FlightSearchResponse
    @brief Response model for flight search requests.

    @var success
    Indicates if the flight search was successful.

    @var offers
    List of flight offers found.

    @var count
    Total number of flight offers returned.

    @var currency
    Currency code used for the prices in the response.
    '''
    success: bool = Field(..., description="Indicates if the search was successful")
    offers: List[FlightOffer] = Field(..., description="List of flight offers found")
    count: int = Field(..., description="Total number of offers found")
    currency: str = Field(..., description="Currency used for prices")


class FlightSearchQuery(BaseModel):
    '''
    @class FlightSearchQuery
    @brief Query model for requesting flight search.

    @var originLocationCode
    IATA code of the origin airport.

    @var destinationLocationCode
    IATA code of the destination airport.

    @var departureDate
    Departure date in YYYY-MM-DD format.

    @var returnDate
    Optional return date in YYYY-MM-DD format.

    @var adults
    Number of adult passengers.

    @var max
    Optional maximum number of results to return.
    '''
    originLocationCode: str = Field(default='MAD', description="IATA code of the origin airport")
    destinationLocationCode: str = Field(default='NYC', description="IATA code of the destination airport")
    departureDate: date = Field(default=date(2025, 6, 15), description="Departure date (format YYYY-MM-DD)")
    returnDate: Optional[date] = Field(default=date(2025, 6, 25), description="Optional return date")
    adults: int = Field(default=1, description="Number of adult passengers")
    max: Optional[int] = Field(default=5, description="Maximum number of results to return")
