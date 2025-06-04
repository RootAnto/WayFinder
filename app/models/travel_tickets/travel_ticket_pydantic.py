from pydantic import BaseModel
from typing import Optional
from datetime import datetime, date


class TripCreate(BaseModel):
    """
    Model for creating a trip request.

    Attributes:
        user_id (str): ID of the user creating the trip.
        origin (str): Origin location code (e.g., IATA airport code).
        destination (str): Destination location code.
        departure_date (str): Departure date in 'YYYY-MM-DD' format.
        return_date (Optional[str]): Optional return date in 'YYYY-MM-DD' format.
        adults (int): Number of adult travelers.
        children (int): Number of child travelers.
        hotel_limit (int): Maximum number of hotel results to return.
        vehicle_limit (int): Maximum number of vehicle rental results to return.
        max_price (Optional[float]): Optional maximum budget for the trip.
    """
    user_id: str
    origin: str
    destination: str
    departure_date: str
    return_date: Optional[str] = None
    adults: int
    children: int
    hotel_limit: int
    vehicle_limit: int
    max_price: Optional[float] = None

class TripOut(TripCreate):
    """
    Model representing the output details of a trip.

    Extends TripCreate with additional optional fields.

    Attributes:
        id (str): Unique identifier of the trip (UUID string).
        flight_id (Optional[str]): Associated flight booking ID.
        hotel_id (Optional[str]): Associated hotel booking ID.
        vehicle_id (Optional[str]): Associated vehicle rental ID.
        hotel_name (Optional[str]): Name of the booked hotel.
        vehicle_name (Optional[str]): Name of the rented vehicle.
        total_days (Optional[int]): Total duration of the trip in days.
        total_price (Optional[float]): Total price of the trip.
        user_email (Optional[str]): Email of the user.
        user_name (Optional[str]): Name of the user.
    """
    id: str  # UUID como string
    flight_id: Optional[str] = None
    hotel_id: Optional[str] = None
    vehicle_id: Optional[str] = None

    hotel_name: Optional[str] = None
    vehicle_name: Optional[str] = None
    total_days: Optional[int] = None
    total_price: Optional[float] = None
    user_email: Optional[str] = None
    user_name: Optional[str] = None

    model_config = {
        "from_attributes": True
    }


class TicketCreate(BaseModel):
    """
    Model to create a ticket.

    Attributes:
        ticket_id (Optional[str]): Optional ticket identifier.
        userId (str): ID of the user owning the ticket.
        tripId (str): ID of the related trip.
        issueDate (datetime): Date and time when the ticket was issued.
        seat_number (Optional[str]): Assigned seat number.
        price (Optional[float]): Price paid for the ticket.
        currency (Optional[str]): Currency code of the price (default 'USD').
        status (Optional[str]): Ticket status, e.g., 'issued' (default).
        issue_place (Optional[str]): Place where the ticket was issued.
        valid_until (Optional[datetime]): Expiration date of the ticket validity.
        passenger_name (Optional[str]): Name of the passenger.
        additional_info (Optional[str]): Any extra info related to the ticket.
    """
    ticket_id: Optional[str] = None
    userId: str
    tripId: str
    issueDate: datetime
    seat_number: Optional[str] = None
    price: Optional[float] = None
    currency: Optional[str] = "USD"
    status: Optional[str] = "issued"
    issue_place: Optional[str] = None
    valid_until: Optional[datetime] = None
    passenger_name: Optional[str] = None
    additional_info: Optional[str] = None


class TicketOut(TicketCreate):
    """
    Model representing the output details of a ticket.

    Extends TicketCreate with a unique ticket ID.

    Attributes:
        id (str): Unique identifier of the ticket.
    """
    id: str

    model_config = {
        "from_attributes": True
    }
