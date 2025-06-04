from fastapi import APIRouter, HTTPException, status
from datetime import datetime
from passlib.context import CryptContext
from firebase_admin import auth
from firebase_admin.exceptions import FirebaseError
from app.models.users.user_pydantic_firebase import UserCreate, UserLogin
from app.services.email_service import send_verification_email
from fastapi import Body

from app.database.firebase import (
    create_user,
    get_user_by_email,
    update_user,
    db
)

router = APIRouter(prefix="/auth", tags=["Authentication"])
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

@router.post("/register")
async def register_user(user: UserCreate):
    '''
    @brief Registers a new user in the system.

    @param user The user data including name, email, password, birthdate, etc.
    @return A dictionary with the new user's ID, email, and name.

    This endpoint creates a user in Firebase Authentication, hashes the password
    for internal storage, generates a verification email, stores user data in
    the application database, and sends a verification email to the user.
    '''
    try:

        firebase_user = auth.create_user(
            email=user.email,
            password=user.password,
            display_name=user.nombre
        )


        verification_link = auth.generate_email_verification_link(user.email)

        hashed_password = pwd_context.hash(user.password)


        user_data = {
            "firebase_uid": firebase_user.uid,
            "email": user.email,
            "nombre": user.nombre,
            "password": hashed_password,
            "birthdate": user.birthdate,
            "acceptTerms": user.acceptTerms,
            "email_verified": False,
            "created_at": datetime.now(),
            "active": True,
            "last_login": None,
            "roles": ["user"]
        }

        user_id = create_user(user_data)

        send_verification_email(to_email=user.email, to_name=user.nombre, verification_link=verification_link)

        return {"id": user_id, "email": user.email, "nombre": user.nombre}

    except auth.EmailAlreadyExistsError:
        raise HTTPException(status_code=400, detail="El correo ya está registrado")
    except FirebaseError as e:
        auth.delete_user(firebase_user.uid)
        raise HTTPException(status_code=400, detail=f"Error: {str(e)}")


@router.post("/login")
async def login_user(credentials: UserLogin):
    '''
    @brief Authenticates a user using Firebase and internal password verification.

    @param credentials UserLogin object containing email and password.
    @return A dictionary with the user's ID, email, and name if authentication succeeds.

    This endpoint checks the user's email verification status in Firebase,
    verifies the password against the stored hash, updates login metadata,
    and returns the basic user info upon successful login.
    '''
    try:

        firebase_user = auth.get_user_by_email(credentials.email)

        if not firebase_user.email_verified:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Debes verificar tu correo electrónico primero"
            )

        user_ref = db.collection("usuarios").where("firebase_uid", "==", firebase_user.uid).get()[0]
        update_user(user_ref.id, {
            "email_verified": firebase_user.email_verified,
            "last_login": datetime.now()
        })

        user_data = get_user_by_email(credentials.email)

        if not pwd_context.verify(credentials.password, user_data["password"]):
            raise HTTPException(status_code=401, detail="Contraseña incorrecta")

        update_user(user_ref.id, {"last_login": datetime.now()})

        return {"id": user_ref.id, "email": user_data["email"], "nombre": user_data["nombre"]}

    except auth.UserNotFoundError:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    except FirebaseError as e:
        raise HTTPException(status_code=500, detail=f"Error de Firebase: {str(e)}")

@router.post("/google-login")
async def google_login(email: str = Body(...), nombre: str = Body(...), uid: str = Body(...)):
    '''
    @brief Authenticates a user using Firebase and internal database.

    @param credentials: A UserLogin object containing the email and password.
    @return dict: Contains user ID, email, and name on successful login.

    This endpoint verifies the user's Firebase account and checks that the email
    is verified. Then, it validates the password against the hashed value in
    Firestore, updates the last login timestamp, and returns basic user info.
    '''
    try:
        firebase_user = auth.get_user(uid)

        existing_user = get_user_by_email(email)

        if not existing_user:
            user_data = {
                "firebase_uid": uid,
                "email": email,
                "nombre": nombre,
                "birthdate": None,
                "acceptTerms": True,
                "email_verified": firebase_user.email_verified,
                "created_at": datetime.now(),
                "active": True,
                "last_login": datetime.now(),
                "roles": ["user"]
            }
            user_id = create_user(user_data)
        else:
            user_id = existing_user["id"]
            update_user(user_id, {"last_login": datetime.now()})

        return {"id": user_id, "email": email, "nombre": nombre}

    except auth.UserNotFoundError:
        raise HTTPException(status_code=404, detail="Usuario de Google no encontrado")
    except FirebaseError as e:
        raise HTTPException(status_code=500, detail=f"Error de Firebase: {str(e)}")