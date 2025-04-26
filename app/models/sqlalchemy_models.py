from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from database.db import Base

class Travel(Base):
    __tablename__ = "travels"

    id = Column(Integer, primary_key=True, index=True)
    destination = Column(String(100), nullable=False)
    travel_date = Column(DateTime, nullable=False)

    flights = relationship("Flight", 
                           back_populates="travel")

class Flight(Base):
    __tablename__ = "flights"

    id = Column(Integer, primary_key=True, index=True)
    travel_id = Column(Integer, ForeignKey("travels.id"), nullable=False)
    airline = Column(String(100), nullable=False)
    flight_number = Column(String(20), nullable=False)
    departure_date = Column(DateTime, nullable=False) 

    travel = relationship("Travel", 
                          back_populates="flights")
