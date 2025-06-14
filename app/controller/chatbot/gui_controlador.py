import tkinter as tk
from app.controller.chatbot.vuelos.chat_vuelos_gui import ChatVuelosWindow
from app.controller.chatbot.hoteles.chat_hoteles_gui import ChatHotelesWindow
from app.controller.chatbot.coches.caht_coches_gui import ChatCochesWindow 
from app.controller.chatbot.funciones import enviar_reserva_backend 
from pydantic import BaseModel
from typing import Optional

class User(BaseModel):
    email: str
    nombre: Optional[str] = None


def iniciar_chat_multifase(user: User):

    root = tk.Tk()
    root.withdraw()          

    # FASE 1 
    v_vuelos = ChatVuelosWindow(root)
    v_vuelos.wait_window()                  
    datos_vuelo = v_vuelos.resultado         
    print("DATOS VUELO =", datos_vuelo)



    # FASE 2  
    h_hoteles = ChatHotelesWindow(root)
    h_hoteles.datos_previos_vuelo = datos_vuelo
    h_hoteles.wait_window()
    datos_hotel = h_hoteles.resultado
    print("DATOS HOTEL =", datos_hotel)

    # FASE 3 
    c_coches = ChatCochesWindow(root)
    c_coches.datos_vuelo = datos_vuelo
    c_coches.datos_hotel = datos_hotel
    c_coches.wait_window()
    datos_coche = c_coches.resultado
    print("DATOS COCHE =", datos_coche)

    root.quit()

    enviar_reserva_backend(datos_vuelo, datos_hotel, datos_coche,user)
