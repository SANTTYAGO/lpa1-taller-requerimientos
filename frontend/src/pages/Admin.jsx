import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function Admin() {
  const [hoteles, setHoteles] = useState([]);
  const [nuevoHotel, setNuevoHotel] = useState({ nombre: '', direccion: '', telefono: '', correo: '', ubicacion: '', servicios: '' });
  
  // Estado para saber qué hotel estamos gestionando (R2)
  const [hotelGestion, setHotelGestion] = useState(null);
  const [nuevaPromocion, setNuevaPromocion] = useState({ nombre: '', descuento: '', temporada: '' });
  const [nuevoServicio, setNuevoServicio] = useState('');

  // Estados para R3 (Registrar Habitaciones)
  const [hotelHabitacion, setHotelHabitacion] = useState(null);
  const [nuevaHabitacion, setNuevaHabitacion] = useState({
    numero: '', tipo: 'Sencilla', descripcion: '', precio_base: '', capacidad_maxima: '1', servicios: ''
  });

  const cargarHoteles = () => {
    fetch('http://127.0.0.1:5000/api/hoteles')
      .then(r => r.json())
      .then(datos => setHoteles(datos))
      .catch(err => console.error("Error cargando hoteles", err));
  };

  useEffect(() => { cargarHoteles(); }, []);

  const registrarNuevoHotel = async (e) => {
    e.preventDefault();
    try {
      const respuesta = await fetch('http://127.0.0.1:5000/api/hoteles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoHotel)
      });
      if (respuesta.ok) {
        alert("¡Hotel registrado exitosamente!");
        setNuevoHotel({ nombre: '', direccion: '', telefono: '', correo: '', ubicacion: '', servicios: '' });
        cargarHoteles();
      }
    } catch (error) { alert("Error conectando con el servidor."); }
  };

  // --- FUNCIONES PARA R2 ---
  const agregarPromocion = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://127.0.0.1:5000/api/hoteles/${hotelGestion.id}/promociones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevaPromocion)
      });
      if (res.ok) {
        alert("Promoción añadida");
        setNuevaPromocion({ nombre: '', descuento: '', temporada: '' });
        cargarHoteles();
        setHotelGestion(null); // Cerramos modal
      }
    } catch (err) { alert("Error agregando promoción"); }
  };

  const agregarServicio = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://127.0.0.1:5000/api/hoteles/${hotelGestion.id}/servicios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ servicio: nuevoServicio })
      });
      if (res.ok) {
        alert("Servicio adicional añadido");
        setNuevoServicio('');
        cargarHoteles();
        setHotelGestion(null); // Cerramos modal
      }
    } catch (err) { alert("Error agregando servicio"); }
  };

  const registrarHabitacion = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://127.0.0.1:5000/api/hoteles/${hotelHabitacion.id}/habitaciones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevaHabitacion)
      });
      if (res.ok) {
        alert("¡Habitación añadida al hotel exitosamente!");
        setNuevaHabitacion({ numero: '', tipo: 'Sencilla', descripcion: '', precio_base: '', capacidad_maxima: '1', servicios: '' });
        cargarHoteles(); // Refresca la lista
        setHotelHabitacion(null); // Cierra el modal
      }
    } catch (err) { alert("Error agregando habitación"); }
  };

  // --- FUNCIÓN PARA R4 (CAMBIAR ESTADO) ---
  const toggleEstadoHotel = async (hotel) => {
    // Si está activo lo pasamos a inactivo, y viceversa
    const nuevoEstado = hotel.estado === 'activo' ? 'inactivo' : 'activo';
    try {
      const res = await fetch(`http://127.0.0.1:5000/api/hoteles/${hotel.id}/estado`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado })
      });
      if (res.ok) {
        cargarHoteles(); // Refrescamos la lista para ver el cambio de color
      }
    } catch (err) { alert("Error cambiando el estado del hotel"); }
  };

  // --- FUNCIÓN PARA R5 (CAMBIAR ESTADO HABITACIÓN) ---
  const toggleEstadoHabitacion = async (hotelId, hab) => {
    const nuevoEstado = hab.estado === 'activa' ? 'inactiva' : 'activa';
    try {
      const res = await fetch(`http://127.0.0.1:5000/api/hoteles/${hotelId}/habitaciones/${hab.numero}/estado`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado })
      });
      if (res.ok) {
        cargarHoteles(); // Refresca para ver el cambio
      }
    } catch (err) { alert("Error cambiando el estado de la habitación"); }
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800">
      <nav className="bg-slate-900 text-white p-4 shadow-md flex justify-between items-center">
        <h1 className="text-2xl font-bold">⚙️ Panel de Administración LPA1</h1>
        <Link to="/" className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded transition-colors text-sm font-bold">Ver vista de Clientes</Link>
      </nav>

      <div className="max-w-6xl mx-auto py-8 px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* FORMULARIO DE NUEVO HOTEL */}
        <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-md h-fit">
          <h2 className="text-xl font-bold mb-4 border-b pb-2">Registrar Nuevo Hotel</h2>
          <form onSubmit={registrarNuevoHotel} className="space-y-4">
            <div><label className="block text-sm font-medium mb-1">Nombre</label><input type="text" required className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2" value={nuevoHotel.nombre} onChange={e => setNuevoHotel({...nuevoHotel, nombre: e.target.value})} /></div>
            <div><label className="block text-sm font-medium mb-1">Ubicación</label><input type="text" required className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2" value={nuevoHotel.ubicacion} onChange={e => setNuevoHotel({...nuevoHotel, ubicacion: e.target.value})} /></div>
            <div className="grid grid-cols-2 gap-2">
              <div><label className="block text-sm font-medium mb-1">Teléfono</label><input type="text" required className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2" value={nuevoHotel.telefono} onChange={e => setNuevoHotel({...nuevoHotel, telefono: e.target.value})} /></div>
              <div><label className="block text-sm font-medium mb-1">Correo</label><input type="email" required className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2" value={nuevoHotel.correo} onChange={e => setNuevoHotel({...nuevoHotel, correo: e.target.value})} /></div>
            </div>
            <div><label className="block text-sm font-medium mb-1">Dirección</label><input type="text" required className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2" value={nuevoHotel.direccion} onChange={e => setNuevoHotel({...nuevoHotel, direccion: e.target.value})} /></div>
            <div><label className="block text-sm font-medium mb-1">Servicios Base</label><input type="text" className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2" placeholder="Piscina, Wifi..." value={nuevoHotel.servicios} onChange={e => setNuevoHotel({...nuevoHotel, servicios: e.target.value})} /></div>
            <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-lg mt-4">Guardar Hotel</button>
          </form>
        </div>

        {/* LISTA DE HOTELES */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-bold mb-4">Gestión de Hoteles ({hoteles.length})</h2>
          <div className="space-y-4">
            {hoteles.map(hotel => (
              <div key={hotel.id} className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-bold text-lg text-indigo-700">{hotel.nombre}</h3>
                      {/* ETIQUETA VISUAL DE ESTADO (R4) */}
                      <span className={`px-2 py-0.5 text-[10px] uppercase font-bold rounded-full border ${hotel.estado === 'activo' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                        {hotel.estado}
                      </span>
                    </div>
                    <span className="text-sm font-normal text-slate-500">📍 {hotel.ubicacion}</span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {/* BOTÓN PARA DESACTIVAR/ACTIVAR (R4) */}
                    <button 
                      onClick={() => toggleEstadoHotel(hotel)} 
                      className={`px-3 py-2 rounded text-xs font-bold shadow-sm border transition-colors ${hotel.estado === 'activo' ? 'bg-white border-red-200 text-red-600 hover:bg-red-50' : 'bg-green-600 border-green-600 text-white hover:bg-green-700'}`}
                    >
                      {hotel.estado === 'activo' ? '⏸ Suspender (Reformas)' : '▶ Reactivar Hotel'}
                    </button>

                    <button onClick={() => setHotelHabitacion(hotel)} className="bg-emerald-600 text-white px-4 py-2 rounded text-xs font-bold hover:bg-emerald-700 shadow-md">
                      ➕ Habitación
                    </button>
                    <button onClick={() => setHotelGestion(hotel)} className="bg-indigo-600 text-white px-4 py-2 rounded text-xs font-bold hover:bg-indigo-700 shadow-md">
                      Gestionar
                    </button>
                  </div>
                </div>

                {/* Lista de habitaciones en el Panel Admin */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2">
                  {hotel.habitaciones.map(hab => (
                    <div key={hab.numero} className={`flex justify-between items-center p-3 rounded-lg border ${hab.estado === 'activa' ? 'bg-slate-50 border-slate-200' : 'bg-red-50 border-red-200'}`}>
                      <div>
                        <p className="font-semibold text-sm">{hab.tipo} (N° {hab.numero})</p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-xs text-slate-500">Máx: {hab.capacidad_maxima} pers.</p>
                          {/* ETIQUETA R5 */}
                          <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${hab.estado === 'activa' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {hab.estado}
                          </span>
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end">
                        <p className="text-sm font-bold text-indigo-600">${hab.precio_base}</p>
                        {/* BOTÓN R5 */}
                        <button 
                          onClick={() => toggleEstadoHabitacion(hotel.id, hab)} 
                          className="mt-1 text-[10px] bg-white border shadow-sm px-2 py-1 rounded font-bold hover:bg-slate-50 transition-colors"
                        >
                          {hab.estado === 'activa' ? '🔧 Mantenimiento' : '▶ Reactivar'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Mostrar promociones activas si las hay */}
                {hotel.promociones && hotel.promociones.length > 0 && (
                  <div className="mt-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <p className="text-xs font-bold text-yellow-800 uppercase mb-2">🎁 Ofertas Activas:</p>
                    <div className="flex flex-wrap gap-2">
                      {hotel.promociones.map((promo, idx) => (
                        <span key={idx} className="bg-white border border-yellow-300 text-yellow-800 text-xs px-2 py-1 rounded shadow-sm">
                          {promo.nombre} ({promo.temporada}): <b>-{promo.descuento}%</b>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Mostrar servicios actualizados */}
                <div className="mt-3">
                  <p className="text-xs text-slate-500 mb-1">Servicios disponibles:</p>
                  <div className="flex flex-wrap gap-1">
                    {hotel.servicios_generales.map((srv, i) => <span key={i} className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded">{srv}</span>)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MODAL DE GESTIÓN R2 (PROMOCIONES Y SERVICIOS) */}
      {hotelGestion && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col md:flex-row">
            
            {/* Columna Promociones */}
            <div className="flex-1 p-6 border-r border-slate-100">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-indigo-700">Añadir Promoción</h3>
                {/* Botón de cierre móvil */}
                <button onClick={() => setHotelGestion(null)} className="md:hidden text-gray-500 font-bold text-xl">✖</button>
              </div>
              <form onSubmit={agregarPromocion} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nombre (Ej: Black Friday)</label>
                  <input type="text" required className="w-full border rounded px-3 py-2 text-sm outline-none focus:border-indigo-500" value={nuevaPromocion.nombre} onChange={e => setNuevaPromocion({...nuevaPromocion, nombre: e.target.value})} />
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">% Descuento</label>
                    <input type="number" required min="1" max="99" className="w-full border rounded px-3 py-2 text-sm outline-none focus:border-indigo-500" value={nuevaPromocion.descuento} onChange={e => setNuevaPromocion({...nuevaPromocion, descuento: e.target.value})} />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">Temporada</label>
                    <input type="text" required placeholder="Ej: Alta" className="w-full border rounded px-3 py-2 text-sm outline-none focus:border-indigo-500" value={nuevaPromocion.temporada} onChange={e => setNuevaPromocion({...nuevaPromocion, temporada: e.target.value})} />
                  </div>
                </div>
                <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded">Guardar Oferta</button>
              </form>
            </div>

            {/* Columna Servicios Adicionales */}
            <div className="flex-1 p-6 bg-slate-50 relative">
              {/* Botón de cierre Escritorio */}
              <button onClick={() => setHotelGestion(null)} className="hidden md:block absolute top-4 right-4 text-gray-500 hover:text-red-500 font-bold text-xl">✖</button>
              
              <h3 className="text-lg font-bold text-slate-800 mb-4 mt-6 md:mt-0">Añadir Servicio Adicional</h3>
              <form onSubmit={agregarServicio} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-600">Nuevo Servicio (Ej: Coworking)</label>
                  <input type="text" required className="w-full border rounded px-3 py-2 text-sm outline-none focus:border-slate-500" value={nuevoServicio} onChange={e => setNuevoServicio(e.target.value)} />
                </div>
                <button type="submit" className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-2 rounded">Añadir Servicio</button>
              </form>
              
              <div className="mt-6">
                <p className="text-xs text-slate-500 text-center italic">Ambas acciones se guardan en tiempo real en la base de datos de Python.</p>
              </div>
            </div>
            
          </div>
        </div>
      )}
      {/* --- MODAL PARA R3 (AÑADIR HABITACIÓN) --- */}
      {hotelHabitacion && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="bg-emerald-600 text-white p-4 flex justify-between items-center">
              <h3 className="text-xl font-bold">Registrar Habitación</h3>
              <button onClick={() => setHotelHabitacion(null)} className="text-xl hover:text-emerald-200">✖</button>
            </div>
            
            <form onSubmit={registrarHabitacion} className="p-6 space-y-4">
              <p className="text-sm text-slate-500 mb-4">Añadiendo habitación a: <b>{hotelHabitacion.nombre}</b></p>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">N° de Habitación</label>
                  <input type="number" required className="w-full border rounded px-3 py-2 outline-none focus:border-emerald-500" value={nuevaHabitacion.numero} onChange={e => setNuevaHabitacion({...nuevaHabitacion, numero: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tipo</label>
                  <select className="w-full border rounded px-3 py-2 outline-none focus:border-emerald-500" value={nuevaHabitacion.tipo} onChange={e => setNuevaHabitacion({...nuevaHabitacion, tipo: e.target.value})}>
                    <option value="Sencilla">Sencilla</option>
                    <option value="Doble">Doble</option>
                    <option value="Suite">Suite</option>
                    <option value="Familiar">Familiar</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Precio Base ($)</label>
                  <input type="number" required className="w-full border rounded px-3 py-2 outline-none focus:border-emerald-500" value={nuevaHabitacion.precio_base} onChange={e => setNuevaHabitacion({...nuevaHabitacion, precio_base: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Capacidad Máx (Personas)</label>
                  <input type="number" min="1" required className="w-full border rounded px-3 py-2 outline-none focus:border-emerald-500" value={nuevaHabitacion.capacidad_maxima} onChange={e => setNuevaHabitacion({...nuevaHabitacion, capacidad_maxima: e.target.value})} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Descripción corta</label>
                <input type="text" required placeholder="Ej: Vista al mar con balcón..." className="w-full border rounded px-3 py-2 outline-none focus:border-emerald-500" value={nuevaHabitacion.descripcion} onChange={e => setNuevaHabitacion({...nuevaHabitacion, descripcion: e.target.value})} />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Servicios (Separados por coma)</label>
                <input type="text" placeholder="Ej: TV, Minibar, Jacuzzi..." className="w-full border rounded px-3 py-2 outline-none focus:border-emerald-500" value={nuevaHabitacion.servicios} onChange={e => setNuevaHabitacion({...nuevaHabitacion, servicios: e.target.value})} />
              </div>

              <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-lg mt-4 transition-colors">
                Guardar Habitación
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Admin;