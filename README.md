# Way Finder - Plataforma de Viajes

Way Finder es una aplicación moderna para la compra de billetes de viaje, reserva de vuelos y hoteles. Construida con **FastAPI** en el backend y **MariaDB** como base de datos, ofrece una experiencia rápida y segura para los usuarios. 

> **Estado del proyecto:** 🚀 En desarrollo

##  Características
Compra de billetes de trenes, autobuses y otros transportes.  
Reserva de vuelos con comparación de precios.  
Búsqueda y filtrado de hoteles con valoraciones.  
Notificaciones en tiempo real y alertas de viaje.  
Soporte multilingüe.  
Seguridad y protección de datos con autenticación JWT.  

---

## Estructura del Proyecto

# Manual de Instalación de WayFinder

## Requisitos Previos

Antes de instalar y ejecutar la aplicación, asegúrate de tener instalado lo siguiente:

- [Python](https://www.python.org/downloads/) (versión 3.8 o superior)
- [Git](https://git-scm.com/downloads)
- [XAMPP](https://www.apachefriends.org/es/index.html) (para MySQL)
- [Visual Studio Code](https://code.visualstudio.com/)
- [Node.js](https://nodejs.org/) (si la aplicación tiene frontend en JavaScript/React)

## Instalación de la Aplicación

### 1. Clonar el Repositorio
Abre una terminal y ejecuta:

```sh
git clone https://github.com/tu-usuario/wayfinder.git
cd wayfinder
```

### 2. Crear y Activar un Entorno Virtual
```sh
python -m venv venv  # Crear entorno virtual
```

- En Windows:
```sh
venv\Scripts\activate
```
- En Mac/Linux:
```sh
source venv/bin/activate
```

### 3. Instalar Dependencias
```sh
pip install -r requirements.txt
```

### 4. Configurar MySQL con XAMPP
1. Abre XAMPP y asegúrate de iniciar el servidor MySQL.
2. Abre **phpMyAdmin** y crea una base de datos llamada `wayfinder_db`.
3. Verifica que el usuario y la contraseña de MySQL en `database/db.py` sean correctos.

### 5. Crear las Tablas en la Base de Datos
Ejecuta el siguiente comando:
```sh
python database/db.py
```
Esto creará las tablas necesarias en `wayfinder_db`.

### 6. Ejecutar la Aplicación
```sh
python app.py
```

Si todo está correcto, el servidor iniciará en `http://127.0.0.1:8000`.

### 7. Probar la API en Swagger
Abre tu navegador y ve a:
```sh
http://127.0.0.1:8000/docs
```
Aquí podrás probar los endpoints de la API con Swagger.

## Solución de Problemas
- **Error de dependencias:** Asegúrate de haber ejecutado `pip install -r requirements.txt`.
- **Base de datos no encontrada:** Verifica que XAMPP y MySQL estén en ejecución y que `wayfinder_db` existe.
- **Servidor no inicia:** Revisa si hay errores en `app.py` y corrige la configuración de la base de datos.

---
