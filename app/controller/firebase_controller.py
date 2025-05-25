from fastapi import APIRouter, HTTPException, status
from datetime import datetime
from passlib.context import CryptContext
from models.users.user_pydantic_firebase import UserCreate, UserLogin

from database.firebase import (
    email_exists,
    create_user,
    get_user_by_email,
    update_user,
    db
)

router = APIRouter(prefix="/auth", tags=["Authentication"])
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Modified Endpoints

@router.post("/register")
async def register_user(user: UserCreate):
    """
    /**
     * @brief Registers a new user in the system.
     *
     * @param user UserCreate Pydantic model containing user registration data.
     *
     * @return dict Returns the user ID, email and name of the newly created user.
     *
     * @throws HTTPException 400 if the email is already registered.
     */
    """

    if email_exists(user.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email is already registered"
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
        "roles": ["user"]
    }

    user_id = create_user(user_data)
    return {"id": user_id, "email": user.email, "nombre": user.nombre}


@router.post("/login")
async def login_user(credentials: UserLogin):
    """
    /**
     * @brief Authenticates a user with email and password.
     *
     * @param credentials UserLogin Pydantic model containing login data.
     *
     * @return dict Returns the user's ID, email and name upon successful authentication.
     *
     * @throws HTTPException 404 if user is not found or inactive.
     * @throws HTTPException 401 if the password is incorrect.
     */
    """

    user_data = get_user_by_email(credentials.email)

    if not user_data or not user_data.get("active", True):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found or inactive"
        )

    if not pwd_context.verify(credentials.password, user_data["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect password"
        )

    # Update last login date/time
    user_ref = db.collection("usuarios").where("email", "==", credentials.email).limit(1).get()[0]
    update_user(user_ref.id, {"last_login": datetime.now()})

    return {
        "id": user_ref.id,
        "email": user_data["email"],
        "nombre": user_data["nombre"]
    }
