from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Railway DB connection string using mysql+mysqlconnector
SQLALCHEMY_DATABASE_URL = (
    "mysql+mysqlconnector://root:HamYeVRsyRpaArPQENEdusvaJjBDyUwc"
    "@metro.proxy.rlwy.net:40135/railway"
)

# Create SQLAlchemy engine
engine = create_engine(SQLALCHEMY_DATABASE_URL)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for SQLAlchemy models
Base = declarative_base()

# Dependency for FastAPI endpoints
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
