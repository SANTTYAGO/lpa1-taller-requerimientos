class Hotel:
    def __init__(self, id_hotel, nombre, direccion, telefono, correo, ubicacion, servicios_generales, politicas_pago, politicas_cancelacion, fotos=None):
        self.id_hotel = id_hotel
        self.nombre = nombre
        self.direccion = direccion
        self.telefono = telefono
        self.correo = correo
        self.ubicacion = ubicacion
        self.servicios_generales = servicios_generales or []
        self.politicas_pago = politicas_pago
        self.politicas_cancelacion = politicas_cancelacion
        self.fotos = fotos or []
        self.estado = "activo" # R4: activo o inactivo
        self.promociones = []
        self.habitaciones = [] # Lista de objetos Habitacion

    def agregar_habitacion(self, habitacion):
        self.habitaciones.append(habitacion)

    def cambiar_estado(self, nuevo_estado):
        self.estado = nuevo_estado

    def calcular_calificacion_promedio(self):
        # R15: Promedio de todas las habitaciones del hotel
        habitaciones_con_calificacion = [h for h in self.habitaciones if h.calcular_calificacion_promedio() > 0]
        if not habitaciones_con_calificacion:
            return 0.0
        total = sum(h.calcular_calificacion_promedio() for h in habitaciones_con_calificacion)
        return round(total / len(habitaciones_con_calificacion), 1)

    def to_dict(self):
        return {
            "id": self.id_hotel,
            "nombre": self.nombre,
            "direccion": self.direccion,
            "telefono": self.telefono,
            "correo": self.correo,
            "ubicacion": self.ubicacion,
            "servicios_generales": self.servicios_generales,
            "politicas_pago": self.politicas_pago,
            "politicas_cancelacion": self.politicas_cancelacion,
            "fotos": self.fotos,
            "estado": self.estado,
            "calificacion_promedio_general": self.calcular_calificacion_promedio(),
            "habitaciones": [hab.to_dict() for hab in self.habitaciones]
        }