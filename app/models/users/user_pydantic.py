from pydantic import BaseModel, EmailStr

class UserCreate(BaseModel):
    """
    Model for user creation input.

    Attributes:
        name (str): Full name of the user.
        email (EmailStr): Validated email address of the user.
    """
    name: str
    email: EmailStr


class UserOut(BaseModel):
    """
    Model for user data output.

    Attributes:
        uid (str): Unique identifier for the user.
        name (str): Full name of the user.
        email (EmailStr): Validated email address of the user.
    """
    uid: str
    name: str
    email: EmailStr

