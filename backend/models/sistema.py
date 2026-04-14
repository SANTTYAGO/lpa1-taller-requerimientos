from models.calendario import Calendario

class SistemaReservas:
    def __init__(self):
        self.hoteles = []
        self.clientes = []
        self.reservas = []
        
        # R7: Calendario Regional General
        self.calendario_regional = Calendario("Regional")
        # Configuramos Diciembre(12) y Enero(1) como Alta por defecto
        self.calendario_regional.configurar_mes(12, "Alta")
        self.calendario_regional.configurar_mes(1, "Alta")

    def registrar_hotel(self, hotel):
        self.hoteles.append(hotel)

    def registrar_cliente(self, cliente):
        self.clientes.append(cliente)

    def crear_reserva(self, reserva):
        self.reservas.append(reserva)
        reserva.cliente.agregar_reserva(reserva)

    def buscar_habitaciones(self, ubicacion=None, precio_max=None, calificacion_min=None, fechas=None):
        # R12: Buscador avanzado con múltiples criterios combinados
        resultados = []
        for hotel in self.hoteles:
            # Filtro 1: Solo hoteles activos
            if hotel.estado != "activo": continue
            
            # Filtro 2: Ubicación
            if ubicacion and ubicacion.lower() not in hotel.ubicacion.lower(): continue
            
            # Filtro 3: Calificación del Hotel (R15)
            if calificacion_min and hotel.calcular_calificacion_promedio() < calificacion_min: continue
                
            for hab in hotel.habitaciones:
                # Filtro 4: Habitación activa
                if hab.estado != "activa": continue
                
                # Filtro 5: Precio máximo
                if precio_max and hab.precio_base > precio_max: continue
                
                # Filtro 6: Disponibilidad de fechas (R8)
                if fechas and not hab.verificar_disponibilidad(fechas): continue
                
                # Si pasa TODOS los filtros, se agrega al resultado
                resultados.append({
                    "hotel_id": hotel.id_hotel,
                    "hotel_nombre": hotel.nombre,
                    "ubicacion": hotel.ubicacion,
                    "calificacion": hotel.calcular_calificacion_promedio(),
                    "habitacion": hab.to_dict()
                })
        return resultados