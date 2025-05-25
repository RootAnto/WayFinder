from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from models.users.user_pydantic import UserCreate, UserOut
from models.users.user_db import User
from database.db import get_db

router = APIRouter(prefix="/users", tags=["Users"])

# Crear usuario
@router.post("/", response_model=UserOut)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    # Validación: ¿ya existe el usuario?
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Usar ID desde Firebase en producción; aquí lo generamos como UUID temporal
    from uuid import uuid4
    user_id = str(uuid4())

    db_user = User(id=user_id, **user.dict())
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# Obtener usuario por ID
@router.get("/{user_id}", response_model=UserOut)
def get_user(user_id: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

# Listar todos los usuarios
@router.get("/", response_model=list[UserOut])
def list_users(db: Session = Depends(get_db)):
    return db.query(User).all()

# Eliminar usuario
@router.delete("/{user_id}", response_model=dict)
def delete_user(user_id: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(user)
    db.commit()
    return {"detail": "User deleted"}

# Actualizar usuario (nombre/email)
@router.put("/{user_id}", response_model=UserOut)
def update_user(user_id: str, updated_user: UserCreate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.name = updated_user.name
    user.email = updated_user.email
    db.commit()
    db.refresh(user)
    return user
