from sqlalchemy import Column, String
from app.database.db import Base

class Ticket(Base):
    """
    Represents a Ticket entity that links a user to booked travel services.

    Attributes:
        id (str): Primary key. Unique identifier for the ticket.
        user_id (str): Identifier of the user who owns the ticket.
        flight_id (str, optional): Identifier of the associated flight booking, if any.
        hotel_id (str, optional): Identifier of the associated hotel booking, if any.
        vehicle_id (str, optional): Identifier of the associated vehicle rental, if any.
    """
    __tablename__ = "tickets"

    id         = Column(String(255), primary_key=True, index=True)
    user_id    = Column(String(255), nullable=False)
    flight_id  = Column(String(255), nullable=True)
    hotel_id   = Column(String(255), nullable=True)
    vehicle_id = Column(String(255), nullable=True)

