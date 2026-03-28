from flask import Flask, jsonify
from flask_cors import CORS

# Importamos las clases desde nuestra nueva carpeta 'models'
from models.hotel import Hotel
from models.habitacion import Habitacion

app = Flask(__name__)
CORS(app) 

# --- Base de datos simulada ---
hotel_aruba = Hotel(1, "Aruba Beach Resort", "Aruba", "Pago por adelantado")
hotel_aruba.agregar_habitacion(Habitacion(101, "Sencilla", 418, 2))
hotel_aruba.agregar_habitacion(Habitacion(102, "Suite VIP", 600, 4))

hotel_cancun = Hotel(2, "Cancún Paradise", "Cancún", "Pago al llegar")
hotel_cancun.agregar_habitacion(Habitacion(201, "Doble", 350, 4))

hoteles_db = [hotel_aruba, hotel_cancun]
# ------------------------------

@app.route('/api/hoteles', methods=['GET'])
def obtener_hoteles():
    datos_hoteles = [hotel.to_dict() for hotel in hoteles_db]
    return jsonify(datos_hoteles)

if __name__ == '__main__':
    print("Iniciando API en el puerto 5000...")
    app.run(debug=True, port=5000)