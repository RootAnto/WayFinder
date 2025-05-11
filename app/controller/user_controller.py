from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from models.users.user_pydantic import UserCreate, UserOut
from models.users.user_db import User
from database.db import get_db
import uuid

router = APIRouter(prefix="/users", tags=["Users"])

@router.post("/", response_model=UserOut)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    user_id = str(uuid.uuid4())
    db_user = User(id=user_id, **user.dict())
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user
