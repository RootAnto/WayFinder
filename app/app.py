from fastapi import FastAPI
import uvicorn
from fastapi.middleware.cors import CORSMiddleware
from controller.amadeus_controller.flight_controller import router as fligth_router
from controller.amadeus_controller.hotel_controller import router as hotel_router
from controller.amadeus_controller.vehicle_controller import router as vehicle_router
from controller.amadeus_controller.trip_controller import router as automatic_travel_router

app = FastAPI()

# CORS to allow connection from the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # para desarrollo, en producción más restringido
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
app.include_router(fligth_router)
app.include_router(hotel_router)
app.include_router(vehicle_router)
app.include_router(automatic_travel_router)

if __name__ == "__main__":
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=True)