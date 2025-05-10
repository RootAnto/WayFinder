from fastapi import APIRouter, HTTPException
from amadeus import Client
import random
from fastapi import APIRouter, HTTPException
from models.pydantic_model_vehicle import (
    VehicleSearchQuery,
    VehicleSearchResponse,
    VehicleInfo
)

router = APIRouter()

amadeus = Client(
    client_id='GIsfA7oZrgp2EvhFPAOxZec3BNbb3glg',
    client_secret='0Bf6uymrGEPfB2Vr'
)

@router.post("/vehicle-search", response_model=VehicleSearchResponse, tags=["Vehicles"])
async def search_vehicles(query: VehicleSearchQuery) -> VehicleSearchResponse:
    try:
        # Diccionario con marcas y modelos por ciudad
        city_vehicles = {
            "MAD": [("SEAT", "Ibiza"), ("Renault", "Clio"), ("BMW", "X1")],
            "BCN": [("Ford", "Focus"), ("Volkswagen", "Golf"), ("Tesla", "Model 3")],
            "PAR": [("Peugeot", "208"), ("Citroën", "C3"), ("Mercedes", "A-Class")],
            "ROM": [("Fiat", "500"), ("Alfa Romeo", "Giulietta"), ("Audi", "A3")]
        }

        location = query.location.upper()
        vehicle_list = city_vehicles.get(location, [("Toyota", "Corolla"), ("Honda", "Civic"), ("Nissan", "Micra")])

        simulated_vehicles = []
        for i in range(query.limit or 10):
            brand, model = random.choice(vehicle_list)
            vehicle_id = f"{location[:3]}-{i+1:03d}"
            price = round(random.uniform(30, 120), 2)
            year = random.randint(2018, 2024)

            simulated_vehicles.append(VehicleInfo(
                vehicleId=vehicle_id,
                name=f"{brand} {model}",
                cityCode=location,
                available=True,
                pricePerDay=price,
                currency="EUR",
                vehicleType=query.vehicleType,
                brand=brand,
                model=model,
                year=year,
                seats=random.choice([4, 5, 7]),
                doors=random.choice([3, 4, 5]),
                transmission=random.choice(["Manual", "Automatic"]),
                fuelType=random.choice(["Gasoline", "Diesel", "Electric"])
            ))

        return VehicleSearchResponse(
            data=simulated_vehicles,
            count=len(simulated_vehicles)
        )

    except Exception as error:
        raise HTTPException(status_code=500, detail=f"Internal error while searching vehicles: {str(error)}")