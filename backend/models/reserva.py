class Reserva:
    def __init__(self, id_reserva, cliente, habitacion, hotel, fechas, cantidad_personas, temporada):
        self.id_reserva = id_reserva
        self.cliente = cliente
        self.habitacion = habitacion
        self.hotel = hotel # Guardamos el hotel para ver su política
        self.fechas = fechas
        self.cantidad_personas = cantidad_personas
        self.temporada = temporada # Guardamos la temporada (Alta/Media/Baja)
        self.estado_pago = "Pendiente"
        
        # R6 y R7: Usamos la función de la habitación que ya recibe temporada
        precio_noche = self.habitacion.calcular_precio(cantidad_personas, temporada)
        self.monto_total = precio_noche * len(fechas)

    def confirmar_pago(self):
        self.estado_pago = "Pagado"
        self.habitacion.ocupar_fechas(self.fechas)

    # --- LÓGICA DE R10: CÁLCULO DINÁMICO DE REEMBOLSO ---
    def calcular_reembolso(self):
        penalidad = 0.0
        
        # 1. Regla por Política del Hotel
        pol = self.hotel.politicas_cancelacion.lower()
        if "estricta" in pol:
            penalidad += 0.40  # 40% de multa base
        elif "flexible" in pol:
            penalidad += 0.0   # Sin multa base
        else:
            penalidad += 0.15  # 15% estándar
            
        # 2. Regla por Temporada
        if self.temporada == "Alta":
            penalidad += 0.20  # +20% de multa si es temporada alta
        elif self.temporada == "Media":
            penalidad += 0.10  # +10% de multa
            
        # 3. Regla por Tipo de Habitación
        if self.habitacion.tipo.lower() == "suite":
            penalidad += 0.10  # +10% de multa por ser Suite (más difíciles de revender)
            
        # Tope máximo del 100% de penalidad
        if penalidad > 1.0: 
            penalidad = 1.0
        
        monto_penalidad = self.monto_total * penalidad
        monto_reembolso = self.monto_total - monto_penalidad
        
        return round(monto_reembolso, 2), round(monto_penalidad, 2)

    def cancelar_reserva(self):
        self.estado_pago = "Cancelada"
        
        # R8: Liberamos los días en el calendario de la habitación
        for fecha in self.fechas:
            if fecha in self.habitacion.calendario_disponibilidad:
                # Retiramos la ocupación
                self.habitacion.calendario_disponibilidad[fecha] = False
                
        # Calculamos y retornamos los montos
        reembolso, penalidad = self.calcular_reembolso()
        return reembolso, penalidad
    # ----------------------------------------------------

    def to_dict(self):
        return {
            "id": self.id_reserva,
            "cliente": self.cliente.nombre_completo,
            "hotel": self.hotel.nombre,
            "habitacion_numero": self.habitacion.numero,
            "habitacion_tipo": self.habitacion.tipo,
            "fechas": self.fechas,
            "temporada": self.temporada,
            "cantidad_personas": self.cantidad_personas,
            "estado_pago": self.estado_pago,
            "monto_total": self.monto_total
        }