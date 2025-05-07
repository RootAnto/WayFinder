from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from datetime import datetime
from passlib.context import CryptContext
from database.firebase import (
    email_exists,
    create_user,
    get_user_by_email,
    update_user,
    db
)

router = APIRouter(prefix="/auth", tags=["Autenticación"])
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Modelos Pydantic
class UserCreate(BaseModel):
    email: str
    password: str
    nombre: str
    birthdate: str
    acceptTerms: bool

class UserLogin(BaseModel):
    email: str
    password: str

# Endpoints modificados
@router.post("/registrar")
async def registrar_usuario(user: UserCreate):
    if email_exists(user.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El correo ya está registrado"
        )
    
    hashed_password = pwd_context.hash(user.password)
    
    user_data = {
        "email": user.email,
        "password": hashed_password,
        "nombre": user.nombre,
        "birthdate": user.birthdate,
        "acceptTerms": user.acceptTerms,
        "created_at": datetime.now(),
        "active": True,
        "last_login": None,
        "roles": ["usuario"]
    }
    
    user_id = create_user(user_data)
    return {"id": user_id, "email": user.email, "nombre": user.nombre}

@router.post("/login")
async def login_user(credentials: UserLogin):
    user_data = get_user_by_email(credentials.email)
    
    if not user_data or not user_data.get("active", True):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado o inactivo"
        )
    
    if not pwd_context.verify(credentials.password, user_data["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Contraseña incorrecta"
        )
    
    # Actualizar último login
    user_ref = db.collection("usuarios").where("email", "==", credentials.email).limit(1).get()[0]
    update_user(user_ref.id, {"last_login": datetime.now()})
    
    return {
        "id": user_ref.id,
        "email": user_data["email"],
        "nombre": user_data["nombre"]
    }