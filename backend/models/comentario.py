from datetime import datetime

class Comentario:
    def __init__(self, autor, calificacion, texto):
        self.autor = autor  # Será un objeto Cliente
        self.calificacion = calificacion # 1 a 5
        self.texto = texto
        self.fecha = datetime.now().strftime("%Y-%m-%d")

    def to_dict(self):
        # Convertimos a diccionario para enviarlo a React
        return {
            # Extraemos el nombre si es un objeto, sino devolvemos el valor
            "autor": self.autor.nombre_completo if hasattr(self.autor, 'nombre_completo') else self.autor,
            "calificacion": self.calificacion,
            "texto": self.texto,
            "fecha": self.fecha
        }