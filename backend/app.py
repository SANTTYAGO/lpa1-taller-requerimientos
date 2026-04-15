from flask import Flask, jsonify, request
from flask_cors import CORS
from datetime import datetime, timedelta

from models.hotel import Hotel
from models.habitacion import Habitacion
from models.sistema import SistemaReservas
from models.cliente import Cliente
from models.reserva import Reserva
from models.comentario import Comentario

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
# --- Creando habitaciones con comentarios y fotos de prueba (R13) ---
hab_sencilla = Habitacion(101, "Sencilla", "Hermosa vista al mar con balcón privado y decoración caribeña.", 418, ["TV", "Minibar", "Caja Fuerte", "Cafetera"], 2, fotos=["/static/aruba.png"])
hab_sencilla.agregar_comentario(Comentario("María G.", 5, "¡Increíble! La cama es comodísima y el minibar estaba lleno."))
hab_sencilla.agregar_comentario(Comentario("Juan P.", 4, "Muy buena atención, aunque el internet falló un poco en la noche."))

hotel1.agregar_habitacion(hab_sencilla)
hotel1.agregar_habitacion(Habitacion(102, "Suite", "Lujo total con jacuzzi privado.", 600, ["Jacuzzi", "Wifi Premium", "Room Service"], 4))
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

# ==========================================
# NUEVOS HOTELES PARA EL CATÁLOGO (EJEMPLOS)
# ==========================================

# Ejemplo 3: París (Lujo Supremo)
hotel3 = Hotel(3, "Aura Paris Luxury", "Avenue des Champs-Élysées 15", "+33 1 2345 6789", "paris@auratravel.com", "Paris", ["Spa Premium", "Restaurante Michelin", "Valet Parking"], "Pago por adelantado", "Estricta")
hab301 = Habitacion(301, "Suite", "Vista a la Torre Eiffel, decoración exquisita y balcón francés.", 850, ["Champagne de bienvenida", "Desayuno a la carta", "Tina de mármol"], 2)
hab301.agregar_comentario(Comentario("Sophie L.", 5, "Magnifique! La mejor vista de París desde la cama."))
hab301.agregar_comentario(Comentario("Carlos M.", 4, "Todo excelente, aunque el ascensor es pequeño."))
hotel3.agregar_habitacion(hab301)
hotel3.agregar_habitacion(Habitacion(302, "Deluxe", "Habitación amplia y elegante en el centro de París.", 500, ["Wifi Premium", "Máquina Nespresso"], 2))
agencia.registrar_hotel(hotel3)

# Ejemplo 4: Nueva York (Estilo Urbano/Moderno)
hotel4 = Hotel(4, "Manhattan Skyline Suites", "Times Square 42nd St", "+1 212 555 0198", "nyc@auratravel.com", "New York", ["Rooftop Bar", "Gimnasio 24/7", "Centro de Negocios"], "Pago por adelantado", "Moderada")
hab401 = Habitacion(401, "Doble", "Ubicada en el piso 40 con ventanales de piso a techo y vistas a la ciudad.", 420, ["Camas King", "Smart TV 65", "Cortinas automáticas"], 4)
hab401.agregar_comentario(Comentario("Michael R.", 4, "Ubicación inmejorable. Un poco ruidoso en la noche por el tráfico, pero la vista lo vale."))
hotel4.agregar_habitacion(hab401)
agencia.registrar_hotel(hotel4)

# Ejemplo 5: Tokio (Tecnología y Minimalismo)
hotel5 = Hotel(5, "Tokyo Neon Boutique", "Shinjuku City, Tokyo", "+81 3 9876 5432", "tokyo@auratravel.com", "Tokio", ["Wifi Alta Velocidad", "Onsen Tradicional", "Bar Robot"], "Pago al llegar", "Flexible")
hab501 = Habitacion(501, "Sencilla", "Cápsula premium con tecnología inteligente y luces adaptativas.", 120, ["Control por tablet", "Purificador de aire", "Inodoro inteligente"], 1)
hab502 = Habitacion(502, "Doble", "Estilo Ryokan moderno con tatami y camas bajas.", 280, ["Bañera de inmersión", "Té matcha de cortesía"], 2)
hab502.agregar_comentario(Comentario("Andrea T.", 5, "Me encantó la mezcla entre lo tradicional japonés y lo futurista."))
hotel5.agregar_habitacion(hab501)
hotel5.agregar_habitacion(hab502)
agencia.registrar_hotel(hotel5)

# Ejemplo 6: Roma (Boutique Histórico)
hotel6 = Hotel(6, "Roma Antica Palace", "Via del Corso 101", "+39 06 1234 5678", "rome@auratravel.com", "Rome", ["Desayuno Buffet", "Tour Guiado", "Alquiler de Vespas"], "Pago al llegar", "Flexible")
hab601 = Habitacion(601, "Familiar", "Amplia habitación estilo renacentista, ideal para viajes familiares a Italia.", 350, ["2 Camas Queen", "Terraza pequeña", "Cuna disponible"], 4)
hab601.agregar_comentario(Comentario("Familia Gómez", 5, "Espacio de sobra para los niños y cerca de la Fontana di Trevi."))
hotel6.agregar_habitacion(hab601)
agencia.registrar_hotel(hotel6)

# Ejemplo 7: Miami (Playa y Fiesta)
hotel7 = Hotel(7, "Ocean Drive Aura", "Ocean Drive 700", "+1 305 555 1234", "miami@auratravel.com", "Miami", ["Piscina infinita", "DJ en vivo", "Acceso privado a la playa"], "Pago por adelantado", "Estricta")
hab701 = Habitacion(701, "Suite", "Suite frente al mar con terraza privada, perfecta para relajarse o festejar.", 600, ["Sistema de sonido envolvente", "Mini bar premium", "Jacuzzi en terraza"], 3)
hotel7.agregar_habitacion(hab701)
agencia.registrar_hotel(hotel7)

# Ejemplo 8: Hawaii (Paraíso y Naturaleza)
hotel8 = Hotel(8, "Aloha Nature Resort", "Waikiki Beach", "+1 808 111 2222", "hawaii@auratravel.com", "Hawaii", ["Clases de Surf", "Spa Hawaiano", "Senderismo"], "Pago al llegar", "Moderada")
hab801 = Habitacion(801, "Doble", "Bungalow ecológico rodeado de selva y a pasos del mar.", 380, ["Hamaca exterior", "Ducha al aire libre", "Desayuno tropical"], 2)
hab801.agregar_comentario(Comentario("Leo P.", 5, "El sonido de las olas te arrulla para dormir. Un sueño hecho realidad."))
hotel8.agregar_habitacion(hab801)
agencia.registrar_hotel(hotel8)

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
    # R12: Capturamos los parámetros de la URL (?ubicacion=...&precio_max=...)
    ubicacion = request.args.get('ubicacion')
    precio_max = request.args.get('precio_max', type=float)
    calificacion_min = request.args.get('calificacion_min', type=float)
    
    # Manejo de fechas si se envían
    fecha_llegada = request.args.get('llegada')
    noches = request.args.get('noches', type=int)
    fechas_lista = []
    
    if fecha_llegada and noches:
        inicio = datetime.strptime(fecha_llegada, '%Y-%m-%d')
        fechas_lista = [(inicio + timedelta(days=i)).strftime('%Y-%m-%d') for i in range(noches)]

    resultados = agencia.buscar_habitaciones(
        ubicacion=ubicacion, 
        precio_max=precio_max, 
        calificacion_min=calificacion_min,
        fechas=fechas_lista
    )
    return jsonify(resultados)

@app.route('/api/reservas', methods=['POST'])
def crear_reserva():
    datos = request.json
    hotel_id = datos.get('hotel_id')
    hab_numero = datos.get('habitacion_numero')
    
    # --- R11: Capturamos TODOS los datos del cliente ---
    nombre_cliente = datos.get('nombre_cliente')
    telefono_cliente = datos.get('telefono_cliente', 'N/A')
    correo_cliente = datos.get('correo_cliente', 'N/A')
    direccion_cliente = datos.get('direccion_cliente', 'N/A')
    # ---------------------------------------------------
    
    noches = int(datos.get('noches', 1))
    personas = int(datos.get('personas', 1))
    fecha_llegada_str = datos.get('fecha_llegada')

    if not fecha_llegada_str: return jsonify({"error": "Falta la fecha de llegada"}), 400

    hotel = next((h for h in agencia.hoteles if h.id_hotel == hotel_id), None)
    if not hotel: return jsonify({"error": "Hotel no encontrado"}), 404
        
    habitacion = next((h for h in hotel.habitaciones if h.numero == hab_numero), None)
    if not habitacion: return jsonify({"error": "Habitación no encontrada"}), 404

    fecha_inicio = datetime.strptime(fecha_llegada_str, '%Y-%m-%d')
    mes_llegada = str(fecha_inicio.month)
    fechas_reserva = [(fecha_inicio + timedelta(days=i)).strftime('%Y-%m-%d') for i in range(noches)]

    if not habitacion.verificar_disponibilidad(fechas_reserva):
        return jsonify({"error": "Fechas ocupadas"}), 400

    temp_hotel = hotel.calendario.obtener_temporada(mes_llegada)
    temp_regional = agencia.calendario_regional.obtener_temporada(mes_llegada)
    temporada_final = temp_regional if temp_hotel == "Heredada" else temp_hotel

    # --- R11: Creamos el objeto Cliente con su información completa ---
    nuevo_cliente = Cliente(
        id_cliente=len(agencia.clientes) + 1, 
        nombre_completo=nombre_cliente, 
        telefono=telefono_cliente, 
        correo=correo_cliente, 
        direccion=direccion_cliente
    )
    agencia.registrar_cliente(nuevo_cliente)
    # ------------------------------------------------------------------

    nueva_reserva = Reserva(
        id_reserva=len(agencia.reservas) + 1,
        cliente=nuevo_cliente,
        habitacion=habitacion,
        hotel=hotel,
        fechas=fechas_reserva,
        cantidad_personas=personas,
        temporada=temporada_final
    )
    
    if hotel.politicas_pago == "Pago al llegar":
        nueva_reserva.estado_pago = "Pendiente (Pago en destino)"
        habitacion.ocupar_fechas(fechas_reserva)
    else:
        nueva_reserva.confirmar_pago()
        
    agencia.crear_reserva(nueva_reserva)
    return jsonify({"mensaje": "Reserva confirmada exitosamente", "reserva": nueva_reserva.to_dict()}), 201

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

# --- RUTAS PARA R10 (GESTIÓN Y CANCELACIÓN DE RESERVAS) ---
@app.route('/api/reservas', methods=['GET'])
def obtener_reservas():
    # Devuelve el listado al panel de administración
    return jsonify([r.to_dict() for r in reversed(agencia.reservas)])

@app.route('/api/reservas/<int:id_reserva>/cancelar', methods=['PUT'])
def cancelar_reserva(id_reserva):
    reserva = next((r for r in agencia.reservas if r.id_reserva == id_reserva), None)
    if reserva:
        if "Cancelada" in reserva.estado_pago:
            return jsonify({"error": "La reserva ya estaba cancelada"}), 400
            
        # Llamamos al método de la clase (POO puro)
        reembolso, penalidad = reserva.cancelar_reserva()
        print(f"🚫 Reserva {id_reserva} cancelada. Reembolso: ${reembolso} | Penalidad: ${penalidad}")
        
        return jsonify({
            "mensaje": "Reserva cancelada con éxito",
            "estado": reserva.estado_pago,
            "reembolso": reembolso,
            "penalidad": penalidad
        }), 200
        
    return jsonify({"error": "Reserva no encontrada"}), 404

# --- RUTA PARA R14 (DEJAR UN COMENTARIO EN UNA HABITACIÓN) ---
@app.route('/api/hoteles/<int:hotel_id>/habitaciones/<int:hab_numero>/comentarios', methods=['POST'])
def agregar_comentario(hotel_id, hab_numero):
    datos = request.json
    hotel = next((h for h in agencia.hoteles if h.id_hotel == hotel_id), None)
    
    if hotel:
        # Buscamos la habitación específica
        habitacion = next((hab for hab in hotel.habitaciones if hab.numero == hab_numero), None)
        if habitacion:
            # Creamos el nuevo objeto Comentario
            nuevo_comentario = Comentario(
                autor=datos.get('autor', 'Huésped Anónimo'),
                calificacion=int(datos.get('calificacion', 5)),
                texto=datos.get('texto', '')
            )
            # Lo agregamos usando el método de la clase (POO)
            habitacion.agregar_comentario(nuevo_comentario)
            print(f"📝 Nuevo comentario ({nuevo_comentario.calificacion}⭐) en Habitación {hab_numero} de {hotel.nombre}")
            
            # Devolvemos la habitación actualizada para que React refresque la pantalla
            return jsonify({
                "mensaje": "Comentario añadido con éxito", 
                "habitacion": habitacion.to_dict()
            }), 201
            
        return jsonify({"error": "Habitación no encontrada"}), 404
        
    return jsonify({"error": "Hotel no encontrado"}), 404

if __name__ == '__main__':
    print("Iniciando API de Agencia de Viajes en el puerto 5000...")
    app.run(debug=True, port=5000)