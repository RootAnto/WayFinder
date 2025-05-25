from loguru import logger
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from models.trips.trip_pydantic import TripOut

GMAIL_USER = "antoniollorentecuenca@gmail.com"
GMAIL_PASSWORD = "pdjt inoj ycbu opdr"

def send_ticket_email(to_email: str, trip: TripOut, to_name: str = "cliente"):
    subject = "Tus billetes de WayFinder"
    sender_email = GMAIL_USER
    receiver_email = to_email

    logger.debug(f"Preparando correo para {to_email} con reserva ID {trip.id}")

    html_body = f"""
        <html>
        <body>
            <p>Hola {to_name},</p>
            <p>Tu reserva ha sido confirmada. Aquí están los detalles de tu viaje:</p>
            <ul>
                <li><b>Origen:</b> {trip.origin}</li>
                <li><b>Destino:</b> {trip.destination}</li>
                <li><b>Fecha de salida:</b> {trip.departure_date}</li>
                <li><b>Fecha de regreso:</b> {trip.return_date or "N/A"}</li>
                <li><b>Adultos:</b> {trip.adults}</li>
                <li><b>Niños:</b> {trip.children}</li>
                <li><b>ID de reserva:</b> {trip.id}</li>
            </ul>

            <p>Por favor, confirma tu reserva:</p>

            <a href="https://api.wayfinder.com/reservas/{trip.id}/aceptar"
            style="display:inline-block;padding:10px 20px;margin:5px;background-color:#28a745;color:white;text-decoration:none;border-radius:5px;">
                Aceptar
            </a>
            <a href="https://api.wayfinder.com/reservas/{trip.id}/rechazar"
            style="display:inline-block;padding:10px 20px;margin:5px;background-color:#dc3545;color:white;text-decoration:none;border-radius:5px;">
                Rechazar
            </a>

            <p>¡Buen viaje y gracias por confiar en WayFinder!</p>
        </body>
        </html>
        """


    message = MIMEMultipart("alternative")
    message["From"] = sender_email
    message["To"] = receiver_email
    message["Subject"] = subject
    message.attach(MIMEText(html_body, "html"))

    try:
        logger.info(f"Conectando al servidor SMTP de Gmail para enviar correo a {to_email}")
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(GMAIL_USER, GMAIL_PASSWORD)
            logger.debug("Login SMTP exitoso")
            server.sendmail(sender_email, receiver_email, message.as_string())
            logger.success(f"Correo de billetes enviado correctamente a {to_email}")
    except Exception as e:
        logger.error(f"Error al enviar los billetes a {to_email}: {e}")



def send_confirmation_tiket(to_email: str, trip: TripOut, to_name: str = "cliente"):
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


