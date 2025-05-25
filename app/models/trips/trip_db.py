from sqlalchemy import Column, String, Date, Integer, Float
from database.db import Base

class Trip(Base):
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
