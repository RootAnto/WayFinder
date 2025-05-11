from sqlalchemy import Column, String
from database.db import Base

class Trip(Base):
    __tablename__ = "trips"

    # Especifica la longitud del campo VARCHAR
    id = Column(String(255), primary_key=True, index=True)
    user_id = Column(String(255), nullable=False)
    flight_id = Column(String(255), nullable=False)
    hotel_id = Column(String(255), nullable=False)
    vehicle_id = Column(String(255), nullable=False)
