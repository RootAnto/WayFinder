from pydantic import BaseModel

class UserCreate(BaseModel):
    """
    Model for user registration input.

    Attributes:
        email (str): User's email address.
        password (str): User's password.
        nombre (str): User's full name.
        birthdate (str): User's date of birth as a string.
        acceptTerms (bool): Indicates whether the user has accepted the terms and conditions.
    """
    email: str
    password: str
    nombre: str
    birthdate: str
    acceptTerms: bool

class UserLogin(BaseModel):
    """
    Model for user login input.

    Attributes:
        email (str): User's email address.
        password (str): User's password.
    """
    email: str
    password: str
