from pathlib import Path
import firebase_admin
from firebase_admin import credentials, firestore
from firebase_admin.exceptions import FirebaseError
from datetime import datetime
from typing import Optional, Dict, Any

# Configuración Firebase
SERVICE_ACCOUNT_PATH = Path(__file__).parent / "serviceAccountKey.json"

if not firebase_admin._apps:
    try:
        cred = credentials.Certificate(str(SERVICE_ACCOUNT_PATH))
        firebase_admin.initialize_app(cred, {
            'projectId': 'wayfinder-6a444',
            'storageBucket': 'wayfinder-6a444.appspot.com'
        })
        print("✅ Firebase inicializado correctamente")
    except Exception as e:
        print(f"❌ Error inicializando Firebase: {str(e)}")
        raise

db = firestore.client()

# Operaciones CRUD
def email_exists(email: str) -> bool:
    """Verifica si un email ya está registrado"""
    users_ref = db.collection('usuarios')
    query = users_ref.where('email', '==', email).limit(1)
    return len(query.get()) > 0

def create_user(user_data: Dict[str, Any]) -> str:
    """Crea un nuevo usuario y devuelve su ID"""
    _, doc_ref = db.collection('usuarios').add(user_data)
    return doc_ref.id

def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    """Obtiene un usuario por email"""
    query = db.collection('usuarios').where('email', '==', email).limit(1)
    docs = query.get()
    return docs[0].to_dict() if docs else None

def update_user(user_id: str, updates: Dict[str, Any]) -> None:
    """Actualiza datos de usuario"""
    db.collection('usuarios').document(user_id).update(updates)

def get_user_by_id(user_id: str) -> Optional[Dict[str, Any]]:
    """Obtiene un usuario por ID"""
    doc = db.collection('usuarios').document(user_id).get()
    return doc.to_dict() if doc.exists else None