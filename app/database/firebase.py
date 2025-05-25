from pathlib import Path
import firebase_admin
from firebase_admin import credentials, firestore
from firebase_admin.exceptions import FirebaseError
from datetime import datetime
from typing import Optional, Dict, Any
from loguru import logger

# Configuración de logs
logger.add("logs/firebase.log", rotation="1 MB", retention="7 days", level="DEBUG")

# Configuración Firebase
SERVICE_ACCOUNT_PATH = Path(__file__).parent / "serviceAccountKey.json"

if not firebase_admin._apps:
    try:
        cred = credentials.Certificate(str(SERVICE_ACCOUNT_PATH))
        firebase_admin.initialize_app(cred, {
            'projectId': 'wayfinder-6a444',
            'storageBucket': 'wayfinder-6a444.appspot.com'
        })
        logger.success("✅ Firebase inicializado correctamente")
    except Exception as e:
        logger.exception(f"❌ Error inicializando Firebase: {str(e)}")
        raise

db = firestore.client()

# Operaciones CRUD
def email_exists(email: str) -> bool:
    """Verifica si un email ya está registrado"""
    try:
        logger.debug(f"Verificando si el email ya existe: {email}")
        users_ref = db.collection('usuarios')
        query = users_ref.where('email', '==', email).limit(1)
        results = query.get()
        exists = len(results) > 0
        logger.debug(f"Resultado existencia email '{email}': {exists}")
        return exists
    except Exception as e:
        logger.exception(f"Error al verificar existencia del email '{email}': {e}")
        raise

def create_user(user_data: Dict[str, Any]) -> str:
    """Crea un nuevo usuario y devuelve su ID"""
    try:
        logger.debug(f"Creando usuario con datos: {user_data}")
        _, doc_ref = db.collection('usuarios').add(user_data)
        logger.success(f"✅ Usuario creado con ID: {doc_ref.id}")
        return doc_ref.id
    except Exception as e:
        logger.exception(f"❌ Error al crear usuario: {e}")
        raise

def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    """Obtiene un usuario por email"""
    try:
        logger.debug(f"Buscando usuario con email: {email}")
        query = db.collection('usuarios').where('email', '==', email).limit(1)
        docs = query.get()
        if docs:
            logger.debug(f"Usuario encontrado: {docs[0].to_dict()}")
            return docs[0].to_dict()
        else:
            logger.debug(f"No se encontró usuario con email: {email}")
            return None
    except Exception as e:
        logger.exception(f"❌ Error buscando usuario por email '{email}': {e}")
        raise

def update_user(user_id: str, updates: Dict[str, Any]) -> None:
    """Actualiza datos de usuario"""
    try:
        logger.debug(f"Actualizando usuario {user_id} con: {updates}")
        db.collection('usuarios').document(user_id).update(updates)
        logger.success(f"✅ Usuario {user_id} actualizado correctamente")
    except Exception as e:
        logger.exception(f"❌ Error actualizando usuario '{user_id}': {e}")
        raise

def get_user_by_id(user_id: str) -> Optional[Dict[str, Any]]:
    """Obtiene un usuario por ID"""
    try:
        logger.debug(f"Buscando usuario por ID: {user_id}")
        doc = db.collection('usuarios').document(user_id).get()
        if doc.exists:
            logger.debug(f"Usuario encontrado: {doc.to_dict()}")
            return doc.to_dict()
        else:
            logger.debug(f"No se encontró usuario con ID: {user_id}")
            return None
    except Exception as e:
        logger.exception(f"❌ Error obteniendo usuario por ID '{user_id}': {e}")
        raise
