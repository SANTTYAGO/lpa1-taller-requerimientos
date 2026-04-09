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

    def buscar_habitaciones(self, ubicacion=None, fechas=None):
        resultados = []
        for hotel in self.hoteles:
            if hotel.estado != "activo": continue
            if ubicacion and ubicacion.lower() not in hotel.ubicacion.lower(): continue
            for hab in hotel.habitaciones:
                if hab.estado != "activa": continue
                if fechas and not hab.verificar_disponibilidad(fechas): continue
                
                resultados.append({
                    "hotel_id": hotel.id_hotel,
                    "hotel_nombre": hotel.nombre,
                    "ubicacion": hotel.ubicacion,
                    "habitacion": hab.to_dict()
                })
        return resultados