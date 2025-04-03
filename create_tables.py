# create_tables.py
from database.db import engine
from models import sqlalchemy_models, pydantic_models
from database.db import Base

# Crete tables in database (if nor exist)
Base.metadata.create_all(bind=engine)

