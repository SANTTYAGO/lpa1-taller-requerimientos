class Habitacion:
    def __init__(self, numero, tipo, descripcion, precio_base, servicios_incluidos, capacidad_maxima, fotos=None):
        self.numero = numero
        self.tipo = tipo
        self.descripcion = descripcion
        self.precio_base = precio_base
        self.servicios_incluidos = servicios_incluidos or []
        self.capacidad_maxima = capacidad_maxima
        self.fotos = fotos or []
        self.estado = "activa" 
        self.calendario_disponibilidad = {} 
        self.comentarios = []

    def calcular_precio(self, cantidad_personas, temporada="baja"):
        if cantidad_personas > self.capacidad_maxima:
            raise ValueError("La cantidad de personas excede la capacidad máxima.")

        # 1. Cálculo por personas (20% extra por cada persona adicional)
        precio_personas = self.precio_base
        if cantidad_personas > 1:
            precio_personas += self.precio_base * 0.20 * (cantidad_personas - 1)

        # 2. Cálculo por temporada
        multiplicador = 1.0
        if temporada.lower() == "alta":
            multiplicador = 1.30  # +30%
        elif temporada.lower() == "media":
            multiplicador = 1.15  # +15%

        # Retornamos el precio final redondeado
        return round(precio_personas * multiplicador, 2)

    def verificar_disponibilidad(self, fechas_solicitadas):
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
            "estado": self.estado,
            "fotos": self.fotos, # R13: Agregado
            # R13: Mapeamos los comentarios para que sean JSON
            "comentarios": [c.to_dict() if hasattr(c, 'to_dict') else c for c in self.comentarios],
            "calendario_disponibilidad": self.calendario_disponibilidad,
            "calificacion_promedio": self.calcular_calificacion_promedio()
        }