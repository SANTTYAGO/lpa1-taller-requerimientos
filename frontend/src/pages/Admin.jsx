import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function Admin() {
  const [hoteles, setHoteles] = useState([]);
  const [nuevoHotel, setNuevoHotel] = useState({ 
    nombre: '', direccion: '', telefono: '', correo: '', ubicacion: '', servicios: '', 
    politicas_pago: 'Pago por adelantado'
  });
  
  const [hotelGestion, setHotelGestion] = useState(null);
  const [nuevaPromocion, setNuevaPromocion] = useState({ nombre: '', descuento: '', temporada: '' });
  const [nuevoServicio, setNuevoServicio] = useState('');

  // Estados para R3 (Registrar Habitaciones)
  const [hotelHabitacion, setHotelHabitacion] = useState(null);
  const [nuevaHabitacion, setNuevaHabitacion] = useState({
    numero: '', tipo: 'Sencilla', descripcion: '', precio_base: '', capacidad_maxima: '1', servicios: ''
  });

  // Estado para R7 (Calendario Regional)
  const [calendarioRegional, setCalendarioRegional] = useState({});
  const nombresMeses = {1:'Ene', 2:'Feb', 3:'Mar', 4:'Abr', 5:'May', 6:'Jun', 7:'Jul', 8:'Ago', 9:'Sep', 10:'Oct', 11:'Nov', 12:'Dic'};

  const [verCalendarioHab, setVerCalendarioHab] = useState(null);

  const cargarHoteles = () => {
    fetch('http://127.0.0.1:5000/api/hoteles')
      .then(r => r.json())
      .then(datos => setHoteles(datos))
      .catch(err => console.error("Error cargando hoteles", err));
  };

  const cargarCalendarioRegional = () => {
    fetch('http://127.0.0.1:5000/api/calendario/regional')
      .then(r => r.json())
      .then(datos => setCalendarioRegional(datos))
      .catch(err => console.error("Error calendario regional", err));
  };

  useEffect(() => { 
    cargarHoteles(); 
    cargarCalendarioRegional(); 
  }, []);

  // --- FUNCIONES R7 (CAMBIAR MESES) ---
  const cambiarMesRegional = async (mes, temporada) => {
    await fetch('http://127.0.0.1:5000/api/calendario/regional', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mes, temporada })
    });
    cargarCalendarioRegional();
  };

  const cambiarMesHotel = async (hotelId, mes, temporada) => {
    await fetch(`http://127.0.0.1:5000/api/hoteles/${hotelId}/calendario`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mes, temporada })
    });
    
    // Actualizamos el estado local para que la UI se refresque instantáneamente
    setHotelGestion(prev => ({
      ...prev, calendario: { ...prev.calendario, [mes]: temporada }
    }));
    cargarHoteles();
  };
  // ------------------------------------

  const registrarNuevoHotel = async (e) => {
    e.preventDefault();
    try {
      const respuesta = await fetch('http://127.0.0.1:5000/api/hoteles', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoHotel)
      });
      if (respuesta.ok) {
        alert("¡Hotel registrado exitosamente!");
        setNuevoHotel({ nombre: '', direccion: '', telefono: '', correo: '', ubicacion: '', servicios: '' });
        cargarHoteles();
      }
    } catch (error) { alert("Error conectando con el servidor."); }
  };

  const agregarPromocion = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://127.0.0.1:5000/api/hoteles/${hotelGestion.id}/promociones`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevaPromocion)
      });
      if (res.ok) {
        alert("Promoción añadida");
        setNuevaPromocion({ nombre: '', descuento: '', temporada: '' });
        cargarHoteles(); setHotelGestion(null);
      }
    } catch (err) { alert("Error agregando promoción"); }
  };

  const agregarServicio = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://127.0.0.1:5000/api/hoteles/${hotelGestion.id}/servicios`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ servicio: nuevoServicio })
      });
      if (res.ok) {
        alert("Servicio adicional añadido");
        setNuevoServicio(''); cargarHoteles(); setHotelGestion(null);
      }
    } catch (err) { alert("Error agregando servicio"); }
  };

  const registrarHabitacion = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://127.0.0.1:5000/api/hoteles/${hotelHabitacion.id}/habitaciones`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevaHabitacion)
      });
      if (res.ok) {
        alert("¡Habitación añadida al hotel exitosamente!");
        setNuevaHabitacion({ numero: '', tipo: 'Sencilla', descripcion: '', precio_base: '', capacidad_maxima: '1', servicios: '' });
        cargarHoteles(); setHotelHabitacion(null); 
      }
    } catch (err) { alert("Error agregando habitación"); }
  };

  const toggleEstadoHotel = async (hotel) => {
    const nuevoEstado = hotel.estado === 'activo' ? 'inactivo' : 'activo';
    try {
      const res = await fetch(`http://127.0.0.1:5000/api/hoteles/${hotel.id}/estado`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado })
      });
      if (res.ok) cargarHoteles(); 
    } catch (err) { alert("Error cambiando el estado del hotel"); }
  };

  const toggleEstadoHabitacion = async (hotelId, hab) => {
    const nuevoEstado = hab.estado === 'activa' ? 'inactiva' : 'activa';
    try {
      const res = await fetch(`http://127.0.0.1:5000/api/hoteles/${hotelId}/habitaciones/${hab.numero}/estado`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado })
      });
      if (res.ok) cargarHoteles();
    } catch (err) { alert("Error cambiando el estado de la habitación"); }
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800 pb-12">
      <nav className="bg-slate-900 text-white p-4 shadow-md flex justify-between items-center">
        <h1 className="text-2xl font-bold">⚙️ Panel de Administración LPA1</h1>
        <Link to="/" className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded transition-colors text-sm font-bold">Ver vista de Clientes</Link>
      </nav>

      <div className="max-w-7xl mx-auto py-8 px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLUMNA IZQUIERDA */}
        <div className="lg:col-span-1 space-y-8">
          
          {/* FORMULARIO DE NUEVO HOTEL */}
          <div className="bg-white p-6 rounded-xl shadow-md">
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
              <div>
                <label className="block text-sm font-medium mb-1">Condición de Pago (R9)</label>
                <select className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 bg-white" value={nuevoHotel.politicas_pago} onChange={e => setNuevoHotel({...nuevoHotel, politicas_pago: e.target.value})}>
                  <option value="Pago por adelantado">Pago completo por adelantado</option>
                  <option value="Pago al llegar">Pago al llegar al hotel</option>
                </select>
              </div>
              <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-lg mt-4">Guardar Hotel</button>
            </form>
          </div>

        </div>

        {/* COLUMNA DERECHA (Calendario Global y Lista de Hoteles) */}
        <div className="lg:col-span-2">
          
          {/* PANEL R7: CALENDARIO REGIONAL GENERAL */}
          <div className="bg-white p-5 rounded-xl shadow-md border-t-4 border-blue-500 mb-8">
            <h2 className="text-xl font-bold mb-1">🌎 Calendario Regional (Global)</h2>
            <p className="text-sm text-slate-500 mb-4">Aplica para todos los hoteles por defecto, a menos que el hotel configure el suyo.</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {Object.keys(nombresMeses).map(mes => (
                <div key={mes} className="bg-slate-50 border rounded p-2 text-center flex flex-col">
                  <span className="text-xs font-bold text-slate-700 uppercase">{nombresMeses[mes]}</span>
                  <select 
                    className={`mt-1 text-xs p-1 rounded font-semibold outline-none ${calendarioRegional[mes] === 'Alta' ? 'bg-red-100 text-red-700' : calendarioRegional[mes] === 'Media' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}
                    value={calendarioRegional[mes] || 'Baja'}
                    onChange={(e) => cambiarMesRegional(mes, e.target.value)}
                  >
                    <option value="Baja">Baja</option>
                    <option value="Media">Media (+15%)</option>
                    <option value="Alta">Alta (+30%)</option>
                  </select>
                </div>
              ))}
            </div>
          </div>

          <h2 className="text-xl font-bold mb-4">Gestión de Hoteles ({hoteles.length})</h2>
          <div className="space-y-4">
            {hoteles.map(hotel => (
              <div key={hotel.id} className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-bold text-lg text-indigo-700">{hotel.nombre}</h3>
                      <span className="text-xs text-slate-500 block mt-1">💳 {hotel.politicas_pago}</span>
                      <span className={`px-2 py-0.5 text-[10px] uppercase font-bold rounded-full border ${hotel.estado === 'activo' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                        {hotel.estado}
                      </span>
                    </div>
                    <span className="text-sm font-normal text-slate-500">📍 {hotel.ubicacion}</span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => toggleEstadoHotel(hotel)} className={`px-3 py-2 rounded text-xs font-bold shadow-sm border transition-colors ${hotel.estado === 'activo' ? 'bg-white border-red-200 text-red-600 hover:bg-red-50' : 'bg-green-600 border-green-600 text-white hover:bg-green-700'}`}>
                      {hotel.estado === 'activo' ? '⏸ Suspender (Reformas)' : '▶ Reactivar Hotel'}
                    </button>
                    <button onClick={() => setHotelHabitacion(hotel)} className="bg-emerald-600 text-white px-4 py-2 rounded text-xs font-bold hover:bg-emerald-700 shadow-md">
                      ➕ Habitación
                    </button>
                    {/* BOTÓN GESTIONAR R2 y R7 */}
                    <button onClick={() => setHotelGestion(hotel)} className="bg-indigo-600 text-white px-4 py-2 rounded text-xs font-bold hover:bg-indigo-700 shadow-md">
                      Gestionar (Ofertas / Calendario)
                    </button>
                  </div>
                </div>

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
                
                <div className="mt-3 mb-4">
                  <p className="text-xs text-slate-500 mb-1">Servicios disponibles:</p>
                  <div className="flex flex-wrap gap-1">
                    {hotel.servicios_generales.map((srv, i) => <span key={i} className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded">{srv}</span>)}
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2 border-t pt-4">
                  {hotel.habitaciones.map(hab => (
                    <div key={hab.numero} className={`flex justify-between items-center p-3 rounded-lg border ${hab.estado === 'activa' ? 'bg-slate-50 border-slate-200' : 'bg-red-50 border-red-200'}`}>
                      <div>
                        <p className="font-semibold text-sm">{hab.tipo} (N° {hab.numero})</p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-xs text-slate-500">Máx: {hab.capacidad_maxima} pers.</p>
                          <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${hab.estado === 'activa' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {hab.estado}
                          </span>
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end">
                        <p className="text-sm font-bold text-indigo-600">${hab.precio_base}</p>
                        <button onClick={() => setVerCalendarioHab({hotelId: hotel.id, hab})} className="text-[10px] bg-blue-50 border border-blue-200 text-blue-700 px-2 py-1 rounded font-bold hover:bg-blue-100 transition-colors">
                          📅 Calendario
                        </button>
                        <button onClick={() => toggleEstadoHabitacion(hotel.id, hab)} className="mt-1 text-[10px] bg-white border shadow-sm px-2 py-1 rounded font-bold hover:bg-slate-50 transition-colors">
                          {hab.estado === 'activa' ? '🔧 Mantenimiento' : '▶ Reactivar'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- MODAL AÑADIR HABITACIÓN --- */}
      {hotelHabitacion && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in-up">
            <div className="bg-emerald-600 text-white p-4 flex justify-between items-center">
              <h3 className="text-xl font-bold">Registrar Habitación</h3>
              <button onClick={() => setHotelHabitacion(null)} className="text-xl hover:text-emerald-200">✖</button>
            </div>
            
            <form onSubmit={registrarHabitacion} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-1">N° de Habitación</label><input type="number" required className="w-full border rounded px-3 py-2 outline-none focus:border-emerald-500" value={nuevaHabitacion.numero} onChange={e => setNuevaHabitacion({...nuevaHabitacion, numero: e.target.value})} /></div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tipo</label>
                  <select className="w-full border rounded px-3 py-2 outline-none focus:border-emerald-500" value={nuevaHabitacion.tipo} onChange={e => setNuevaHabitacion({...nuevaHabitacion, tipo: e.target.value})}>
                    <option value="Sencilla">Sencilla</option><option value="Doble">Doble</option><option value="Suite">Suite</option><option value="Familiar">Familiar</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-1">Precio Base ($)</label><input type="number" required className="w-full border rounded px-3 py-2 outline-none focus:border-emerald-500" value={nuevaHabitacion.precio_base} onChange={e => setNuevaHabitacion({...nuevaHabitacion, precio_base: e.target.value})} /></div>
                <div><label className="block text-sm font-medium mb-1">Capacidad Máx</label><input type="number" min="1" required className="w-full border rounded px-3 py-2 outline-none focus:border-emerald-500" value={nuevaHabitacion.capacidad_maxima} onChange={e => setNuevaHabitacion({...nuevaHabitacion, capacidad_maxima: e.target.value})} /></div>
              </div>
              <div><label className="block text-sm font-medium mb-1">Descripción corta</label><input type="text" required placeholder="Ej: Vista al mar con balcón..." className="w-full border rounded px-3 py-2 outline-none focus:border-emerald-500" value={nuevaHabitacion.descripcion} onChange={e => setNuevaHabitacion({...nuevaHabitacion, descripcion: e.target.value})} /></div>
              <div><label className="block text-sm font-medium mb-1">Servicios (Separados por coma)</label><input type="text" placeholder="Ej: TV, Minibar, Jacuzzi..." className="w-full border rounded px-3 py-2 outline-none focus:border-emerald-500" value={nuevaHabitacion.servicios} onChange={e => setNuevaHabitacion({...nuevaHabitacion, servicios: e.target.value})} /></div>
              <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-lg mt-4 transition-colors">Guardar Habitación</button>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL GESTIÓN DEL HOTEL (R2 Y R7) --- */}
      {hotelGestion && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col md:flex-row h-fit max-h-[90vh] overflow-y-auto relative">
            
            <button onClick={() => setHotelGestion(null)} className="absolute top-4 right-4 z-10 bg-white/50 hover:bg-red-100 text-red-500 rounded-full w-8 h-8 flex justify-center items-center font-bold">✖</button>

            {/* Columna Izquierda: Promociones y Servicios */}
            <div className="flex-1 p-6 border-r border-slate-100 flex flex-col gap-6">
              
              <div>
                <h3 className="text-lg font-bold text-indigo-700 mb-4 border-b pb-2">Añadir Promoción (R2)</h3>
                <form onSubmit={agregarPromocion} className="space-y-4">
                  <div><label className="block text-sm font-medium mb-1">Nombre Oferta</label><input type="text" required className="w-full border rounded px-3 py-2 text-sm outline-none focus:border-indigo-500" value={nuevaPromocion.nombre} onChange={e => setNuevaPromocion({...nuevaPromocion, nombre: e.target.value})} /></div>
                  <div className="flex gap-2">
                    <div className="flex-1"><label className="block text-sm font-medium mb-1">% Descuento</label><input type="number" required min="1" max="99" className="w-full border rounded px-3 py-2 text-sm outline-none focus:border-indigo-500" value={nuevaPromocion.descuento} onChange={e => setNuevaPromocion({...nuevaPromocion, descuento: e.target.value})} /></div>
                    <div className="flex-1"><label className="block text-sm font-medium mb-1">Temporada</label><input type="text" required placeholder="Ej: Alta" className="w-full border rounded px-3 py-2 text-sm outline-none focus:border-indigo-500" value={nuevaPromocion.temporada} onChange={e => setNuevaPromocion({...nuevaPromocion, temporada: e.target.value})} /></div>
                  </div>
                  <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded">Guardar Oferta</button>
                </form>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border">
                <h3 className="text-md font-bold text-slate-800 mb-4">Añadir Servicio Adicional (R2)</h3>
                <form onSubmit={agregarServicio} className="space-y-3">
                  <input type="text" required placeholder="Ej: Gimnasio, Coworking..." className="w-full border rounded px-3 py-2 text-sm outline-none focus:border-slate-500" value={nuevoServicio} onChange={e => setNuevoServicio(e.target.value)} />
                  <button type="submit" className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-2 rounded text-sm">Añadir Servicio</button>
                </form>
              </div>
            </div>

            {/* Columna Derecha: Calendario Específico (R7) */}
            <div className="flex-1 p-6 bg-slate-50">
              <h3 className="text-lg font-bold text-indigo-700 mb-2 border-b pb-2">Calendario del Hotel (R7)</h3>
              <p className="text-xs text-slate-500 mb-4">Si seleccionas "Heredada", el sistema usará la temporada configurada en el <b>Calendario Regional</b>. Si seleccionas otra, esta anulará la global.</p>
              
              <div className="grid grid-cols-2 gap-2 max-h-[60vh] overflow-y-auto pr-2">
                {Object.keys(nombresMeses).map(mes => (
                  <div key={mes} className="bg-white border rounded p-2 text-center flex flex-col shadow-sm">
                    <span className="text-xs font-bold text-slate-700 uppercase">{nombresMeses[mes]}</span>
                    <select 
                      className={`mt-1 text-xs p-1 rounded font-semibold outline-none cursor-pointer ${hotelGestion.calendario && hotelGestion.calendario[mes] === 'Alta' ? 'bg-red-100 text-red-700 border-red-200' : hotelGestion.calendario && hotelGestion.calendario[mes] === 'Media' ? 'bg-orange-100 text-orange-700 border-orange-200' : hotelGestion.calendario && hotelGestion.calendario[mes] === 'Baja' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-slate-100 text-slate-600'}`}
                      value={(hotelGestion.calendario && hotelGestion.calendario[mes]) || 'Heredada'}
                      onChange={(e) => cambiarMesHotel(hotelGestion.id, mes, e.target.value)}
                    >
                      <option value="Heredada">Heredada (Global)</option>
                      <option value="Baja">Baja</option>
                      <option value="Media">Media (+15%)</option>
                      <option value="Alta">Alta (+30%)</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>
            
          </div>
        </div>
      )}

      {/* --- MODAL CALENDARIO DETALLADO DE HABITACIÓN (R8) --- */}
      {verCalendarioHab && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-fade-in-up">
            <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
              <h3 className="text-xl font-bold">📅 Disponibilidad 30 Días</h3>
              <button onClick={() => setVerCalendarioHab(null)} className="text-xl hover:text-blue-200">✖</button>
            </div>
            
            <div className="p-6">
              <p className="text-sm text-slate-500 mb-4">
                Habitación <b>{verCalendarioHab.hab.tipo} (N° {verCalendarioHab.hab.numero})</b>. Los días en rojo representan fechas ocupadas.
              </p>

              <div className="grid grid-cols-5 md:grid-cols-7 gap-2">
                {/* Generador de los próximos 30 días en tiempo real */}
                {Array.from({ length: 30 }).map((_, i) => {
                  const hoy = new Date();
                  hoy.setDate(hoy.getDate() + i);
                  const fechaStr = hoy.toISOString().split('T')[0]; // YYYY-MM-DD
                  
                  // R8: Verificamos si la fecha exacta existe en el diccionario de Python
                  const ocupado = verCalendarioHab.hab.calendario_disponibilidad && verCalendarioHab.hab.calendario_disponibilidad[fechaStr];

                  return (
                    <div key={fechaStr} className={`p-2 border rounded-lg text-center flex flex-col justify-center items-center h-16 transition-colors ${ocupado ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                      <span className={`text-[10px] font-bold ${ocupado ? 'text-red-400' : 'text-green-500'}`}>
                        {hoy.toLocaleDateString('es-ES', { month: 'short' }).toUpperCase()}
                      </span>
                      <span className={`text-lg font-black leading-none ${ocupado ? 'text-red-600' : 'text-green-700'}`}>
                        {hoy.getDate()}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Admin;