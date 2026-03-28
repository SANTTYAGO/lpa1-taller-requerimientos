from flask import Flask, jsonify
from flask_cors import CORS
from models import Hotel, Habitacion

app = Flask(__name__)
# CORS es fundamental para que tu frontend en React no sea bloqueado por seguridad
CORS(app) 

# --- Base de datos simulada (Instanciando nuestros objetos) ---
# Hotel 1: Aruba
hotel_aruba = Hotel(1, "Aruba Beach Resort", "Aruba", "Pago por adelantado")
hotel_aruba.agregar_habitacion(Habitacion(101, "Sencilla", 418, 2))
hotel_aruba.agregar_habitacion(Habitacion(102, "Suite VIP", 600, 4))

# Hotel 2: Cancún
hotel_cancun = Hotel(2, "Cancún Paradise", "Cancún", "Pago al llegar")
hotel_cancun.agregar_habitacion(Habitacion(201, "Doble", 350, 4))

# Lista global
hoteles_db = [hotel_aruba, hotel_cancun]
# --------------------------------------------------------------

@app.route('/api/hoteles', methods=['GET'])
def obtener_hoteles():
    """Ruta que devuelve la lista de hoteles disponibles"""
    # Convertimos los objetos Python a un formato que la web entiende (JSON)
    datos_hoteles = [hotel.to_dict() for hotel in hoteles_db]
    return jsonify(datos_hoteles)

if __name__ == '__main__':
    print("Iniciando el servidor de la Agencia de Viajes en el puerto 5000...")
    app.run(debug=True, port=5000)