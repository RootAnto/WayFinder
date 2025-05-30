from app.database.db import Base, engine
from app.models.travel_tickets.travel_ticket_db import Ticket
from app.models.trips.trip_db import Trip

def init_db(drop_first: bool = False):
    if drop_first:
        Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    print("DB inicializada.")

if __name__ == "__main__":
    init_db(drop_first=True)
