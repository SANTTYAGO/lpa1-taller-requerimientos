class Habitacion:
    def __init__(self, numero, tipo, descripcion, precio_base, servicios_incluidos, capacidad_maxima, fotos=None):
        self.numero = numero
        self.tipo = tipo
        self.descripcion = descripcion
        self.precio_base = precio_base
        self.servicios_incluidos = servicios_incluidos or []
        self.capacidad_maxima = capacidad_maxima
        self.fotos = fotos or []
        self.estado = "activa" # R5: activa o inactiva
        self.calendario_disponibilidad = {} # R8: Diccionario { "YYYY-MM-DD": True/False }
        self.comentarios = []

    def calcular_precio(self, cantidad_personas, fecha_str=None):
        # R6: Calcula dinámicamente. (Aquí luego se puede añadir el factor temporada)
        if cantidad_personas > self.capacidad_maxima:
            raise ValueError("Excede la capacidad máxima")
        return self.precio_base

    def verificar_disponibilidad(self, fechas_solicitadas):
        # R8: Retorna False si alguna fecha ya está ocupada
        for fecha in fechas_solicitadas:
            if self.calendario_disponibilidad.get(fecha) == True:
                return False
        return True
        
    def ocupar_fechas(self, fechas):
        for fecha in fechas:
            self.calendario_disponibilidad[fecha] = True

    def cambiar_estado(self, nuevo_estado):
        self.estado = nuevo_estado

    def agregar_comentario(self, comentario):
        self.comentarios.append(comentario)

    def calcular_calificacion_promedio(self):
        # R15: Promedio individual
        if not self.comentarios:
            return 0.0
        total = sum(c.calificacion for c in self.comentarios)
        return round(total / len(self.comentarios), 1)

    def to_dict(self):
        return {
            "numero": self.numero,
            "tipo": self.tipo,
            "descripcion": self.descripcion,
            "precio_base": self.precio_base,
            "servicios_incluidos": self.servicios_incluidos,
            "capacidad_maxima": self.capacidad_maxima,
            "fotos": self.fotos,
            "estado": self.estado,
            "calificacion_promedio": self.calcular_calificacion_promedio(),
            "comentarios": [c.to_dict() for c in self.comentarios]
        }