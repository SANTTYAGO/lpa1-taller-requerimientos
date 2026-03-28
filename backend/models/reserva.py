class Reserva:
    def __init__(self, id_reserva, cliente, habitacion, fechas, cantidad_personas):
        self.id_reserva = id_reserva
        self.cliente = cliente
        self.habitacion = habitacion
        self.fechas = fechas # Lista de strings de fechas ej: ["2026-04-10", "2026-04-11"]
        self.cantidad_personas = cantidad_personas
        self.estado_pago = "Pendiente"
        
        # R6: Calcula el total dinámicamente usando el método de la habitación
        precio_noche = self.habitacion.calcular_precio(cantidad_personas)
        self.monto_total = precio_noche * len(fechas)

    def confirmar_pago(self):
        # R16: Formaliza la reserva
        self.estado_pago = "Pagado"
        self.habitacion.ocupar_fechas(self.fechas)

    def cancelar_reserva(self):
        self.estado_pago = "Cancelada"
        # Aquí luego liberaríamos las fechas del calendario de la habitación

    def to_dict(self):
        return {
            "id": self.id_reserva,
            "cliente": self.cliente.nombre_completo,
            "habitacion_numero": self.habitacion.numero,
            "fechas": self.fechas,
            "cantidad_personas": self.cantidad_personas,
            "estado_pago": self.estado_pago,
            "monto_total": self.monto_total
        }

    def to_dict_basic(self):
        # Usado para mostrar en el perfil del cliente sin cargar toda la info pesada
        return {
            "id": self.id_reserva,
            "fechas": self.fechas,
            "estado_pago": self.estado_pago,
            "monto_total": self.monto_total
        }