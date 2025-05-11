from database.db import Base, engine  # Asegúrate de importar desde db.py
from models.trips.trip_db import Trip
from models.travel_tickets.travel_ticket_db import Ticket  # Otro modelo como ejemplo
from models.users.user_db import User  # Modelo de Usuario

# Crear todas las tablas en la base de datos
Base.metadata.create_all(bind=engine)