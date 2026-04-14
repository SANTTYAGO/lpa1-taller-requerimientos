import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function Home() {
  const [hoteles, setHoteles] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  
  const [busqueda, setBusqueda] = useState('');
  const [habitacionSeleccionada, setHabitacionSeleccionada] = useState(null);
  
  const [nombreCliente, setNombreCliente] = useState('');
  const [noches, setNoches] = useState(1);
  const [personas, setPersonas] = useState(1);
  const [procesandoPago, setProcesandoPago] = useState(false);

  const [fechaLlegada, setFechaLlegada] = useState('');
  const [temporadaDetectada, setTemporadaDetectada] = useState('');
  const [totalCalculado, setTotalCalculado] = useState(0);
  const [errorCotizacion, setErrorCotizacion] = useState(null);

  useEffect(() => {
    fetch('http://127.0.0.1:5000/api/hoteles')
      .then(r => r.json())
      .then(datos => { setHoteles(datos); setCargando(false); })
      .catch(err => { setError("Error de conexión"); setCargando(false); });
  }, []);

  // Efecto para R6 y R7: Precio dinámico basado en cantidad de personas, noches, temporada y calendario
  useEffect(() => {
    if (habitacionSeleccionada && fechaLlegada) {
      const p = parseInt(personas) || 1;
      const n = parseInt(noches) || 1;
      // Extraemos el mes (1-12) de la fecha seleccionada
      const mes = new Date(fechaLlegada).getMonth() + 1; 

      fetch('http://127.0.0.1:5000/api/cotizar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hotel_id: habitacionSeleccionada.hotelId,
          habitacion_numero: habitacionSeleccionada.hab.numero,
          personas: p,
          noches: n,
          mes_llegada: mes
        })
      })
      .then(r => r.json())
      .then(data => {
        if(data.total) {
          setTotalCalculado(data.total);
          setTemporadaDetectada(data.temporada_aplicada); // Python nos dice qué temporada es
          setErrorCotizacion(null);
        } else if (data.error) { setErrorCotizacion(data.error); }
      })
      .catch(err => console.error("Error cotizando", err));
    }
  }, [noches, personas, fechaLlegada, habitacionSeleccionada]);

  const obtenerImagen = (ubicacion) => {
    const nombreArchivo = ubicacion?.toLowerCase().replace('ú', 'u').replace('á', 'a').replace(' ', '');
    return `/static/${nombreArchivo}.png`;
  };

  const hotelesFiltrados = hoteles.filter(hotel => 
    hotel.estado === 'activo' && // R4: Oculta hoteles inactivos de la vista de clientes
    (hotel.ubicacion.toLowerCase().includes(busqueda.toLowerCase()) ||
    hotel.nombre.toLowerCase().includes(busqueda.toLowerCase()))
  );

  const confirmarReserva = async (e) => {
    e.preventDefault();
    setProcesandoPago(true);

    const datosReserva = {
      hotel_id: habitacionSeleccionada.hotelId,
      habitacion_numero: habitacionSeleccionada.hab.numero,
      nombre_cliente: nombreCliente,
      noches: parseInt(noches),
      personas: parseInt(personas),
      fecha_llegada: fechaLlegada
    };

    try {
      const respuesta = await fetch('http://127.0.0.1:5000/api/reservas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosReserva)
      });

      if (respuesta.ok) {
        const data = await respuesta.json();
        alert(`🎉 ¡ÉXITO! ${data.mensaje}`);
        setHabitacionSeleccionada(null);
        setNombreCliente(''); setNoches(1); setPersonas(1);
      } else { alert("Hubo un error al procesar la reserva."); }
    } catch (error) { alert("Error de conexión con el servidor."); } 
    finally { setProcesandoPago(false); }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 relative">
      <header className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16 px-8 shadow-lg relative">
        <div className="max-w-6xl mx-auto text-center mt-4">
          <h1 className="text-5xl font-extrabold mb-4 tracking-tight">Agencia de Viajes LPA1</h1>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">Descubre destinos increíbles y reserva tu habitación ideal.</p>
          <div className="bg-white p-2 rounded-full shadow-md max-w-3xl mx-auto flex items-center focus-within:ring-4 ring-blue-300 transition-all">
            <span className="pl-4 text-2xl">🔍</span>
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

      <main className="max-w-7xl mx-auto py-12 px-4">
        {error && <div className="bg-red-100 text-red-700 p-4 rounded mb-8">{error}</div>}
        {cargando ? (
          <div className="flex justify-center h-64 items-center">Cargando hoteles...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {hotelesFiltrados.map(hotel => (
              <div key={hotel.id} className="bg-white rounded-2xl shadow-md flex flex-col overflow-hidden">
                <div className="h-56 relative">
                  <img src={obtenerImagen(hotel.ubicacion)} alt={hotel.ubicacion} className="w-full h-full object-cover"/>
                  <div className="absolute top-4 right-4 bg-white/90 px-3 py-1 rounded-full text-sm font-bold text-blue-700 shadow">📍 {hotel.ubicacion}</div>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-2xl font-bold mb-2">{hotel.nombre}</h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {hotel.servicios_generales.map((srv, i) => <span key={i} className="bg-blue-50 text-blue-600 text-xs px-2 py-1 rounded">{srv}</span>)}
                  </div>
                  <div className="mt-auto pt-4 border-t border-slate-100 space-y-3">
                    {hotel.habitaciones.filter(hab => hab.estado === 'activa').length === 0 ? (
                      <p className="text-sm text-gray-500 italic">No hay habitaciones disponibles por el momento.</p>
                    ) : (
                      hotel.habitaciones.filter(hab => hab.estado === 'activa').map(hab => (
                        <div key={hab.numero} className="flex flex-col bg-slate-50 p-3 rounded-lg border">
                          <div className="flex justify-between items-center mb-2">
                            <div>
                              <p className="font-semibold">{hab.tipo}</p>
                              <p className="text-xs text-slate-500">Máx: {hab.capacidad_maxima} pers.</p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-indigo-600">${hab.precio_base}</p>
                            </div>
                          </div>
                          <button 
                            onClick={() => setHabitacionSeleccionada({hotelId: hotel.id, hotelNombre: hotel.nombre, hab: hab, politicas_pago: hotel.politicas_pago})} 
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold py-2 rounded transition-colors"
                          >
                            Reservar Habitación
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
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
                  <input type="text" required className="w-full border rounded-lg px-3 py-2 outline-none" value={nombreCliente} onChange={(e) => setNombreCliente(e.target.value)} />
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-3 md:col-span-1">
                    <label className="block text-sm font-medium mb-1">Llegada</label>
                    <input type="date" required className="w-full border rounded-lg px-3 py-2 outline-none" value={fechaLlegada} onChange={(e) => setFechaLlegada(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Noches</label>
                    <input type="number" min="1" required className="w-full border rounded-lg px-3 py-2 outline-none" value={noches} onChange={(e) => setNoches(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Huéspedes</label>
                    <input type="number" min="1" max={habitacionSeleccionada.hab.capacidad_maxima} required className="w-full border rounded-lg px-3 py-2 outline-none" value={personas} onChange={(e) => setPersonas(e.target.value)} />
                  </div>
                </div>
              </div>

              {/* ALERTA DE ERROR VISUAL */}
              {errorCotizacion && (
                <div className="bg-red-100 text-red-600 p-2 rounded mb-4 text-sm text-center font-bold">
                  ⚠️ {errorCotizacion}
                </div>
              )}

              {/* RESUMEN DE PAGO ADAPTATIVO (R9) */}
              <div className="bg-slate-50 p-4 rounded-lg border mb-6">
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <span className="font-semibold text-slate-700 block">Total de la Reserva:</span>
                    {temporadaDetectada && <span className="text-xs bg-blue-100 text-blue-800 px-2 rounded-full">Temporada {temporadaDetectada}</span>}
                  </div>
                  <span className="text-2xl font-bold text-green-600">
                    ${totalCalculado > 0 ? totalCalculado.toFixed(2) : (habitacionSeleccionada.hab.precio_base * noches).toFixed(2)}
                  </span>
                </div>
                
                {/* MENSAJE DE POLÍTICA */}
                <div className={`p-3 rounded text-sm ${habitacionSeleccionada.politicas_pago === 'Pago al llegar' ? 'bg-orange-100 text-orange-800 border border-orange-200' : 'bg-green-100 text-green-800 border border-green-200'}`}>
                  <b>Condición:</b> {habitacionSeleccionada.politicas_pago}.
                  {habitacionSeleccionada.politicas_pago === 'Pago al llegar' 
                    ? " Tu tarjeta solo se usa como garantía. Pagarás en recepción." 
                    : " Se realizará el cargo completo de forma inmediata."}
                </div>
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setHabitacionSeleccionada(null)} className="flex-1 bg-white border font-bold py-2.5 rounded-lg">Cancelar</button>
                <button type="submit" disabled={procesandoPago || errorCotizacion} className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-2.5 rounded-lg">
                  {procesandoPago ? 'Procesando...' : (habitacionSeleccionada.politicas_pago === 'Pago al llegar' ? 'Reservar sin cobrar' : 'Pagar Ahora')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FOOTER DISCRETO CON ACCESO AL ADMIN */}
      <footer className="bg-slate-900 text-slate-400 py-6 text-center mt-12">
        <p>© 2026 Agencia de Viajes LPA1</p>
        <Link to="/admin" className="text-xs hover:text-white mt-2 inline-block transition-colors">Acceso Empleados</Link>
      </footer>
    </div>
  );
}

export default Home;