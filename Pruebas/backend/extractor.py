# extractor.py
from langchain_ollama import OllamaLLM
from langchain_core.prompts import PromptTemplate
from langchain.output_parsers import PydanticOutputParser
from pydantic import BaseModel, Field
from typing import Optional

# Estructura de los datos de vuelo
class DatosVuelo(BaseModel):
    origen: Optional[str] = Field(description="Ciudad o aeropuerto de origen")
    destino: Optional[str] = Field(description="Ciudad o aeropuerto de destino")
    fecha_salida: Optional[str] = Field(description="Fecha de salida en formato DD/MM/AAAA")
    fecha_regreso: Optional[str] = Field(description="Fecha de regreso en formato DD/MM/AAAA, puede ser None")
    tipo_pasajero: Optional[str] = Field(description="adulto o niño")

# Parser para interpretar la salida del LLM en el modelo Pydantic
parser = PydanticOutputParser(pydantic_object=DatosVuelo)

# Prompt con instrucciones claras para extraer solo el JSON solicitado
prompt = PromptTemplate(
    template="""
Eres un extractor experto de datos de vuelo.

Tu tarea es extraer los siguientes datos desde un mensaje natural del usuario:
- Origen: ciudad o aeropuerto desde donde sale.
- Destino: ciudad o aeropuerto a donde viaja.
- Fecha de salida: formato DD/MM/AAAA.
- Fecha de regreso: mismo formato o null si no se indica.
- Tipo de pasajero: "adulto" o "niño".

⚠️ Reglas estrictas:
- No asumas nada si no se dice claramente.
- Ignora palabras como "como", "quiero", "me", "de", etc., si están solas.
- Los nombres de ciudades deben ser reales (ej: "Madrid", "Barcelona", "Palma de Mallorca").
- Acepta también códigos IATA (ej: "PMI", "MAD") y conviértelos si puedes.
- Devuelve únicamente un JSON válido. Nada más.

{format_instructions}

Mensaje del usuario:
{input}
""",
    input_variables=["input"],
    partial_variables={"format_instructions": parser.get_format_instructions()}
)

# Instancia del modelo Ollama (asegúrate que llama correctamente a tu modelo local)
model = OllamaLLM(model="llama3.2")

# Cadena de extracción: prompt -> modelo -> parser
extract_chain = prompt | model | parser

def extraer_datos(mensaje_usuario):
    try:
        # Ejecuta la cadena pasando el mensaje de usuario
        raw_result = extract_chain.invoke({"input": mensaje_usuario})
        print("RAW RESULT:", raw_result.model_dump() if hasattr(raw_result, 'model_dump') else raw_result)
  # Debug para ver la salida cruda

        # raw_result es una instancia de DatosVuelo (modelo Pydantic)
        if hasattr(raw_result, 'dict'):
            return raw_result.dict()

        # Si por alguna razón es dict, retornamos directo
        if isinstance(raw_result, dict):
            return raw_result

        # Si no se puede interpretar, devolvemos todo None
        return {
            "origen": None,
            "destino": None,
            "fecha_salida": None,
            "fecha_regreso": None,
            "tipo_pasajero": None
        }
    except Exception as e:
        print(f"[Error al extraer datos con IA]: {e}")
        return {
            "origen": None,
            "destino": None,
            "fecha_salida": None,
            "fecha_regreso": None,
            "tipo_pasajero": None
        }
