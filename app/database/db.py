import mysql.connector
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Database connection configuration
db_connection = mysql.connector.connect(
    host="metro.proxy.rlwy.net",
    user="root",
    password="HamYeVRsyRpaArPQENEdusvaJjBDyUwc",
    port=40135,
    database="railway"  # Ya nos conectamos a la base railway directamente
)

# Create a cursor to execute queries
cursor = db_connection.cursor()

# (Opcional) Asegurarse de que una tabla o estructura exista
# Pero no intentes crear de nuevo la database, Railway ya la creó
# Podrías eliminar todo este chequeo de creación de database si quieres
# cursor.execute("SHOW TABLES")
# result = cursor.fetchall()
# print(result)

# Close the connection
cursor.close()
db_connection.close()

# Connection string for SQLAlchemy (using the standard 'mysql' dialect + connector)
SQLALCHEMY_DATABASE_URL = "mysql+mysqlconnector://root:HamYeVRsyRpaArPQENEdusvaJjBDyUwc@metro.proxy.rlwy.net:40135/railway"

# Configure SQLAlchemy
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create the base for models
Base = declarative_base()

# IMPORT YOUR SQLAlchemy MODELS HERE
from models.sqlalchemy_models import Flight, Travel

# Create tables in the database
Base.metadata.create_all(bind=engine)