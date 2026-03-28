class Hotel:
    def __init__(self, id_hotel, nombre, ubicacion, politicas_pago):
        self.id_hotel = id_hotel
        self.nombre = nombre
        self.ubicacion = ubicacion
        self.politicas_pago = politicas_pago
        self.habitaciones = [] # Lista de objetos Habitacion

    def agregar_habitacion(self, habitacion):
        self.habitaciones.append(habitacion)

    def to_dict(self):
        """Convierte el hotel y sus habitaciones a diccionario"""
        return {
            "id": self.id_hotel,
            "nombre": self.nombre,
            "ubicacion": self.ubicacion,
            "politicas_pago": self.politicas_pago,
            # Llamamos al to_dict() de cada habitación guardada en la lista
            "habitaciones": [hab.to_dict() for hab in self.habitaciones]
        }