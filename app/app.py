# app.py
from fastapi import FastAPI
import uvicorn
from controller.travel import router as viajes_router
from controller.fb import router as auth_router
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()

# CORS para permitir conexión desde el frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # para desarrollo, en producción más restringido
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Include the travel 
app.include_router(auth_router)
app.include_router(viajes_router)

if __name__ == "__main__":
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=True)
