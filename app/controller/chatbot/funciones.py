import httpx
from datetime import datetime, date
from typing import Optional, Union
import requests
import json

def buscar_vuelos(origen, destino, fecha_salida, fecha_regreso, pasajeros, tipo_pasajero):
    print("📡 Función 'buscar_vuelos' llamada con los siguientes datos:")
    print(f"Origen: {origen}")
    print(f"Destino: {destino}")
    print(f"Fecha de salida: {fecha_salida}")
    print(f"Fecha de regreso: {fecha_regreso}")
    print(f"Número de pasajeros: {pasajeros}")
    print(f"Tipo de pasajero: {tipo_pasajero}")

    fecha_salida_iso = convertir_fecha(fecha_salida)
    if not fecha_salida_iso:
        return "❌ Formato de fecha de salida inválido. Use 'dd/mm' o 'yyyy-mm-dd'."

    fecha_regreso_iso = convertir_fecha(fecha_regreso) if fecha_regreso else None
    if fecha_regreso and not fecha_regreso_iso:
        return "❌ Formato de fecha de regreso inválido. Use 'dd/mm' o 'yyyy-mm-dd'."

    url = "http://localhost:8000/flight-search"

    payload = {
        "originLocationCode": origen.upper(),
        "destinationLocationCode": destino.upper(),
        "departureDate": fecha_salida_iso,
        "adults": pasajeros if pasajeros > 0 else 1,
        "max": 1
    }

    if fecha_regreso_iso:
        payload["returnDate"] = fecha_regreso_iso

    try:
        with httpx.Client() as client:
            response = client.post(url, json=payload)
            response.raise_for_status()
            data = response.json()

            if data.get("success"):
                mensaje = f"✈️ Se encontraron {data['count']} vuelos:\n"
                for i, offer in enumerate(data["offers"], start=1):
                    precio = offer['price']['total']
                    moneda = offer['price']['currency']
                    duracion = offer['itineraries'][0]['duration']
                    mensaje += f"- Vuelo {i}: {precio} {moneda}, duración: {duracion}\n"
                return mensaje
            else:
                return "❌ No se encontraron vuelos disponibles."

    except httpx.HTTPStatusError as e:
        return f"❌ Error al buscar vuelos: {e.response.text}"
    except Exception as e:
        return f"❌ Error interno: {str(e)}"


def buscar_hoteles(ciudad_codigo, fecha_checkin=None, fecha_checkout=None, limite=5, precio_defecto=100.0):
    print("📡 Función 'buscar_hoteles' llamada con los siguientes datos:")
    print(f"Ciudad código (IATA): {ciudad_codigo}")
    print(f"Fecha check-in: {fecha_checkin}")
    print(f"Fecha check-out: {fecha_checkout}")
    print(f"Límite de resultados: {limite}")
    print(f"Precio por defecto: {precio_defecto} EUR")

    url = "http://localhost:8000/hotel-search"  
    payload = {
        "cityCode": ciudad_codigo.upper(),
        "checkInDate": convertir_fecha(fecha_checkin) if fecha_checkin else None,
        "checkOutDate": convertir_fecha(fecha_checkout) if fecha_checkout else None,
        "limit": 1,
    }

    payload = {k: v for k, v in payload.items() if v is not None}

    try:
        with httpx.Client() as client:
            response = client.post(url, json=payload)
            response.raise_for_status()
            data = response.json()

            if data.get("count", 0) > 0:
                mensaje = f"Se encontraron {data['count']} hoteles:\n"
                for i, hotel in enumerate(data.get("data", []), start=1):
                    nombre = hotel.get('name', 'Desconocido')
                    precio = hotel.get('price', precio_defecto)
                    noches = hotel.get('nights', 'N/A')
                    mensaje += f"- Hotel {i}: {nombre}, Precio aprox: {precio} EUR, Noches: {noches}\n"
                return mensaje
            else:
                return "❌ No se encontraron hoteles disponibles."

    except httpx.HTTPStatusError as e:
        return f"❌ Error al buscar hoteles: {e.response.text}"
    except Exception as e:
        return f"❌ Error interno: {str(e)}"


def buscar_coches(ciudad_codigo, tipo_vehiculo=None, limite=5):
    print("📡 Función 'buscar_coches' llamada con los siguientes datos:")
    print(f"Ciudad código (IATA): {ciudad_codigo}")
    print(f"Tipo de vehículo: {tipo_vehiculo}")
    print(f"Límite de resultados: {limite}")

    url = "http://localhost:8000/vehicle-search" 
    payload = {
        "location": ciudad_codigo.upper(),
        "vehicleType": tipo_vehiculo if tipo_vehiculo else "car",
        "limit": limite
    }

    try:
        with httpx.Client() as client:
            response = client.post(url, json=payload)
            response.raise_for_status()
            data = response.json()

            if data.get("count", 0) > 0:
                mensaje = f"Se encontraron {data['count']} coches disponibles:\n"
                for i, vehicle in enumerate(data.get("data", []), start=1):
                    nombre = vehicle.get('name', 'Desconocido')
                    precio = vehicle.get('pricePerDay', 'N/A')
                    moneda = vehicle.get('currency', 'EUR')
                    ano = vehicle.get('year', 'N/A')
                    transmision = vehicle.get('transmission', 'N/A')
                    combustible = vehicle.get('fuelType', 'N/A')
                    mensaje += (f"- Coche {i}: {nombre}, Precio/día: {precio} {moneda}, Año: {ano}, "
                                f"Transmisión: {transmision}, Combustible: {combustible}\n")
                return mensaje
            else:
                return "❌ No se encontraron coches disponibles."

    except httpx.HTTPStatusError as e:
        return f"❌ Error al buscar coches: {e.response.text}"
    except Exception as e:
        return f"❌ Error interno: {str(e)}"


def convertir_fecha(fecha_str: Optional[Union[str, date]]) -> Optional[str]:
    if not fecha_str:
        return None

    if isinstance(fecha_str, (datetime, date)):
        return fecha_str.strftime("%Y-%m-%d")

    try:
        return datetime.strptime(fecha_str, "%d/%m/%Y").strftime("%Y-%m-%d")
    except ValueError:
        pass
    
    try:
        return datetime.strptime(fecha_str, "%d/%m").replace(year=datetime.now().year).strftime("%Y-%m-%d")
    except ValueError:
        pass
    
    try:
        datetime.strptime(fecha_str, "%Y-%m-%d")
        return fecha_str
    except ValueError:
        return None
    

from langchain.schema import HumanMessage
from langchain.chat_models import ChatOpenAI

model = ChatOpenAI(model="gpt-4o", temperature=0.0)

def es_afirmacion(mensaje: str) -> bool:
    """Determina si un mensaje es afirmativo usando el modelo de lenguaje."""
    prompt_afirmacion = f"""
¿El siguiente mensaje es una respuesta afirmativa a una pregunta?  
Responde solo "sí" o "no".

Mensaje: "{mensaje}"
"""
    response = model.invoke([HumanMessage(content=prompt_afirmacion)])
    return response.content.strip().lower() in ["sí", "si"]


def enviar_reserva_backend(datos_vuelo, datos_hotel, datos_coche, user):
    url = "http://localhost:8000/trips/"

    def parse_date(d):
        if isinstance(d, str):
            return d  
        if isinstance(d, datetime):
            return d.date().isoformat()
        if hasattr(d, "isoformat"):
            return d.isoformat()
        return None

    payload = {
        # Datos usuario
        "user_id":user.nombre,  
        "user_email": user.email,
        # Datos vuelo
        "origin": datos_vuelo.get("origen"),
        "destination": datos_vuelo.get("destino"),
        "departure_date": parse_date(datos_vuelo.get("fecha_salida")),
        "return_date": parse_date(datos_vuelo.get("fecha_regreso")),
        "adults": 1,  
        "children": 0, 
        "hotel_limit": 5,
        "vehicle_limit": 5,
        "max_price": None,
        "user_name": None,
        "flight_id": None,
        "hotel_id": None,
        "vehicle_id": None,
        # Detalles vuelo
        "flight_name": datos_vuelo.get("nombre_vuelo"),  
        "flight_price": datos_vuelo.get("precio_vuelo"),
        # Detalles hotel
        "hotel_name": datos_hotel.get("nombre_hotel"),
        "hotel_price": datos_hotel.get("precio_hotel"),
        "hotel_nights": datos_hotel.get("noches"),
        # Detalles vehículo
        "vehicle_model": datos_coche.get("modelo"),
        "vehicle_price": datos_coche.get("precio_coche"),
        "vehicle_days": datos_coche.get("dias"),
        # Precio total 
        "total_price": 0.0,
        "currency": "EUR"
    }

    try:
        response = requests.post(url,user.email, json=payload)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        print("Error al enviar la reserva:", e)
        return None
