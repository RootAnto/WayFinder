import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
from models.trips.trip_pydantic import TripOut

GMAIL_USER = "antoniollorentecuenca@gmail.com"
GMAIL_PASSWORD = "pdjt inoj ycbu opdr"

def send_confirmation_email(to_email: str, to_name: Optional[str], trip: TripOut):
    subject = "Confirmación de tu reserva en WayFinder"
    sender_email = GMAIL_USER
    receiver_email = to_email

    body = f"""
    Hola {to_name or "usuario"},

    ¡Gracias por reservar con WayFinder! Aquí tienes los detalles de tu viaje:

    - Origen: {trip.origin}
    - Destino: {trip.destination}
    - Fecha de salida: {trip.departure_date}
    - Fecha de regreso: {trip.return_date or "N/A"}
    - Adultos: {trip.adults}
    - Niños: {trip.children}
    - ID de reserva: {trip.id}

    ¡Buen viaje!
    """
    message = MIMEMultipart()
    message["From"] = sender_email
    message["To"] = receiver_email
    message["Subject"] = subject

    message.attach(MIMEText(body, "plain"))

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(GMAIL_USER, GMAIL_PASSWORD)
            server.sendmail(sender_email, receiver_email, message.as_string())
            print(f"Correo enviado a {to_email}")
    except Exception as e:
        print(f"Error al enviar el correo: {e}")
