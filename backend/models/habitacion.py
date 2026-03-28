class Habitacion:
    def __init__(self, id_hab, tipo, precio_base, capacidad_maxima, estado="activa"):
        self.id_hab = id_hab
        self.tipo = tipo
        self.precio_base = precio_base
        self.capacidad_maxima = capacidad_maxima
        self.estado = estado

    def to_dict(self):
        """Convierte el objeto a un diccionario para poder enviarlo como JSON a React"""
        return {
            "id": self.id_hab,
            "tipo": self.tipo,
            "precio_base": self.precio_base,
            "capacidad_maxima": self.capacidad_maxima,
            "estado": self.estado
        }