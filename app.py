# app.py
from fastapi import FastAPI
import uvicorn
from controller.travel import router as viajes_router

app = FastAPI()

# Include the travel router
app.include_router(viajes_router)

if __name__ == "__main__":
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=True)
