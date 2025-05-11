from sqlalchemy import Column, String
from database.db import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String(255), primary_key=True, index=True)  # Especificamos longitud
    name = Column(String(255), nullable=False)  # Especificamos longitud
    email = Column(String(255), unique=True, nullable=False)  # Especificamos longitud
    password = Column(String(255), nullable=False)  # Especificamos longitud
