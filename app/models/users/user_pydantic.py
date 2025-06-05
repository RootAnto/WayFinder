from pydantic import BaseModel, EmailStr

class UserCreate(BaseModel):
    name: str
    email: EmailStr


class UserOut(BaseModel):
    uid: str
    name: str
    email: EmailStr

