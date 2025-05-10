# app.py
from fastapi import FastAPI
import uvicorn
from controller.travel import router as travel_router
from fastapi.middleware.cors import CORSMiddleware
from controller.hotel_controller import router as hotel_router
from controller.vehicle_controller import router as vehicle_router
from controller.automatic_travel_controller import router as automatic_travel_controller

app = FastAPI()

# CORS para permitir conexión desde el frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # para desarrollo, en producción más restringido
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the travel router
app.include_router(travel_router)
app.include_router(hotel_router)
app.include_router(vehicle_router)
app.include_router(automatic_travel_controller)

if __name__ == "__main__":
    uvicorn.run("app:app", host="127.0.0.1", port=8001, reload=True)
