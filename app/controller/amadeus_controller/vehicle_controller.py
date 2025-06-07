from fastapi import APIRouter, HTTPException, Query
from amadeus import Client
import random
from fastapi import APIRouter, HTTPException
import httpx
from app.models.amadeus_pydantic.vehicle import (
    VehicleSearchQuery,
    VehicleSearchResponse,
    VehicleInfo
)

UNSPLASH_ACCESS_KEY = "Xsq9kwtxR36_uK4vk0FgB5AleqqPUkla8H62UHNVpjk"

amadeus = Client(
    client_id='GIsfA7oZrgp2EvhFPAOxZec3BNbb3glg',
    client_secret='0Bf6uymrGEPfB2Vr'
)

router = APIRouter(
    tags=["Amadeus Controller"],
     responses={
        200: {"description": "Request completed successfully"},
        400: {"description": "Bad request due to invalid parameters"},
        500: {"description": "Internal server error"},
    },
)

@router.post("/vehicle-search", response_model=VehicleSearchResponse)
async def search_vehicles(query: VehicleSearchQuery) -> VehicleSearchResponse:
    try:
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


@router.get("/vehicle-image/")
async def get_vehicle_image(
    brand: str = Query(..., description="Marca del vehículo"),
    model: str = Query(..., description="Modelo del vehículo")
):
    if not UNSPLASH_ACCESS_KEY:
        raise HTTPException(status_code=500, detail="Falta la clave de API de Unsplash")

    url = "https://api.unsplash.com/search/photos"
    params = {
        "query": f"{brand} {model}",
        "client_id": UNSPLASH_ACCESS_KEY,
        "orientation": "landscape",
        "per_page": 1
    }

    async with httpx.AsyncClient() as client:
        try:
            res = await client.get(url, params=params)
            res.raise_for_status()
            data = res.json()
        except Exception as e:
            raise HTTPException(status_code=503, detail=f"Error al conectar con Unsplash: {e}")

        if not data.get("results"):
            params["query"] = brand
            try:
                res = await client.get(url, params=params)
                res.raise_for_status()
                data = res.json()
            except Exception as e:
                raise HTTPException(status_code=503, detail=f"Error al conectar con Unsplash en fallback: {e}")

        if not data.get("results"):
            raise HTTPException(status_code=404, detail="No se encontraron imágenes para ese vehículo")

        image_url = data["results"][0]["urls"]["regular"]
        return {"image_url": image_url}





