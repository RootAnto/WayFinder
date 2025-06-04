from pydantic import BaseModel
from typing import Optional
from datetime import date
from enum import Enum


class TripStatus(str, Enum):
    """
    Enumeration for trip statuses.

    Values:
        pendiente: Trip is pending.
        aceptada: Trip has been accepted.
        rechazada: Trip has been rejected.
    """
    pendiente = "pendiente"
    aceptada = "aceptada"
    rechazada = "rechazada"


class TripCreate(BaseModel):
    """
    Pydantic model to create a new Trip.

    Attributes:
        user_id (str): ID of the user creating the trip.
        origin (str): Origin location code (e.g., IATA code).
        destination (str): Destination location code.
        departure_date (date): Date of departure.
        return_date (Optional[date]): Optional return date.
        adults (int): Number of adult travelers (default 1).
        children (int): Number of child travelers (default 0).
        hotel_limit (int): Max number of hotels to consider (default 5).
        vehicle_limit (int): Max number of vehicles to consider (default 5).
        max_price (Optional[float]): Maximum total price allowed.
        user_email (Optional[str]): Email of the user.
        user_name (Optional[str]): Name of the user.
        flight_id (Optional[str]): Associated flight booking ID.
        hotel_id (Optional[str]): Associated hotel booking ID.
        vehicle_id (Optional[str]): Associated vehicle booking ID.
        flight_name (Optional[str]): Name or identifier of the booked flight.
        flight_price (Optional[float]): Price of the booked flight.
        hotel_name (Optional[str]): Name of the booked hotel.
        hotel_price (Optional[float]): Price of the booked hotel.
        hotel_nights (Optional[int]): Number of nights at the hotel.
        vehicle_model (Optional[str]): Model of the rented vehicle.
        vehicle_price (Optional[float]): Price of the rented vehicle.
        vehicle_days (Optional[int]): Number of rental days.
        total_price (float): Total trip cost (default 0.0).
        currency (str): Currency code for prices (default 'EUR').
    """
    user_id: str
    origin: str
    destination: str
    departure_date: date
    return_date: Optional[date] = None
    adults: int = 1
    children: int = 0
    hotel_limit: int = 5
    vehicle_limit: int = 5
    max_price: Optional[float] = None
    user_email: Optional[str] = None
    user_name: Optional[str] = None

    flight_id: Optional[str] = None
    hotel_id: Optional[str] = None
    vehicle_id: Optional[str] = None

    flight_name: Optional[str] = None
    flight_price: Optional[float] = None

    hotel_name: Optional[str] = None
    hotel_price: Optional[float] = None
    hotel_nights: Optional[int] = None

    vehicle_model: Optional[str] = None
    vehicle_price: Optional[float] = None
    vehicle_days: Optional[int] = None

    total_price: float = 0.0
    currency: str = "EUR"


class TripOut(TripCreate):
    """
    Pydantic model for Trip output with additional metadata.

    Attributes:
        id (str): Unique identifier of the trip.
        confirmed (bool): Whether the trip is confirmed (default False).
        status (TripStatus): Current status of the trip (default 'pendiente').

    Configuration:
        from_attributes: Allows model to parse data from ORM objects.
    """
    id: str
    confirmed: bool = False
    status: TripStatus = TripStatus.pendiente

    model_config = {
        "from_attributes": True
    }
