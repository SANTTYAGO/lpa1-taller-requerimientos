from flask import Flask, jsonify, request
from flask_cors import CORS

from models.hotel import Hotel
from models.habitacion import Habitacion
from models.sistema import SistemaReservas
from models.cliente import Cliente
from models.reserva import Reserva

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

@app.route('/api/reservas', methods=['POST'])
def crear_reserva():
    # 1. Recibimos los datos en formato JSON desde React
    datos = request.json
    
    hotel_id = datos.get('hotel_id')
    hab_numero = datos.get('habitacion_numero')
    nombre_cliente = datos.get('nombre_cliente')
    noches = int(datos.get('noches', 1))
    personas = int(datos.get('personas', 1))

    # 2. Buscar el hotel y la habitación solicitada
    hotel = next((h for h in agencia.hoteles if h.id_hotel == hotel_id), None)
    if not hotel: return jsonify({"error": "Hotel no encontrado"}), 404
        
    habitacion = next((h for h in hotel.habitaciones if h.numero == hab_numero), None)
    if not habitacion: return jsonify({"error": "Habitación no encontrada"}), 404

    # 3. Crear al cliente (R11)
    # Generamos un ID autoincremental simple basado en la cantidad de clientes actuales
    nuevo_cliente = Cliente(len(agencia.clientes) + 1, nombre_cliente, "No registrado", "No registrado", "No registrada")
    agencia.registrar_cliente(nuevo_cliente)

    # 4. Crear la reserva (R16)
    # Simulamos un arreglo de fechas para ocupar el calendario de la habitación
    fechas_reserva = [f"Noche {i+1}" for i in range(noches)]
    
    nueva_reserva = Reserva(
        id_reserva=len(agencia.reservas) + 1,
        cliente=nuevo_cliente,
        habitacion=habitacion,
        fechas=fechas_reserva,
        cantidad_personas=personas
    )
    
    # 5. Confirmar pago y guardar en el sistema
    nueva_reserva.confirmar_pago()
    agencia.crear_reserva(nueva_reserva)

    print(f"\n✅ ¡NUEVA RESERVA EXITOSA! Cliente: {nombre_cliente} - Hotel: {hotel.nombre} - Habitación: {habitacion.numero}\n")

    return jsonify({
        "mensaje": "Reserva confirmada exitosamente",
        "reserva": nueva_reserva.to_dict()
    }), 201

if __name__ == '__main__':
    print("Iniciando API de Agencia de Viajes en el puerto 5000...")
    app.run(debug=True, port=5000)