import mysql.connector
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Database connection configuration
db_connection = mysql.connector.connect(
    host="localhost",
    user="root",
    password=""  # Empty password
)

# Create a cursor to execute queries
cursor = db_connection.cursor()

# Check if the database exists
cursor.execute("SHOW DATABASES LIKE 'wayfinder_db'")
result = cursor.fetchone()

# If the database does not exist, create it
if not result:
    cursor.execute("CREATE DATABASE wayfinder_db")

# Close the connection
cursor.close()
db_connection.close()

# Connection string for SQLAlchemy (using the standard 'mysql' dialect)
SQLALCHEMY_DATABASE_URL = "mysql://root:@localhost:3306/wayfinder_db"

# Configure SQLAlchemy
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create the base for models
Base = declarative_base()

# IMPORT YOUR SQLAlchemy MODELS HERE
from models.sqlalchemy_models import Flight, Travel

# Create tables in the database
Base.metadata.create_all(bind=engine)
