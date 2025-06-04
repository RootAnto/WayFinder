from pydantic import BaseModel

class UserCreate(BaseModel):
    """
    Model for creating a new user.

    Attributes:
        email (str): User's email address.
        password (str): User's password.
        nombre (str): User's full name.
        birthdate (str): User's birth date as a string.
        acceptTerms (bool): Whether the user has accepted terms and conditions.
    """
    email: str
    password: str
    nombre: str
    birthdate: str
    acceptTerms: bool

class UserLogin(BaseModel):
    """
    Model for user login credentials.

    Attributes:
        email (str): User's email address.
        password (str): User's password.
    """
    email: str
    password: str