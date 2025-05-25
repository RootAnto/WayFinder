from database.db import Base, engine
from models.trips.trip_db import Trip
from models.travel_tickets.travel_ticket_db import Ticket
from models.users.user_db import User

# Primero borramos todas las tablas
Base.metadata.drop_all(bind=engine)

# Luego las creamos nuevamente
Base.metadata.create_all(bind=engine)

print("Tablas borradas y creadas correctamente.")
