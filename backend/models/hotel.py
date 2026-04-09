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
        self.estado = "activo" 
        self.promociones = []
        self.habitaciones = [] 

    def agregar_habitacion(self, habitacion):
        self.habitaciones.append(habitacion)

    def cambiar_estado(self, nuevo_estado):
        self.estado = nuevo_estado

    def agregar_promocion(self, nombre, descuento, temporada):
        self.promociones.append({
            "nombre": nombre,
            "descuento": descuento,
            "temporada": temporada
        })

    def agregar_servicio_adicional(self, servicio):
        # Evita duplicados si el servicio ya existe
        if servicio not in self.servicios_generales:
            self.servicios_generales.append(servicio)

    def calcular_calificacion_promedio(self):
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
            "promociones": self.promociones,
            "calificacion_promedio_general": self.calcular_calificacion_promedio(),
            "habitaciones": [hab.to_dict() for hab in self.habitaciones]
        }