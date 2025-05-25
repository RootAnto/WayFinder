# main_chat.py

from langchain_ollama import OllamaLLM
from langchain_core.prompts import ChatPromptTemplate
from bussiness_info import info
from extractor import extraer_datos
from funciones import buscar_vuelos

# Template para el mensaje al modelo
template = """
Eres un asistente de viajes que responde en español.

Información de la empresa:
{bussiness_info}

Historial de conversación:
{context}

Usuario: {question}
Asistente:
"""

# Configuración del modelo Llama 3.2 (1B)
model = OllamaLLM(
    model="llama3.2",
    temperature=0.7,
    system="""
Eres un asistente de viajes en español. Tu tarea es ayudar al usuario a buscar vuelos.

Si el usuario saluda o no dice nada útil, respóndele educadamente y pregúntale desde dónde desea volar.

Haz preguntas breves si faltan datos como:
- origen
- destino
- fecha de salida
- tipo de pasajero

No inventes datos. No repitas información. No hables de cosas fuera del contexto de vuelos.
"""
)

# Encadenar el prompt y el modelo
prompt = ChatPromptTemplate.from_template(template)
chain = prompt | model

# Estado global de los datos de vuelo
datos_vuelo = {
    "origen": None,
    "destino": None,
    "fecha_salida": None,
    "fecha_regreso": None,
    "tipo_pasajero": None
}

# Función para actualizar los datos extraídos manteniendo los anteriores
def actualizar_datos_vuelo(nuevos_datos):
    for campo, valor in nuevos_datos.items():
        if valor not in [None, "null", ""]:
            datos_vuelo[campo] = valor

# Chat principal
def chat():
    print("🛫 Bienvenido al chatbot de vuelos")
    context = ""

    while True:
        question = input("Tú: ").strip()
        if question.lower() in ["stop", "salir"]:
            print("Bot: Gracias por usar el chatbot. ¡Buen viaje! ✈️")
            break

        # Llamada al modelo de lenguaje
        result = chain.invoke({
            "bussiness_info": info,
            "context": context,
            "question": question
        })
        respuesta = result.content if hasattr(result, 'content') else str(result)
        print("Bot:", respuesta)

        # Acumular contexto para futuras respuestas
        context += f"Tú: {question}\nBot: {respuesta}\n"

        # Extraer datos solo si es relevante
        palabras_clave = ["vuelo", "viaje", "reservar", "salida", "ida", "llegada", "regreso", "origen", "destino", "fecha"]
        if any(palabra in question.lower() for palabra in palabras_clave):
            nuevos_datos = extraer_datos(question)
            print("🎯 Datos extraídos:", nuevos_datos)
            actualizar_datos_vuelo(nuevos_datos)
            print("🧠 Estado acumulado:", datos_vuelo)

        # Condición mínima para lanzar búsqueda
        if all([datos_vuelo["origen"], datos_vuelo["destino"], datos_vuelo["fecha_salida"], datos_vuelo["tipo_pasajero"]]):
            vuelos = buscar_vuelos(
                origen=datos_vuelo["origen"],
                destino=datos_vuelo["destino"],
                fecha_salida=datos_vuelo["fecha_salida"],
                fecha_regreso=datos_vuelo["fecha_regreso"],
                pasajeros=1,
                tipo_pasajero=datos_vuelo["tipo_pasajero"]
            )
            print("Bot:", vuelos)
            context += f"Bot: {vuelos}\n"

            # Reiniciar búsqueda (puedes cambiar esto si deseas que siga preguntando más)
            for k in datos_vuelo:
                datos_vuelo[k] = None
            print("🔄 Datos reiniciados para una nueva búsqueda.")


if __name__ == "__main__":
    chat()
