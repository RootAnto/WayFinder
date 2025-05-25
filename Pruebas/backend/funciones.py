import httpx


from datetime import datetime

def buscar_vuelos(origen, destino, fecha_salida, fecha_regreso, pasajeros, tipo_pasajero):
    print("📡 Función 'buscar_vuelos' llamada con los siguientes datos:")
    print(f"Origen: {origen}")
    print(f"Destino: {destino}")
    print(f"Fecha de salida: {fecha_salida}")
    print(f"Fecha de regreso: {fecha_regreso}")
    print(f"Número de pasajeros: {pasajeros}")
    print(f"Tipo de pasajero: {tipo_pasajero}")

    url = "http://localhost:8000/flight-search"  # asegúrate de que tu FastAPI corre aquí
    payload = {
        "originLocationCode": origen.upper(),
        "destinationLocationCode": destino.upper(),
     "departureDate": convertir_fecha(fecha_salida),
"returnDate": convertir_fecha(fecha_regreso) if fecha_regreso else None,
        "adults": pasajeros if tipo_pasajero == "adulto" else 0,
        "max": 3
    }

    try:
        with httpx.Client() as client:
            response = client.post(url, json=payload)
            response.raise_for_status()
            data = response.json()

            if data.get("success"):
                mensaje = f"Se encontraron {data['count']} vuelos:\n"
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



def convertir_fecha(fecha_str):
    try:
        return datetime.strptime(fecha_str, "%d/%m/%Y").strftime("%Y-%m-%d")
    except Exception:
        return None