import os
from langchain.chat_models import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from app.controller.chatbot.hoteles.extractor_hoteles import extraer_datos_hotel
from app.controller.chatbot.funciones import buscar_hoteles, es_afirmacion
from app.controller.chatbot.bussiness_info import info
from app.config import OPENAI_API_KEY  
import os
os.environ["OPENAI_API_KEY"] = OPENAI_API_KEY
with open("app/controller/chatbot/hoteles/template_hoteles.txt", "r", encoding="utf-8") as f:
    template = f.read()

model = ChatOpenAI(model="gpt-4o", temperature=0.0)
prompt = ChatPromptTemplate.from_template(template)
chain = prompt | model


def procesar_mensaje_hotel(mensaje: str, datos_actuales: dict, contexto: str):
    """
    Procesa un mensaje para el chatbot de hoteles.

    Args:
        mensaje (str): mensaje del usuario
        datos_actuales (dict): datos acumulados de la conversación (ciudad, fechas, etc)
        contexto (str): historial o contexto conversacional

    Returns:
        tuple:
            respuesta (str): respuesta generada
            nuevos_datos (dict): datos extraídos del mensaje
            nuevo_contexto (str): contexto actualizado
            hoteles (str|None): resultados de búsqueda hoteles si disponibles
            reservar (bool): si el usuario confirma reserva
    """
    nuevos_datos = extraer_datos_hotel(mensaje)

    datos_actualizados = datos_actuales.copy()
    for campo, valor in nuevos_datos.items():
        if valor:
            datos_actualizados[campo] = valor

    prompt_input = {
        "bussiness_info": info,
        "context": contexto,
        "question": mensaje,
        "ciudad": datos_actualizados.get("ciudad", "no definido"),
        "fecha_entrada": datos_actualizados.get("fecha_checkin", "no definida"),
        "fecha_salida": datos_actualizados.get("fecha_checkout", "no definida"),
        "personas": str(datos_actualizados.get("personas", "1")),
        "tipo_habitacion": datos_actualizados.get("tipo_habitacion", "estándar")
    }

    result = chain.invoke(prompt_input)
    respuesta = result.content if hasattr(result, "content") else str(result)

    nuevo_contexto = contexto + f"Tú: {mensaje}\nBot: {respuesta}\n"

    hoteles = None
    reservar = False

    if datos_actualizados.get("ciudad") and datos_actualizados.get("fecha_checkin") and datos_actualizados.get("fecha_checkout"):
        hoteles = buscar_hoteles(
            ciudad_codigo=datos_actualizados["ciudad"],
            fecha_checkin=datos_actualizados["fecha_checkin"],
            fecha_checkout=datos_actualizados["fecha_checkout"],
        )
        nuevo_contexto += f"Bot: {hoteles}\n"

    return respuesta, nuevos_datos, nuevo_contexto, hoteles, reservar
