class SistemaReservas:
    def __init__(self):
        self.hoteles = []
        self.clientes = []
        self.reservas = []

    def registrar_hotel(self, hotel):
        self.hoteles.append(hotel)

    def registrar_cliente(self, cliente):
        self.clientes.append(cliente)

    def crear_reserva(self, reserva):
        self.reservas.append(reserva)
        reserva.cliente.agregar_reserva(reserva)

    def buscar_habitaciones(self, ubicacion=None, fechas=None):
        # R12: Buscador que cruza todos los criterios
        resultados = []
        for hotel in self.hoteles:
            if hotel.estado != "activo": # R4: Ignora hoteles inactivos
                continue
                
            if ubicacion and ubicacion.lower() not in hotel.ubicacion.lower():
                continue # No coincide la ubicación
                
            for hab in hotel.habitaciones:
                if hab.estado != "activa": # R5: Ignora habitaciones en mantenimiento
                    continue
                    
                if fechas and not hab.verificar_disponibilidad(fechas): # R8
                    continue # No está disponible en esas fechas
                    
                # Si pasa todos los filtros, agregamos el match
                resultados.append({
                    "hotel_id": hotel.id_hotel,
                    "hotel_nombre": hotel.nombre,
                    "ubicacion": hotel.ubicacion,
                    "habitacion": hab.to_dict()
                })
        return resultados