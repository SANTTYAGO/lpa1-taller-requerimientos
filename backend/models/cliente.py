class Cliente:
    def __init__(self, id_cliente, nombre_completo, telefono, correo, direccion):
        self.id_cliente = id_cliente
        self.nombre_completo = nombre_completo
        self.telefono = telefono
        self.correo = correo
        self.direccion = direccion
        self.historial_reservas = [] # Lista de objetos Reserva

    def agregar_reserva(self, reserva):
        self.historial_reservas.append(reserva)

    def to_dict(self):
        return {
            "id": self.id_cliente,
            "nombre_completo": self.nombre_completo,
            "telefono": self.telefono,
            "correo": self.correo,
            "direccion": self.direccion,
            # Llamamos a un método especial de Reserva para evitar bucles infinitos al serializar JSON
            "historial_reservas": [res.to_dict_basic() for res in self.historial_reservas]
        }