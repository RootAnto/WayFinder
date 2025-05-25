from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from transformers import AutoTokenizer, AutoModelForCausalLM, pipeline

app = FastAPI()

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],    
    allow_headers=["*"],
)

# Cargar el modelo de DialoGPT y el tokenizador
tokenizer = AutoTokenizer.from_pretrained("microsoft/DialoGPT-medium")
model = AutoModelForCausalLM.from_pretrained("microsoft/DialoGPT-medium")
chatbot_pipe = pipeline("text-generation", model=model, tokenizer=tokenizer)

@app.post("/chatbot")
async def chatbot(request: Request):
    data = await request.json()
    user_message = data.get("message", "")

    try:
        # Generar respuesta
        generated = chatbot_pipe(user_message, max_length=100, num_return_sequences=1)
        reply = generated[0]["generated_text"]

        return JSONResponse(content={"reply": reply})
    except Exception as e:
        return JSONResponse(content={"reply": f"Error: {str(e)}"}, status_code=500)
