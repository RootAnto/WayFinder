# app.py
from fastapi import FastAPI
import uvicorn
<<<<<<< HEAD
from controller.travel import router as viajes_router
from fastapi.middleware.cors import CORSMiddleware

=======
from controller.travel import router as travel_router
>>>>>>> 7524803da4bda6d3dbb0abbaf4fdbe0406b447e3

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

if __name__ == "__main__":
<<<<<<< HEAD
    uvicorn.run("app:app", host="127.0.0.1", port=8001, reload=True)
=======
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=True)

>>>>>>> 7524803da4bda6d3dbb0abbaf4fdbe0406b447e3
