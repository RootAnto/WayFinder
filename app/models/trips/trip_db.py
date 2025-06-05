from app.database.db import Base
from sqlalchemy import Column, String, Date, Integer, Float, Boolean, Enum as SqlEnum
import enum

class TripStatusEnum(enum.Enum):
    """
    Enumeration of possible statuses for a trip.

    Values:
        pendiente: Trip is pending.
        aceptada: Trip has been accepted.
        rechazada: Trip has been rejected.
    """
    pendiente = "pendiente"
    aceptada = "aceptada"
    rechazada = "rechazada"

class Trip(Base):
    """
    SQLAlchemy model representing a Trip entity.

    Attributes:
        id (str): Unique identifier for the trip.
        user_id (str): ID of the user who created the trip.
        origin (str): Origin location code (e.g., IATA airport code).
        destination (str): Destination location code.
        departure_date (Date): Departure date.
        return_date (Date, optional): Return date, if any.
        adults (int): Number of adult travelers (default 1).
        children (int): Number of child travelers (default 0).
        hotel_limit (int): Max number of hotels to consider (default 5).
        vehicle_limit (int): Max number of vehicles to consider (default 5).
        max_price (float, optional): Maximum price limit for the trip.
        flight_id (str, optional): Associated flight booking ID.
        hotel_id (str, optional): Associated hotel booking ID.
        vehicle_id (str, optional): Associated vehicle booking ID.
        confirmed (bool): Whether the trip is confirmed (default False).
        status (TripStatusEnum): Status of the trip (default 'pendiente').
        user_email (str, optional): Email of the user.
        user_name (str, optional): Name of the user.
        flight_name (str, optional): Name/identifier of the booked flight.
        flight_price (float, optional): Price of the booked flight.
        hotel_name (str, optional): Name of the booked hotel.
        hotel_price (float, optional): Price of the booked hotel.
        hotel_nights (int, optional): Number of hotel nights.
        vehicle_model (str, optional): Model name of the rented vehicle.
        vehicle_price (float, optional): Price of the rented vehicle.
        vehicle_days (int, optional): Number of rental days.
        total_price (float, optional): Total trip price combining all services.
        currency (str, optional): Currency code for prices (e.g., 'EUR', 'USD').
    """
    __tablename__ = "trips"

    id = Column(String(255), primary_key=True, index=True)
    user_id = Column(String(255), nullable=False)

    origin = Column(String(255), nullable=False)
    destination = Column(String(255), nullable=False)
    departure_date = Column(Date, nullable=False)
    return_date = Column(Date, nullable=True)

    adults = Column(Integer, default=1)
    children = Column(Integer, default=0)

    hotel_limit = Column(Integer, default=5)
    vehicle_limit = Column(Integer, default=5)

    max_price = Column(Float, nullable=True)

    flight_id = Column(String(255), nullable=True)
    hotel_id = Column(String(255), nullable=True)
    vehicle_id = Column(String(255), nullable=True)
    confirmed = Column(Boolean, default=False)

    status = Column(SqlEnum(TripStatusEnum), default=TripStatusEnum.pendiente, nullable=False)

    user_email = Column(String(255), nullable=True)
    user_name = Column(String(255), nullable=True)

    flight_name = Column(String(255), nullable=True)
    flight_price = Column(Float, nullable=True)

    hotel_name = Column(String(255), nullable=True)
    hotel_price = Column(Float, nullable=True)
    hotel_nights = Column(Integer, nullable=True)

    vehicle_model = Column(String(255), nullable=True)
    vehicle_price = Column(Float, nullable=True)
    vehicle_days = Column(Integer, nullable=True)

    total_price = Column(Float, nullable=True)
    currency = Column(String(10), nullable=True)
