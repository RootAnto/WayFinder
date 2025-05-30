import datetime
import json
import qrcode
import smtplib
from io import BytesIO
from fastapi import APIRouter
from loguru import logger
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.application import MIMEApplication
from email.utils import formataddr
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
from models.trips.trip_pydantic import TripOut

router = APIRouter()

# 🔐 En producción, usa variables de entorno seguras
GMAIL_USER = "antoniollorentecuenca@gmail.com"
GMAIL_PASSWORD = "pdjt inoj ycbu opdr"

def json_serial(obj):
    if isinstance(obj, (datetime.date, datetime.datetime)):
        return obj.isoformat()
    raise TypeError(f"Tipo no serializable: {type(obj)}")


# 📩 1. Email al crear la reserva (pendiente de confirmar)
def generate_dynamic_html_body(trip: TripOut, to_name: str) -> str:
    details = [
        ("Origen", trip.origin),
        ("Destino", trip.destination),
        ("Fecha de salida", trip.departure_date),
        ("Fecha de regreso", trip.return_date or "N/A"),
        ("Adultos", trip.adults),
        ("Niños", trip.children),
        ("Hotel", trip.hotel_name or trip.hotel_id),
        ("Noches de hotel", trip.hotel_nights),
        ("Precio hotel", f"{trip.hotel_price} {trip.currency}" if trip.hotel_price else "N/A"),
        ("Vehículo", trip.vehicle_model or trip.vehicle_id),
        ("Días de alquiler", trip.vehicle_days),
        ("Precio vehículo", f"{trip.vehicle_price} {trip.currency}" if trip.vehicle_price else "N/A"),
        ("Vuelo", trip.flight_name or trip.flight_id),
        ("Precio vuelo", f"{trip.flight_price} {trip.currency}" if trip.flight_price else "N/A"),
        ("Precio total", f"{trip.total_price} {trip.currency}"),
        ("Estado de la reserva", trip.status.capitalize()),
        ("ID de reserva", trip.id),
    ]

    html_items = "".join(
        f"<li><strong>{label}:</strong> {value}</li>"
        for label, value in details if value is not None
    )

    return f"""
    <html>
    <body style="font-family: Arial, sans-serif; color: #333;">
        <p>Hola <strong>{to_name}</strong>,</p>
        <p>Gracias por elegir <strong>WayFinder</strong>. Tu reserva ha sido registrada y está pendiente de confirmación.</p>
        <p>Detalles de tu viaje:</p>
        <ul>{html_items}</ul>
        <p>Por favor, confirma o rechaza tu reserva:</p>
        <p>
            <a href="http://127.0.0.1:8000/trips/reservas/{trip.id}/aceptar?user_name={to_name}&user_email={trip.user_email}"
                style="padding:12px 25px; margin-right:10px; background-color:#28a745; color:#fff; text-decoration:none; border-radius:6px;">
                Confirmar Reserva
            </a>
            <a href="http://127.0.0.1:8000/trips/reservas/{trip.id}/rechazar?user_name={to_name}&user_email={trip.user_email}"
                style="padding:12px 25px; background-color:#dc3545; color:#fff; text-decoration:none; border-radius:6px;">
                Rechazar Reserva
            </a>
        </p>

        <p>Saludos,<br>Equipo WayFinder</p>
    </body>
    </html>
    """

def generate_ticket_pdf(trip: TripOut) -> bytes:
    buffer = BytesIO()
    c = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter

    c.setFont("Helvetica-Bold", 16)
    c.drawString(50, height - 50, "Ticket de Reserva - WayFinder")

    c.setFont("Helvetica", 12)
    c.drawString(50, height - 90, f"ID Reserva: {trip.id}")
    c.drawString(50, height - 110, f"Nombre: {trip.user_name or 'Cliente'}")
    c.drawString(50, height - 130, f"Email: {trip.user_email}")
    c.drawString(50, height - 150, f"Origen: {trip.origin}")
    c.drawString(50, height - 170, f"Destino: {trip.destination}")
    c.drawString(50, height - 190, f"Fecha salida: {trip.departure_date}")
    c.drawString(50, height - 210, f"Fecha regreso: {trip.return_date or 'N/A'}")
    c.drawString(50, height - 230, f"Adultos: {trip.adults}")
    c.drawString(50, height - 250, f"Niños: {trip.children}")
    c.drawString(50, height - 270, f"Estado: {trip.status.capitalize()}")

    c.save()
    return buffer.getvalue()

def send_confirmation_ticket(to_email: str, to_name: str, trip: TripOut):
    subject = "Tu reserva en WayFinder - Confirmación pendiente"
    sender_email = GMAIL_USER
    receiver_email = to_email

    html_body = generate_dynamic_html_body(trip, to_name)

    message = MIMEMultipart("mixed")
    message["From"] = formataddr(("WayFinder", sender_email))
    message["To"] = receiver_email
    message["Subject"] = subject

    message.attach(MIMEText(html_body, "html"))

    pdf_data = generate_ticket_pdf(trip)
    pdf_attachment = MIMEApplication(pdf_data, _subtype="pdf")
    pdf_attachment.add_header("Content-Disposition", "attachment", filename=f"Ticket_Reserva_{trip.id}.pdf")
    message.attach(pdf_attachment)

    try:
        logger.info(f"Enviando correo de confirmación a {to_email}")
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(GMAIL_USER, GMAIL_PASSWORD)
            server.sendmail(sender_email, receiver_email, message.as_string())
        logger.success(f"Correo enviado correctamente a {to_email}")
    except Exception as e:
        logger.error(f"Error al enviar correo de confirmación: {e}")


# 📩 2. Email tras el pago (con QR)
def generate_ticket_pdf_with_qr(trip: TripOut) -> bytes:
    qr_payload = {
        "user_id": trip.user_id,
        "trip_id": trip.id,
        "origin": trip.origin,
        "destination": trip.destination,
        "departure_date": trip.departure_date,
        "return_date": trip.return_date,
        "adults": trip.adults,
        "children": trip.children,
        "flight_id": trip.flight_id,
        "hotel_id": trip.hotel_id,
        "vehicle_id": trip.vehicle_id,
        "total_price": trip.total_price,
        "currency": trip.currency,
        "status": trip.status,
    }

    qr_data = json.dumps(qr_payload, default=json_serial)
    qr = qrcode.QRCode(version=1, box_size=10, border=4)
    qr.add_data(qr_data)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white").convert("RGB")  # Asegura formato RGB

    img_buffer = BytesIO()
    img.save(img_buffer, format="PNG")
    img_buffer.seek(0)

    image_reader = ImageReader(img_buffer)  # 👈 CORRECTO para ReportLab

    buffer = BytesIO()
    c = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter

    c.setFont("Helvetica-Bold", 16)
    c.drawString(50, height - 50, "Billete Confirmado - WayFinder")

    c.setFont("Helvetica", 12)
    c.drawString(50, height - 90, f"Nombre: {trip.user_name or 'Cliente'}")
    c.drawString(50, height - 110, f"Origen: {trip.origin}")
    c.drawString(50, height - 130, f"Destino: {trip.destination}")
    c.drawString(50, height - 150, f"Fecha salida: {trip.departure_date}")
    c.drawString(50, height - 170, f"Fecha regreso: {trip.return_date or 'N/A'}")
    c.drawString(50, height - 190, f"Adultos: {trip.adults}")
    c.drawString(50, height - 210, f"Niños: {trip.children}")
    c.drawString(50, height - 230, f"Estado: {trip.status.capitalize()}")

    # ✅ Usa ImageReader en lugar de BytesIO
    c.drawImage(image_reader, 50, height - 400, 150, 150)

    c.showPage()
    c.save()

    buffer.seek(0)
    return buffer.getvalue()


def send_paid_ticket_with_qr(to_email: str, trip: TripOut):
    subject = "🎟️ Tu billete WayFinder ha sido confirmado"
    sender_email = GMAIL_USER
    receiver_email = to_email

    html_body = f"""
    <html>
    <body style="font-family: Arial, sans-serif;">
        <p>Hola <strong>{trip.user_name or 'Cliente'}</strong>,</p>
        <p>Tu pago ha sido recibido correctamente y tu reserva ha sido confirmada.</p>
        <p>Adjuntamos tu billete con un código QR para presentar durante el viaje.</p>
        <p>¡Gracias por confiar en WayFinder!</p>
        <p>Equipo WayFinder</p>
    </body>
    </html>
    """

    message = MIMEMultipart("mixed")
    message["From"] = formataddr(("WayFinder", sender_email))
    message["To"] = receiver_email
    message["Subject"] = subject

    message.attach(MIMEText(html_body, "html"))

    pdf_data = generate_ticket_pdf_with_qr(trip)
    pdf_attachment = MIMEApplication(pdf_data, _subtype="pdf")
    pdf_attachment.add_header("Content-Disposition", "attachment", filename=f"Billete_WayFinder_{trip.id}.pdf")
    message.attach(pdf_attachment)

    try:
        logger.info(f"Enviando billete con QR a {to_email}")
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(GMAIL_USER, GMAIL_PASSWORD)
            server.sendmail(sender_email, receiver_email, message.as_string())
        logger.success(f"Correo con billete enviado a {to_email}")
    except Exception as e:
        logger.error(f"Error al enviar billete confirmado: {e}")


def send_verification_email(to_email: str, to_name: str, verification_link: str):
    subject = "Confirma tu correo electrónico - WayFinder"
    sender_email = GMAIL_USER
    receiver_email = to_email

    html_body = f"""
    <html>
    <body style="font-family: Arial, sans-serif;">
        <p>Hola <strong>{to_name}</strong>,</p>
        <p>Gracias por registrarte en <strong>WayFinder</strong>.</p>
        <p>Por favor, confirma tu dirección de correo electrónico haciendo clic en el siguiente enlace:</p>
        <p><a href="{verification_link}" style="padding:10px 20px; background-color:#007bff; color:white; text-decoration:none; border-radius:5px;">
            Verificar Correo
        </a></p>
        <p>Saludos,<br>Equipo WayFinder</p>
    </body>
    </html>
    """

    message = MIMEMultipart("alternative")
    message["From"] = formataddr(("WayFinder", sender_email))
    message["To"] = receiver_email
    message["Subject"] = subject
    message.attach(MIMEText(html_body, "html"))

    try:
        logger.info(f"Enviando email de verificación a {to_email}")
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(GMAIL_USER, GMAIL_PASSWORD)
            server.sendmail(sender_email, receiver_email, message.as_string())
        logger.success(f"Email de verificación enviado a {to_email}")
    except Exception as e:
        logger.error(f"Error al enviar email de verificación: {e}")