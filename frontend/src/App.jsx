import { useState, useEffect } from 'react';

function App() {
  const [hoteles, setHoteles] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null); // Nuevo estado para capturar errores

  useEffect(() => {
    // A veces cambiar 'localhost' por '127.0.0.1' soluciona problemas en Windows/Mac
    fetch('http://127.0.0.1:5000/api/hoteles')
      .then(respuesta => {
        if (!respuesta.ok) {
          throw new Error(`Error HTTP: ${respuesta.status}`);
        }
        return respuesta.json();
      })
      .then(datos => {
        setHoteles(datos);
        setCargando(false);
      })
      .catch(err => {
        console.error("Error conectando con Python:", err);
        setError("No se pudo conectar con el servidor de Python. Verifica que app.py esté corriendo.");
        setCargando(false); // Apagamos el "Cargando..." para mostrar el error
      });
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-bold text-blue-900 mb-2">Agencia de Viajes</h1>
        <p className="text-gray-600">Encuentra y reserva tu hotel ideal</p>
      </header>

      {/* Si hay error, lo mostramos en una caja roja */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative max-w-2xl mx-auto mb-6">
          <strong className="font-bold">¡Ups! Hubo un problema: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {cargando ? (
        <p className="text-center text-xl text-gray-500">Cargando hoteles...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {hoteles.map(hotel => (
            <div key={hotel.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition">
              <div className="h-48 bg-blue-200 flex items-center justify-center">
                <span className="text-blue-500 font-semibold">{hotel.nombre}</span>
              </div>
              
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-1">{hotel.nombre}</h2>
                <p className="text-gray-500 mb-4 flex items-center">
                  📍 {hotel.ubicacion}
                </p>
                
                <div className="border-t border-gray-100 pt-4">
                  <h3 className="font-semibold text-gray-700 mb-2">Habitaciones:</h3>
                  <ul className="space-y-2">
                    {hotel.habitaciones.map(hab => (
                      <li key={hab.id} className="flex justify-between items-center text-sm bg-gray-50 p-2 rounded">
                        <span>{hab.tipo} (Máx {hab.capacidad_maxima} pers.)</span>
                        <span className="font-bold text-green-600">${hab.precio_base}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;