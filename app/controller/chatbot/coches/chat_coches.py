import os
from langchain.chat_models import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from app.controller.chatbot.coches.extractor_coches import extraer_datos_coche
from app.controller.chatbot.funciones import buscar_coches, es_afirmacion
from app.controller.chatbot.bussiness_info import info

from app.config import OPENAI_API_KEY  
import os
os.environ["OPENAI_API_KEY"] = OPENAI_API_KEY
with open("app/controller/chatbot/coches/template_coches.txt", "r", encoding="utf-8") as f:
    template = f.read()

model = ChatOpenAI(model="gpt-4o", temperature=0.0)
prompt = ChatPromptTemplate.from_template(template)
chain = prompt | model


def actualizar_datos_coche(datos_actuales: dict, nuevos_datos: dict) -> dict:
    datos_actualizados = datos_actuales.copy()
    for campo, valor in nuevos_datos.items():
        if valor:
            datos_actualizados[campo] = valor
    return datos_actualizados


def procesar_mensaje_coche(
    mensaje: str,
    datos_actuales: dict,
    contexto: str,
    datos_vuelo: dict | None = None,
    datos_hotel: dict | None = None,
):
    nuevos_datos = extraer_datos_coche(mensaje)

    datos_actualizados = actualizar_datos_coche(datos_actuales, nuevos_datos)

    if not datos_actualizados.get("ciudad"):
        ciudad_predeterminada = (
            (datos_hotel or {}).get("ciudad")
            or (datos_vuelo or {}).get("destino")
            or "no definida"
        )
        datos_actualizados["ciudad"] = ciudad_predeterminada

    prompt_input = {
        "bussiness_info": info,
        "context": contexto,
        "question": mensaje,
        "ciudad": datos_actualizados.get("ciudad", "no definida"),
        "tipo_vehiculo": datos_actualizados.get("tipo_vehiculo", "cualquiera"),
    }

    result = chain.invoke(prompt_input)
    respuesta = result.content if hasattr(result, "content") else str(result)

    nuevo_contexto = contexto + f"Tú: {mensaje}\nBot: {respuesta}\n"

    coches = None
    reservar = False

    if datos_actualizados.get("ciudad") and datos_actualizados.get("tipo_vehiculo"):
        coches = buscar_coches(
            ciudad_codigo=datos_actualizados["ciudad"],
            tipo_vehiculo=datos_actualizados["tipo_vehiculo"],
            limite=5,
        )
        nuevo_contexto += f"Bot: {coches}\n"


    return respuesta, nuevos_datos, nuevo_contexto, coches, reservar
