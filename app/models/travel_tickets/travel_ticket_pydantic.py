from pydantic import BaseModel
from datetime import datetime

class TicketCreate(BaseModel):
    userId: str = "user1"
    tripId: str = "trip1"
    issueDate: datetime = datetime(2025, 8, 7)

