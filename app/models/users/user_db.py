from sqlalchemy import Column, String
from database.db import Base

class User(Base):
    """
    SQLAlchemy model representing a user in the system.

    Attributes:
        id (str): Unique identifier for the user (primary key).
        name (str): Full name of the user (required).
        email (str): Unique email address of the user (required).
        password (str): Hashed password for user authentication (required).
    """
    __tablename__ = "users"

    id = Column(String(255), primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
