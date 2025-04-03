# models/pydantic_models.py
from pydantic import BaseModel
from datetime import datetime

# Base Travel Model for Validation
class TravelBase(BaseModel):
    destination: str
    date: datetime

    class Config:
        from_attributes = True

# Template to create a new Travel
class TravelCreate(TravelBase):
    pass

# Template to return a Travel (with the id)
class Travel(TravelBase):
    id: int

    class Config:
        from_attributes = True
