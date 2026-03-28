import { useState, useEffect } from 'react';

function App() {
  const [hoteles, setHoteles] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  
  // Nuevos estados para la búsqueda y reservas
  const [busqueda, setBusqueda] = useState('');
  const [habitacionSeleccionada, setHabitacionSeleccionada] = useState(null);

  const [nombreCliente, setNombreCliente] = useState('');
  const [noches, setNoches] = useState(1);
  const [personas, setPersonas] = useState(1);
  const [procesandoPago, setProcesandoPago] = useState(false);

  useEffect(() => {
    fetch('http://127.0.0.1:5000/api/hoteles')
      .then(respuesta => {
        if (!respuesta.ok) throw new Error(`Error HTTP: ${respuesta.status}`);
        return respuesta.json();
      })
      .then(datos => {
        setHoteles(datos);
        setCargando(false);
      })
      .catch(err => {
        console.error("Error conectando con Python:", err);
        setError("No se pudo conectar con el servidor de Python.");
        setCargando(false);
      });
  }, []);

  const obtenerImagen = (ubicacion) => {
    const nombreArchivo = ubicacion.toLowerCase().replace('ú', 'u').replace('á', 'a').replace(' ', '');
    return `/static/${nombreArchivo}.png`;
  };

  // Filtrar hoteles dinámicamente según lo que el usuario escriba
  const hotelesFiltrados = hoteles.filter(hotel => 
    hotel.ubicacion.toLowerCase().includes(busqueda.toLowerCase()) ||
    hotel.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

 const confirmarReserva = async (e) => {
    e.preventDefault();
    setProcesandoPago(true);

    const datosReserva = {
      hotel_id: habitacionSeleccionada.hotelId,
      habitacion_numero: habitacionSeleccionada.hab.numero,
      nombre_cliente: nombreCliente,
      noches: parseInt(noches),
      personas: parseInt(personas)
    };

    try {
      const respuesta = await fetch('http://127.0.0.1:5000/api/reservas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(datosReserva)
      });

      if (respuesta.ok) {
        const data = await respuesta.json();
        alert(`🎉 ¡ÉXITO! ${data.mensaje}\n\nDetalles:\nCliente: ${data.reserva.cliente}\nTotal pagado: $${data.reserva.monto_total}`);
        
        // Limpiamos el formulario y cerramos el modal
        setHabitacionSeleccionada(null);
        setNombreCliente('');
        setNoches(1);
        setPersonas(1);
      } else {
        alert("Hubo un error al procesar la reserva.");
      }
    } catch (error) {
      console.error("Error al enviar reserva:", error);
      alert("Error de conexión con el servidor.");
    } finally {
      setProcesandoPago(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 relative">
      
      {/* SECCIÓN HERO */}
      <header className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16 px-8 shadow-lg">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl font-extrabold mb-4 tracking-tight">Agencia de Viajes LPA1</h1>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Descubre destinos increíbles y reserva tu habitación ideal al mejor precio.
          </p>
          
          {/* BARRA DE BÚSQUEDA FUNCIONAL */}
          <div className="bg-white p-2 rounded-full shadow-md max-w-3xl mx-auto flex items-center focus-within:ring-4 ring-blue-300 transition-all">
            <span className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full transition-colors">Buscar</span>
            <input 
              type="text" 
              placeholder="¿A dónde quieres ir? (Ej: Cancún, Aruba...)" 
              className="flex-1 px-4 py-3 text-gray-700 focus:outline-none rounded-full bg-transparent"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-sm mb-8">
            <p className="font-bold">Error de conexión</p>
            <p>{error}</p>
          </div>
        )}

        {cargando ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            <h2 className="text-3xl font-bold text-slate-800 mb-8">
              {busqueda ? `Resultados para "${busqueda}"` : "Destinos Destacados"}
            </h2>
            
            {hotelesFiltrados.length === 0 ? (
              <p className="text-gray-500 text-xl text-center py-10">No encontramos hoteles que coincidan con tu búsqueda</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {hotelesFiltrados.map(hotel => (
                  <div key={hotel.id} className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden flex flex-col">
                    
                    <div className="h-56 relative overflow-hidden group">
                      <img 
                        src={obtenerImagen(hotel.ubicacion)} 
                        alt={`Vista de ${hotel.ubicacion}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {e.target.src = 'https://via.placeholder.com/400x300?text=Sin+Imagen'}}
                      />
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-sm font-bold text-blue-700 shadow">
                        📍 {hotel.ubicacion}
                      </div>
                    </div>
                    
                    <div className="p-6 flex-1 flex flex-col">
                      <h3 className="text-2xl font-bold text-slate-800 mb-2">{hotel.nombre}</h3>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        {hotel.servicios_generales.map((servicio, index) => (
                          <span key={index} className="bg-blue-50 text-blue-600 text-xs font-semibold px-2.5 py-1 rounded-md">
                            {servicio}
                          </span>
                        ))}
                      </div>

                      <div className="mt-auto pt-4 border-t border-slate-100">
                        <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Habitaciones:</h4>
                        <div className="space-y-3">
                          {hotel.habitaciones.map(hab => (
                            <div key={hab.numero} className="flex flex-col bg-slate-50 p-3 rounded-lg border border-slate-100">
                              <div className="flex justify-between items-center mb-2">
                                <div>
                                  <p className="font-semibold text-slate-700">{hab.tipo}</p>
                                  <p className="text-xs text-slate-500">🧑‍🤝‍🧑 Máx: {hab.capacidad_maxima} pers.</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-lg font-bold text-indigo-600">${hab.precio_base}</p>
                                  <p className="text-[10px] text-slate-400">/noche</p>
                                </div>
                              </div>
                              {/* BOTÓN DE RESERVA */}
                              <button 
                                onClick={() => setHabitacionSeleccionada({hotelId: hotel.id, hotelNombre: hotel.nombre, hab: hab})}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold py-2 rounded transition-colors"
                              >
                                Reservar Habitación
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* MODAL DE RESERVA */}
      {habitacionSeleccionada && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="bg-indigo-600 text-white p-4">
              <h3 className="text-xl font-bold">Completar Reserva</h3>
              <p className="text-indigo-200 text-sm">{habitacionSeleccionada.hotelNombre} - Habitación {habitacionSeleccionada.hab.tipo}</p>
            </div>
            
            <form onSubmit={confirmarReserva} className="p-6">
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                  <input type="text" required className="w-full border rounded-lg px-3 py-2 outline-none" placeholder="Ej: Juan Pérez" 
                    value={nombreCliente} onChange={(e) => setNombreCliente(e.target.value)} 
                  />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">Cant. Noches</label>
                    <input type="number" min="1" required className="w-full border rounded-lg px-3 py-2 outline-none" 
                      value={noches} onChange={(e) => setNoches(e.target.value)} 
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">Huéspedes</label>
                    <input type="number" min="1" max={habitacionSeleccionada.hab.capacidad_maxima} required className="w-full border rounded-lg px-3 py-2 outline-none" 
                      value={personas} onChange={(e) => setPersonas(e.target.value)} 
                    />
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg border mb-6 flex justify-between items-center">
                <span className="font-semibold">Total a Pagar:</span>
                <span className="text-2xl font-bold text-green-600">${habitacionSeleccionada.hab.precio_base * noches}</span>
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setHabitacionSeleccionada(null)} className="flex-1 bg-white border font-bold py-2.5 rounded-lg">
                  Cancelar
                </button>
                <button type="submit" disabled={procesandoPago} className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-2.5 rounded-lg">
                  {procesandoPago ? 'Procesando...' : 'Confirmar Pago'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;