from flask import Flask, jsonify
from flask_cors import CORS

from models.hotel import Hotel
from models.habitacion import Habitacion
from models.sistema import SistemaReservas

app = Flask(__name__)
CORS(app) 

# Inicializamos nuestro cerebro central (R12)
agencia = SistemaReservas()

# --- Poblar datos iniciales con la nueva estructura ---

# Creando el Hotel 1 (Aruba) con todos sus nuevos parámetros
hotel1 = Hotel(
    id_hotel=1, 
    nombre="Aruba Beach Resort", 
    direccion="Calle 1", 
    telefono="555-01", 
    correo="info@aruba.com", 
    ubicacion="Aruba", 
    servicios_generales=["Piscina", "Wifi"], 
    politicas_pago="Pago por adelantado", 
    politicas_cancelacion="Estricta"
)
# Agregando habitaciones al Hotel 1 con sus nuevos parámetros
hotel1.agregar_habitacion(Habitacion(101, "Sencilla", "Vista al mar", 418, ["TV", "Minibar"], 2))
hotel1.agregar_habitacion(Habitacion(102, "Suite", "Balcón privado", 600, ["Jacuzzi", "Wifi"], 4))

agencia.registrar_hotel(hotel1)

# Creando el Hotel 2 (Cancún)
hotel2 = Hotel(
    id_hotel=2, 
    nombre="Cancún Paradise", 
    direccion="Avenida 2", 
    telefono="555-02", 
    correo="info@cancun.com", 
    ubicacion="Cancún", 
    servicios_generales=["Gimnasio", "Restaurante"], 
    politicas_pago="Pago al llegar", 
    politicas_cancelacion="Flexible"
)
# Agregando habitaciones al Hotel 2
hotel2.agregar_habitacion(Habitacion(201, "Doble", "Cerca a la playa", 350, ["TV", "Aire Acondicionado"], 4))

agencia.registrar_hotel(hotel2)
# -----------------------------------------------------

@app.route('/api/hoteles', methods=['GET'])
def obtener_hoteles():
    # Retornamos los hoteles usando la lista oficial del sistema
    return jsonify([h.to_dict() for h in agencia.hoteles])

@app.route('/api/buscar', methods=['GET'])
def buscar():
    # Retorna las habitaciones disponibles usando el buscador de SistemaReservas
    resultados = agencia.buscar_habitaciones()
    return jsonify(resultados)

if __name__ == '__main__':
    print("Iniciando API de Agencia de Viajes en el puerto 5000...")
    app.run(debug=True, port=5000)