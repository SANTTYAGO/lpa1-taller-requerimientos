from flask import Flask, jsonify, request
from flask_cors import CORS
from datetime import datetime, timedelta

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

@app.route('/api/hoteles', methods=['POST'])
def crear_hotel():
    datos = request.json
    
    # Generamos un ID automático
    nuevo_id = len(agencia.hoteles) + 1
    
    # Procesamos los servicios que vienen como un texto separado por comas
    servicios = [s.strip() for s in datos.get('servicios', '').split(',') if s.strip()]
    
    nuevo_hotel = Hotel(
        id_hotel=nuevo_id,
        nombre=datos.get('nombre'),
        direccion=datos.get('direccion'),
        telefono=datos.get('telefono'),
        correo=datos.get('correo'),
        ubicacion=datos.get('ubicacion'),
        servicios_generales=servicios,
        politicas_pago=datos.get('politicas_pago', 'Estándar'),
        politicas_cancelacion=datos.get('politicas_cancelacion', 'Estándar')
    )
    
    agencia.registrar_hotel(nuevo_hotel)
    print(f"🏨 Nuevo hotel registrado desde el sistema: {nuevo_hotel.nombre}")
    
    return jsonify({
        "mensaje": "Hotel registrado exitosamente",
        "hotel": nuevo_hotel.to_dict()
    }), 201

@app.route('/api/buscar', methods=['GET'])
def buscar():
    # Retorna las habitaciones disponibles usando el buscador de SistemaReservas
    resultados = agencia.buscar_habitaciones()
    return jsonify(resultados)

@app.route('/api/reservas', methods=['POST'])
def crear_reserva():
    datos = request.json
    hotel_id = datos.get('hotel_id')
    hab_numero = datos.get('habitacion_numero')
    nombre_cliente = datos.get('nombre_cliente')
    noches = int(datos.get('noches', 1))
    personas = int(datos.get('personas', 1))
    fecha_llegada_str = datos.get('fecha_llegada') # Ahora recibimos la fecha real

    if not fecha_llegada_str:
        return jsonify({"error": "Falta la fecha de llegada"}), 400

    hotel = next((h for h in agencia.hoteles if h.id_hotel == hotel_id), None)
    if not hotel: return jsonify({"error": "Hotel no encontrado"}), 404
        
    habitacion = next((h for h in hotel.habitaciones if h.numero == hab_numero), None)
    if not habitacion: return jsonify({"error": "Habitación no encontrada"}), 404

    # --- LÓGICA DE R8: FECHAS REALES Y VERIFICACIÓN ---
    fecha_inicio = datetime.strptime(fecha_llegada_str, '%Y-%m-%d')
    # Generamos la lista de fechas exactas (ej: ['2026-04-10', '2026-04-11'])
    fechas_reserva = [(fecha_inicio + timedelta(days=i)).strftime('%Y-%m-%d') for i in range(noches)]

    # Si algún día está ocupado, rechazamos la reserva
    if not habitacion.verificar_disponibilidad(fechas_reserva):
        return jsonify({"error": "La habitación ya está ocupada en algunas de estas fechas. Por favor elige otras."}), 400
    # --------------------------------------------------

    nuevo_cliente = Cliente(len(agencia.clientes) + 1, nombre_cliente, "No registrado", "No registrado", "No registrada")
    agencia.registrar_cliente(nuevo_cliente)

    nueva_reserva = Reserva(
        id_reserva=len(agencia.reservas) + 1,
        cliente=nuevo_cliente,
        habitacion=habitacion,
        fechas=fechas_reserva,
        cantidad_personas=personas
    )
    
    # --- LÓGICA DE R9: CONDICIONES DE PAGO ---
    if hotel.politicas_pago == "Pago al llegar":
        nueva_reserva.estado_pago = "Pendiente (Pago en destino)"
        habitacion.ocupar_fechas(fechas_reserva) # Ocupa el calendario sin cobrar ahora
    else:
        nueva_reserva.confirmar_pago() # Marca como pagado y ocupa el calendario
    # -----------------------------------------
    
    agencia.crear_reserva(nueva_reserva)

    print(f"\n✅ RESERVA: {nombre_cliente} - Hab: {habitacion.numero} - Desde {fechas_reserva[0]} al {fechas_reserva[-1]}\n")

    return jsonify({
        "mensaje": "Reserva confirmada exitosamente",
        "reserva": nueva_reserva.to_dict()
    }), 201

@app.route('/api/hoteles/<int:hotel_id>/promociones', methods=['POST'])
def nueva_promocion(hotel_id):
    datos = request.json
    # Buscamos el hotel específico en nuestra base de datos (agencia)
    hotel = next((h for h in agencia.hoteles if h.id_hotel == hotel_id), None)
    
    if hotel:
        hotel.agregar_promocion(datos['nombre'], datos['descuento'], datos['temporada'])
        return jsonify({"mensaje": "Promoción registrada con éxito"})
    return jsonify({"error": "Hotel no encontrado"}), 404

@app.route('/api/hoteles/<int:hotel_id>/servicios', methods=['POST'])
def nuevo_servicio(hotel_id):
    datos = request.json
    hotel = next((h for h in agencia.hoteles if h.id_hotel == hotel_id), None)
    
    if hotel:
        hotel.agregar_servicio_adicional(datos['servicio'])
        return jsonify({"mensaje": "Servicio añadido con éxito"})
    return jsonify({"error": "Hotel no encontrado"}), 404

# --- RUTA PARA R3 (REGISTRAR HABITACIONES EN UN HOTEL) ---
@app.route('/api/hoteles/<int:hotel_id>/habitaciones', methods=['POST'])
def nueva_habitacion(hotel_id):
    datos = request.json
    hotel = next((h for h in agencia.hoteles if h.id_hotel == hotel_id), None)
    
    if hotel:
        # Procesamos los servicios que vienen separados por comas
        servicios = [s.strip() for s in datos.get('servicios', '').split(',') if s.strip()]
        
        # Instanciamos la nueva habitación
        nueva_hab = Habitacion(
            numero=int(datos['numero']),
            tipo=datos['tipo'],
            descripcion=datos['descripcion'],
            precio_base=float(datos['precio_base']),
            servicios_incluidos=servicios,
            capacidad_maxima=int(datos['capacidad_maxima'])
        )
        
        # Usamos el método de la clase Hotel para agregarla (POO)
        hotel.agregar_habitacion(nueva_hab)
        print(f"🛏️ Nueva habitación {nueva_hab.numero} agregada al hotel {hotel.nombre}")
        
        return jsonify({"mensaje": "Habitación registrada con éxito", "habitacion": nueva_hab.to_dict()}), 201

    return jsonify({"error": "Hotel no encontrado"}), 404

# --- RUTA PARA R4 (CAMBIAR ESTADO DEL HOTEL) ---
@app.route('/api/hoteles/<int:hotel_id>/estado', methods=['PUT'])
def cambiar_estado_hotel(hotel_id):
    datos = request.json
    hotel = next((h for h in agencia.hoteles if h.id_hotel == hotel_id), None)
    
    if hotel:
        nuevo_estado = datos.get('estado')
        hotel.cambiar_estado(nuevo_estado)
        print(f"🔄 Estado del hotel '{hotel.nombre}' cambiado a: {nuevo_estado}")
        return jsonify({"mensaje": "Estado actualizado", "estado": hotel.estado})
    
    return jsonify({"error": "Hotel no encontrado"}), 404

# --- RUTA PARA R5 (CAMBIAR ESTADO DE HABITACIÓN) ---
@app.route('/api/hoteles/<int:hotel_id>/habitaciones/<int:hab_numero>/estado', methods=['PUT'])
def cambiar_estado_habitacion(hotel_id, hab_numero):
    datos = request.json
    hotel = next((h for h in agencia.hoteles if h.id_hotel == hotel_id), None)
    
    if hotel:
        # Buscamos la habitación específica dentro del hotel
        habitacion = next((hab for hab in hotel.habitaciones if hab.numero == hab_numero), None)
        if habitacion:
            nuevo_estado = datos.get('estado')
            habitacion.cambiar_estado(nuevo_estado)
            print(f"🔧 Estado de habitación {hab_numero} (Hotel {hotel.nombre}) cambiado a: {nuevo_estado}")
            return jsonify({"mensaje": "Estado actualizado", "estado": habitacion.estado})
        
        return jsonify({"error": "Habitación no encontrada"}), 404
        
    return jsonify({"error": "Hotel no encontrado"}), 404

# --- RUTA PARA R6 y R7 (COTIZADOR DINAMICO) ---
@app.route('/api/cotizar', methods=['POST'])
def cotizar_reserva():
    datos = request.json
    hotel_id = datos.get('hotel_id')
    hab_numero = datos.get('habitacion_numero')
    
    try:
        personas = int(datos.get('personas') or 1)
        noches = int(datos.get('noches') or 1)
        # Recibimos el mes de la fecha de llegada seleccionada en React
        mes_llegada = str(datos.get('mes_llegada', 1)) 
    except ValueError:
        personas, noches, mes_llegada = 1, 1, "1"

    hotel = next((h for h in agencia.hoteles if h.id_hotel == hotel_id), None)
    if hotel:
        hab = next((h for h in hotel.habitaciones if h.numero == hab_numero), None)
        if hab:
            try:
                # --- LÓGICA DE R7 (Resolución de Calendarios) ---
                temp_hotel = hotel.calendario.obtener_temporada(mes_llegada)
                temp_regional = agencia.calendario_regional.obtener_temporada(mes_llegada)
                
                # Si el hotel configuró este mes, gana el hotel. Si dice Heredada, usamos el regional.
                temporada_final = temp_regional if temp_hotel == "Heredada" else temp_hotel
                # ------------------------------------------------

                precio_noche = hab.calcular_precio(personas, temporada_final)
                total = precio_noche * noches
                return jsonify({
                    "precio_por_noche": precio_noche, 
                    "total": total,
                    "temporada_aplicada": temporada_final # Le devolvemos el dato a React
                }), 200
            except ValueError as e:
                return jsonify({"error": str(e)}), 400
                
    return jsonify({"error": "Habitación no encontrada"}), 404

# --- RUTAS PARA R7 (GESTIÓN DE CALENDARIOS ADMIN) ---

@app.route('/api/calendario/regional', methods=['GET', 'PUT'])
def gestionar_calendario_regional():
    if request.method == 'GET':
        return jsonify(agencia.calendario_regional.to_dict())
    else:
        datos = request.json
        mes = datos.get('mes')
        temporada = datos.get('temporada')
        agencia.calendario_regional.configurar_mes(mes, temporada)
        print(f"🌎 Calendario Regional: Mes {mes} cambiado a temporada {temporada}")
        return jsonify({"mensaje": "Calendario regional actualizado", "calendario": agencia.calendario_regional.to_dict()})

@app.route('/api/hoteles/<int:hotel_id>/calendario', methods=['PUT'])
def actualizar_calendario_hotel(hotel_id):
    datos = request.json
    mes = datos.get('mes')
    temporada = datos.get('temporada')
    
    hotel = next((h for h in agencia.hoteles if h.id_hotel == hotel_id), None)
    if hotel:
        hotel.calendario.configurar_mes(mes, temporada)
        print(f"🏨 Calendario {hotel.nombre}: Mes {mes} cambiado a {temporada}")
        return jsonify({"mensaje": "Calendario del hotel actualizado"})
    return jsonify({"error": "Hotel no encontrado"}), 404

if __name__ == '__main__':
    print("Iniciando API de Agencia de Viajes en el puerto 5000...")
    app.run(debug=True, port=5000)