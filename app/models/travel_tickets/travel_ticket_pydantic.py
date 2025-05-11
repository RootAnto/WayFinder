from pydantic import BaseModel
from datetime import datetime

class TicketCreate(BaseModel):
    userId: str
    tripId: str
    issueDate: datetime
