class Calendario:
    def __init__(self, tipo="Regional"):
        self.tipo = tipo
        # Por defecto, si es regional todo es Baja. 
        # Si es de hotel, por defecto "Hereda" lo del regional.
        valor_defecto = "Baja" if tipo == "Regional" else "Heredada"
        self.meses = {str(i): valor_defecto for i in range(1, 13)}

    def configurar_mes(self, mes, temporada):
        """temporada puede ser: Baja, Media, Alta o Heredada"""
        self.meses[str(mes)] = temporada

    def obtener_temporada(self, mes):
        return self.meses.get(str(mes))

    def to_dict(self):
        return self.meses