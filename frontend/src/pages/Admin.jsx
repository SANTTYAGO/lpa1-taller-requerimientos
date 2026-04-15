import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function Admin() {
  // === ESTADOS ORIGINALES FUNCIONALES ===
  const [hoteles, setHoteles] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [calendarioRegional, setCalendarioRegional] = useState({});
  
  const [nuevoHotel, setNuevoHotel] = useState({ nombre: '', direccion: '', telefono: '', correo: '', ubicacion: '', servicios: '', politicas_pago: 'Pago por adelantado' });
  const [hotelGestion, setHotelGestion] = useState(null);
  const [nuevaPromocion, setNuevaPromocion] = useState({ nombre: '', descuento: '', temporada: '' });
  const [nuevoServicio, setNuevoServicio] = useState('');
  const [hotelHabitacion, setHotelHabitacion] = useState(null);
  const [nuevaHabitacion, setNuevaHabitacion] = useState({ numero: '', tipo: 'Sencilla', descripcion: '', precio_base: '', capacidad_maxima: '1', servicios: '' });
  const [verCalendarioHab, setVerCalendarioHab] = useState(null);

  // NUEVO ESTADO PARA LA UI DEL DASHBOARD
  const [pestañaActiva, setPestañaActiva] = useState('hoteles'); // hoteles | calendario | reservas
  const [mostrarModalNuevoHotel, setMostrarModalNuevoHotel] = useState(false);

  const nombresMeses = {1:'Ene', 2:'Feb', 3:'Mar', 4:'Abr', 5:'May', 6:'Jun', 7:'Jul', 8:'Ago', 9:'Sep', 10:'Oct', 11:'Nov', 12:'Dic'};

  // === FUNCIONES DE CARGA Y LOGICA (INTACTAS) ===
  const cargarHoteles = () => fetch('http://127.0.0.1:5000/api/hoteles').then(r => r.json()).then(setHoteles).catch(console.error);
  const cargarCalendarioRegional = () => fetch('http://127.0.0.1:5000/api/calendario/regional').then(r => r.json()).then(setCalendarioRegional).catch(console.error);
  const cargarReservas = () => fetch('http://127.0.0.1:5000/api/reservas').then(r => r.json()).then(setReservas).catch(console.error);

  useEffect(() => { cargarHoteles(); cargarCalendarioRegional(); cargarReservas(); }, []);

  const cambiarMesRegional = async (mes, temporada) => {
    await fetch('http://127.0.0.1:5000/api/calendario/regional', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mes, temporada }) });
    cargarCalendarioRegional();
  };

  const cambiarMesHotel = async (hotelId, mes, temporada) => {
    await fetch(`http://127.0.0.1:5000/api/hoteles/${hotelId}/calendario`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mes, temporada }) });
    setHotelGestion(prev => ({ ...prev, calendario: { ...prev.calendario, [mes]: temporada } }));
    cargarHoteles();
  };

  const registrarNuevoHotel = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://127.0.0.1:5000/api/hoteles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(nuevoHotel) });
      if (res.ok) {
        alert("¡Hotel registrado exitosamente!");
        setNuevoHotel({ nombre: '', direccion: '', telefono: '', correo: '', ubicacion: '', servicios: '', politicas_pago: 'Pago por adelantado' });
        setMostrarModalNuevoHotel(false);
        cargarHoteles();
      }
    } catch (error) { alert("Error conectando con el servidor."); }
  };

  const agregarPromocion = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://127.0.0.1:5000/api/hoteles/${hotelGestion.id}/promociones`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(nuevaPromocion) });
      if (res.ok) { setNuevaPromocion({ nombre: '', descuento: '', temporada: '' }); cargarHoteles(); setHotelGestion(null); alert("Promoción añadida"); }
    } catch (err) { alert("Error agregando promoción"); }
  };

  const agregarServicio = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://127.0.0.1:5000/api/hoteles/${hotelGestion.id}/servicios`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ servicio: nuevoServicio }) });
      if (res.ok) { setNuevoServicio(''); cargarHoteles(); setHotelGestion(null); alert("Servicio añadido"); }
    } catch (err) { alert("Error agregando servicio"); }
  };

  const registrarHabitacion = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://127.0.0.1:5000/api/hoteles/${hotelHabitacion.id}/habitaciones`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(nuevaHabitacion) });
      if (res.ok) {
        setNuevaHabitacion({ numero: '', tipo: 'Sencilla', descripcion: '', precio_base: '', capacidad_maxima: '1', servicios: '' });
        cargarHoteles(); setHotelHabitacion(null); alert("¡Habitación añadida!");
      }
    } catch (err) { alert("Error agregando habitación"); }
  };

  const toggleEstadoHotel = async (hotel) => {
    const nuevoEstado = hotel.estado === 'activo' ? 'inactivo' : 'activo';
    await fetch(`http://127.0.0.1:5000/api/hoteles/${hotel.id}/estado`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ estado: nuevoEstado }) });
    cargarHoteles(); 
  };

  const toggleEstadoHabitacion = async (hotelId, hab) => {
    const nuevoEstado = hab.estado === 'activa' ? 'inactiva' : 'activa';
    await fetch(`http://127.0.0.1:5000/api/hoteles/${hotelId}/habitaciones/${hab.numero}/estado`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ estado: nuevoEstado }) });
    cargarHoteles();
  };

  const ejecutarCancelacion = async (id) => {
    if(!window.confirm("¿Estás seguro de cancelar esta reserva? El sistema calculará la penalidad.")) return;
    try {
      const res = await fetch(`http://127.0.0.1:5000/api/reservas/${id}/cancelar`, { method: 'PUT' });
      const data = await res.json();
      if(res.ok) { alert(`🚫 Reserva Cancelada.\n💰 Reembolso: $${data.reembolso}\n📉 Penalidad: $${data.penalidad}`); cargarReservas(); cargarHoteles(); } 
      else { alert(data.error); }
    } catch(err) { alert("Error al cancelar"); }
  };

  // Cálculos rápidos para los KPIs
  const totalIngresos = reservas.reduce((acc, res) => res.estado_pago.includes('Pagado') ? acc + res.monto_total : acc, 0);
  const totalHabitaciones = hoteles.reduce((acc, h) => acc + h.habitaciones.length, 0);

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans text-slate-800 overflow-hidden">
      
      {/* 1. SIDEBAR LATERAL (Menú de Navegación) */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-2xl z-20">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <svg className="w-8 h-8 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2L2 22h20L12 2z"/><path d="M12 10l-4 8h8l-4-8z"/></svg>
          <span className="text-xl font-bold tracking-widest uppercase">Aura<span className="font-light text-slate-400 text-sm block">Workspace</span></span>
        </div>
        
        <div className="flex-1 py-6 flex flex-col gap-2 px-4">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 pl-2">Gestión</p>
          <button onClick={() => setPestañaActiva('hoteles')} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${pestañaActiva === 'hoteles' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
            Hoteles & Habitaciones
          </button>
          <button onClick={() => setPestañaActiva('reservas')} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${pestañaActiva === 'reservas' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
            Reservas {reservas.filter(r=>!r.estado_pago.includes('Cancelada')).length > 0 && <span className="ml-auto bg-indigo-500 text-white text-[10px] px-2 py-0.5 rounded-full">{reservas.filter(r=>!r.estado_pago.includes('Cancelada')).length}</span>}
          </button>
          <button onClick={() => setPestañaActiva('calendario')} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${pestañaActiva === 'calendario' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            Calendario Global
          </button>
        </div>

        <div className="p-4 border-t border-slate-800">
          <Link to="/" className="flex items-center justify-center gap-2 w-full bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 rounded-xl text-sm font-medium transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            Ir a la Web Pública
          </Link>
        </div>
      </aside>

      {/* 2. ÁREA PRINCIPAL (Contenido dinámico) */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        
        {/* Cabecera Superior */}
        <header className="bg-white border-b border-slate-200 px-8 py-5 flex justify-between items-center z-10">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Panel de Control</h2>
            <p className="text-sm text-slate-500 font-medium">{new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex justify-center items-center font-bold border border-indigo-200">A</div>
            <div className="hidden md:block">
              <p className="text-sm font-bold text-slate-700">Admin General</p>
              <p className="text-xs text-slate-400">aura_admin@travel.com</p>
            </div>
          </div>
        </header>

        {/* Contenedor scrolleable */}
        <div className="flex-1 overflow-y-auto p-8">
          
          {/* Tarjetas KPI (Indicadores Clave) */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex justify-center items-center"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg></div>
              <div><p className="text-sm font-medium text-slate-500">Hoteles Activos</p><p className="text-2xl font-bold text-slate-800">{hoteles.filter(h=>h.estado==='activo').length}</p></div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex justify-center items-center"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg></div>
              <div><p className="text-sm font-medium text-slate-500">Total Habitaciones</p><p className="text-2xl font-bold text-slate-800">{totalHabitaciones}</p></div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex justify-center items-center"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg></div>
              <div><p className="text-sm font-medium text-slate-500">Reservas Activas</p><p className="text-2xl font-bold text-slate-800">{reservas.filter(r=>!r.estado_pago.includes('Cancelada')).length}</p></div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex justify-center items-center"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg></div>
              <div><p className="text-sm font-medium text-slate-500">Ingresos Conf.</p><p className="text-2xl font-bold text-slate-800">${totalIngresos}</p></div>
            </div>
          </div>

          {/* VISTA 1: GESTIÓN DE HOTELES */}
          {pestañaActiva === 'hoteles' && (
            <div className="space-y-6 animate-fade-in-up">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-800">Catálogo de Propiedades</h3>
                <button onClick={() => setMostrarModalNuevoHotel(true)} className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-sm font-medium shadow-md transition-colors flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                  Añadir Propiedad
                </button>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {hoteles.map(hotel => (
                  <div key={hotel.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-bold text-xl text-slate-800">{hotel.nombre}</h3>
                          <span className={`px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold rounded-lg border ${hotel.estado === 'activo' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                            {hotel.estado}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-slate-500 flex items-center gap-1">📍 {hotel.ubicacion} <span className="mx-2 text-slate-300">|</span> 💳 {hotel.politicas_pago}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => toggleEstadoHotel(hotel)} className={`w-8 h-8 rounded-lg flex justify-center items-center border transition-colors ${hotel.estado === 'activo' ? 'bg-white border-slate-200 text-red-500 hover:bg-red-50 hover:border-red-200' : 'bg-emerald-500 border-emerald-500 text-white hover:bg-emerald-600'}`} title={hotel.estado === 'activo' ? 'Suspender' : 'Reactivar'}>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        </button>
                        <button onClick={() => setHotelGestion(hotel)} className="w-8 h-8 rounded-lg flex justify-center items-center bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors" title="Ajustes (Ofertas/Calendario)">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                        </button>
                      </div>
                    </div>
                    
                    <div className="p-6 bg-white">
                      <div className="flex justify-between items-center mb-4">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Habitaciones ({hotel.habitaciones.length})</p>
                        <button onClick={() => setHotelHabitacion(hotel)} className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors">+ Añadir Cuarto</button>
                      </div>
                      
                      <div className="space-y-3">
                        {hotel.habitaciones.length === 0 ? <p className="text-sm text-slate-400 italic">No hay habitaciones configuradas.</p> : null}
                        {hotel.habitaciones.map(hab => (
                          <div key={hab.numero} className={`flex justify-between items-center p-3 rounded-xl border ${hab.estado === 'activa' ? 'bg-slate-50 border-slate-100' : 'bg-red-50/50 border-red-100'}`}>
                            <div className="flex items-center gap-4">
                              <div className={`w-10 h-10 rounded-lg flex justify-center items-center font-bold text-sm ${hab.estado === 'activa' ? 'bg-white border border-slate-200 text-slate-600' : 'bg-red-100 text-red-600'}`}>{hab.numero}</div>
                              <div>
                                <p className="font-semibold text-slate-700 text-sm">{hab.tipo}</p>
                                <p className="text-xs text-slate-500 font-medium">Máx: {hab.capacidad_maxima} pers. <span className="mx-1">•</span> ${hab.precio_base}/noche</p>
                              </div>
                            </div>
                            <div className="flex gap-1.5">
                              <button onClick={() => setVerCalendarioHab({hotelId: hotel.id, hab})} className="bg-white border border-slate-200 text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">📅 Cal.</button>
                              <button onClick={() => toggleEstadoHabitacion(hotel.id, hab)} className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${hab.estado === 'activa' ? 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100' : 'bg-emerald-500 text-white border-emerald-500 hover:bg-emerald-600'}`}>{hab.estado === 'activa' ? '🔧 Mantenimiento' : '▶ Activar'}</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VISTA 2: CALENDARIO GLOBAL */}
          {pestañaActiva === 'calendario' && (
            <div className="animate-fade-in-up bg-white p-8 rounded-2xl border border-slate-200 shadow-sm max-w-4xl">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-slate-800">Calendario Regional (Global)</h3>
                <p className="text-slate-500 text-sm mt-1">Configura las temporadas mundiales. Estas reglas aplicarán a todos los hoteles a menos que un hotel configure sus propios meses (sobreescritura local).</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.keys(nombresMeses).map(mes => (
                  <div key={mes} className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex flex-col items-center">
                    <span className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-3">{nombresMeses[mes]}</span>
                    <select 
                      className={`w-full text-sm p-2 rounded-lg font-semibold outline-none transition-colors cursor-pointer border-transparent ring-2 ring-transparent focus:ring-indigo-200 ${calendarioRegional[mes] === 'Alta' ? 'bg-red-50 text-red-700' : calendarioRegional[mes] === 'Media' ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}
                      value={calendarioRegional[mes] || 'Baja'}
                      onChange={(e) => cambiarMesRegional(mes, e.target.value)}
                    >
                      <option value="Baja">🟢 Temp. Baja</option>
                      <option value="Media">🟡 Temp. Media (+15%)</option>
                      <option value="Alta">🔴 Temp. Alta (+30%)</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VISTA 3: RESERVAS Y CANCELACIONES */}
          {pestañaActiva === 'reservas' && (
            <div className="animate-fade-in-up bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="text-lg font-bold text-slate-800">Gestor de Reservas</h3>
                <span className="bg-indigo-100 text-indigo-700 font-bold text-xs px-3 py-1 rounded-full">Registro Histórico</span>
              </div>
              {reservas.length === 0 ? (
                <div className="p-12 text-center text-slate-400">No hay reservas procesadas en el sistema.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-white border-b border-slate-200 text-slate-400 uppercase text-[10px] font-bold tracking-widest">
                      <tr>
                        <th className="p-4 pl-6">ID Localizador</th>
                        <th className="p-4">Cliente</th>
                        <th className="p-4">Propiedad & Cuarto</th>
                        <th className="p-4">Periodo</th>
                        <th className="p-4">Monto Final</th>
                        <th className="p-4">Estado</th>
                        <th className="p-4 pr-6 text-right">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {reservas.map(res => (
                        <tr key={res.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-4 pl-6 font-mono font-bold text-slate-500">#{res.id.toString().padStart(5, '0')}</td>
                          <td className="p-4 font-semibold text-slate-800">{res.cliente}</td>
                          <td className="p-4">
                            <span className="block font-medium text-slate-700">{res.hotel}</span>
                            <span className="text-xs text-slate-400">{res.habitacion_tipo} (N° {res.habitacion_numero})</span>
                          </td>
                          <td className="p-4">
                            <span className="block font-medium text-slate-600">{res.fechas[0]}</span>
                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold mt-1 ${res.temporada === 'Alta' ? 'bg-red-50 text-red-600' : res.temporada === 'Media' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>T. {res.temporada}</span>
                          </td>
                          <td className="p-4 font-bold text-slate-800">${res.monto_total}</td>
                          <td className="p-4">
                            <span className={`px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider ${res.estado_pago.includes('Cancelada') ? 'bg-red-50 text-red-600' : res.estado_pago.includes('Pendiente') ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                              {res.estado_pago.replace(' (Pago en destino)', '')}
                            </span>
                          </td>
                          <td className="p-4 pr-6 text-right">
                            {!res.estado_pago.includes('Cancelada') && (
                              <button onClick={() => ejecutarCancelacion(res.id)} className="bg-white border border-red-200 text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm transition-colors">
                                Cancelar
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

        </div>
      </main>

      {/* === MODALES INTERNOS RE-ESTILIZADOS === */}

      {/* Modal Añadir Nuevo Hotel */}
      {mostrarModalNuevoHotel && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden animate-fade-in-up">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-bold text-slate-800">Registrar Propiedad</h3>
              <button onClick={() => setMostrarModalNuevoHotel(false)} className="text-slate-400 hover:text-slate-700">✖</button>
            </div>
            <form onSubmit={registrarNuevoHotel} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nombre</label><input type="text" required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:bg-white transition-all" value={nuevoHotel.nombre} onChange={e => setNuevoHotel({...nuevoHotel, nombre: e.target.value})} /></div>
                <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Ubicación</label><input type="text" required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:bg-white transition-all" value={nuevoHotel.ubicacion} onChange={e => setNuevoHotel({...nuevoHotel, ubicacion: e.target.value})} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Teléfono</label><input type="text" required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:bg-white transition-all" value={nuevoHotel.telefono} onChange={e => setNuevoHotel({...nuevoHotel, telefono: e.target.value})} /></div>
                <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Correo</label><input type="email" required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:bg-white transition-all" value={nuevoHotel.correo} onChange={e => setNuevoHotel({...nuevoHotel, correo: e.target.value})} /></div>
              </div>
              <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Dirección</label><input type="text" required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:bg-white transition-all" value={nuevoHotel.direccion} onChange={e => setNuevoHotel({...nuevoHotel, direccion: e.target.value})} /></div>
              <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Servicios Base</label><input type="text" placeholder="Ej: Piscina, Gimnasio..." className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:bg-white transition-all" value={nuevoHotel.servicios} onChange={e => setNuevoHotel({...nuevoHotel, servicios: e.target.value})} /></div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Política de Pago (R9)</label>
                <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:bg-white transition-all text-slate-700" value={nuevoHotel.politicas_pago} onChange={e => setNuevoHotel({...nuevoHotel, politicas_pago: e.target.value})}>
                  <option value="Pago por adelantado">Cobro completo por adelantado</option>
                  <option value="Pago al llegar">Tarjeta como garantía (Pago en hotel)</option>
                </select>
              </div>
              <div className="pt-4 border-t border-slate-100">
                <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-3.5 rounded-xl shadow-lg transition-colors text-sm">Guardar Propiedad</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Ajustes Hotel (Ofertas y Calendario) */}
      {hotelGestion && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col md:flex-row h-fit max-h-[90vh]">
            <button onClick={() => setHotelGestion(null)} className="absolute top-4 right-4 z-10 w-8 h-8 bg-white/80 hover:bg-slate-100 text-slate-500 rounded-full flex justify-center items-center transition-colors">✖</button>
            
            <div className="flex-1 p-8 border-r border-slate-100 overflow-y-auto bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800 mb-6 pb-4 border-b border-slate-200">Ajustes de {hotelGestion.nombre}</h3>
              <div className="mb-8">
                <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-3">Nueva Promoción</p>
                <form onSubmit={agregarPromocion} className="space-y-3 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                  <input type="text" required placeholder="Nombre (Ej: Cyber Monday)" className="w-full bg-slate-50 border-transparent focus:border-indigo-300 rounded-lg px-3 py-2 text-sm outline-none" value={nuevaPromocion.nombre} onChange={e => setNuevaPromocion({...nuevaPromocion, nombre: e.target.value})} />
                  <div className="flex gap-2">
                    <input type="number" required placeholder="% Dto" min="1" max="99" className="w-1/2 bg-slate-50 border-transparent focus:border-indigo-300 rounded-lg px-3 py-2 text-sm outline-none" value={nuevaPromocion.descuento} onChange={e => setNuevaPromocion({...nuevaPromocion, descuento: e.target.value})} />
                    <input type="text" required placeholder="Temp. (Ej: Alta)" className="w-1/2 bg-slate-50 border-transparent focus:border-indigo-300 rounded-lg px-3 py-2 text-sm outline-none" value={nuevaPromocion.temporada} onChange={e => setNuevaPromocion({...nuevaPromocion, temporada: e.target.value})} />
                  </div>
                  <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-lg text-sm transition-colors">Añadir Oferta</button>
                </form>
              </div>
              <div>
                <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-3">Nuevo Servicio</p>
                <form onSubmit={agregarServicio} className="flex gap-2 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
                  <input type="text" required placeholder="Ej: Spa..." className="flex-1 bg-slate-50 border-transparent focus:border-indigo-300 rounded-lg px-3 py-2 text-sm outline-none" value={nuevoServicio} onChange={e => setNuevoServicio(e.target.value)} />
                  <button type="submit" className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">Añadir</button>
                </form>
              </div>
            </div>

            <div className="flex-1 p-8 bg-white overflow-y-auto">
              <h3 className="text-lg font-bold text-slate-800 mb-2">Calendario Específico (R7)</h3>
              <p className="text-xs text-slate-500 mb-6 leading-relaxed">Sobreescribe el calendario Global mes a mes. Selecciona "Heredada" para obedecer la regla mundial.</p>
              <div className="grid grid-cols-2 gap-3 pr-2">
                {Object.keys(nombresMeses).map(mes => (
                  <div key={mes} className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex flex-col shadow-sm">
                    <span className="text-xs font-bold text-slate-700 uppercase mb-2">{nombresMeses[mes]}</span>
                    <select 
                      className={`text-xs p-2 rounded-lg font-semibold outline-none cursor-pointer border border-transparent ${hotelGestion.calendario && hotelGestion.calendario[mes] === 'Alta' ? 'bg-red-50 text-red-700 border-red-100' : hotelGestion.calendario && hotelGestion.calendario[mes] === 'Media' ? 'bg-amber-50 text-amber-700 border-amber-100' : hotelGestion.calendario && hotelGestion.calendario[mes] === 'Baja' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-white text-slate-500 border-slate-200'}`}
                      value={(hotelGestion.calendario && hotelGestion.calendario[mes]) || 'Heredada'}
                      onChange={(e) => cambiarMesHotel(hotelGestion.id, mes, e.target.value)}
                    >
                      <option value="Heredada">🌐 Heredada (Global)</option>
                      <option value="Baja">🟢 Baja</option>
                      <option value="Media">🟡 Media (+15%)</option>
                      <option value="Alta">🔴 Alta (+30%)</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Añadir Habitación y Modal de Calendario de 30 Días permanecen con estilos similares simplificados por espacio,
          pero integrados en la misma estética limpia (bg-white, rounded-2xl, border-slate-100). */}
      {/* ... (Se asume la misma estructura para hotelHabitacion y verCalendarioHab pero con rounded-2xl y botones minimalistas) ... */}

      {/* AÑADIR HABITACION MODAL */}
      {hotelHabitacion && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in-up">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-bold text-slate-800">Registrar Habitación</h3>
              <button onClick={() => setHotelHabitacion(null)} className="text-slate-400 hover:text-slate-700">✖</button>
            </div>
            <form onSubmit={registrarHabitacion} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">N° Cuarto</label><input type="number" required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none" value={nuevaHabitacion.numero} onChange={e => setNuevaHabitacion({...nuevaHabitacion, numero: e.target.value})} /></div>
                <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tipo</label><select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none" value={nuevaHabitacion.tipo} onChange={e => setNuevaHabitacion({...nuevaHabitacion, tipo: e.target.value})}><option value="Sencilla">Sencilla</option><option value="Doble">Doble</option><option value="Suite">Suite</option><option value="Familiar">Familiar</option></select></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Precio Base</label><input type="number" required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none" value={nuevaHabitacion.precio_base} onChange={e => setNuevaHabitacion({...nuevaHabitacion, precio_base: e.target.value})} /></div>
                <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Capacidad</label><input type="number" min="1" required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none" value={nuevaHabitacion.capacidad_maxima} onChange={e => setNuevaHabitacion({...nuevaHabitacion, capacidad_maxima: e.target.value})} /></div>
              </div>
              <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Descripción</label><input type="text" required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none" value={nuevaHabitacion.descripcion} onChange={e => setNuevaHabitacion({...nuevaHabitacion, descripcion: e.target.value})} /></div>
              <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Servicios (comas)</label><input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none" value={nuevaHabitacion.servicios} onChange={e => setNuevaHabitacion({...nuevaHabitacion, servicios: e.target.value})} /></div>
              <div className="pt-4"><button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3.5 rounded-xl shadow-lg transition-colors text-sm">Guardar Habitación</button></div>
            </form>
          </div>
        </div>
      )}

      {/* CALENDARIO HABITACIÓN MODAL */}
      {verCalendarioHab && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-fade-in-up">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-bold text-slate-800">Disponibilidad 30 Días</h3>
              <button onClick={() => setVerCalendarioHab(null)} className="text-slate-400 hover:text-slate-700">✖</button>
            </div>
            <div className="p-6">
              <p className="text-sm text-slate-500 mb-6 text-center">Habitación <span className="font-bold text-indigo-600">{verCalendarioHab.hab.tipo} (N° {verCalendarioHab.hab.numero})</span>. Días rojos están bloqueados.</p>
              <div className="grid grid-cols-5 md:grid-cols-7 gap-3">
                {Array.from({ length: 30 }).map((_, i) => {
                  const hoy = new Date(); hoy.setDate(hoy.getDate() + i); const fechaStr = hoy.toISOString().split('T')[0];
                  const ocupado = verCalendarioHab.hab.calendario_disponibilidad && verCalendarioHab.hab.calendario_disponibilidad[fechaStr];
                  return (
                    <div key={fechaStr} className={`p-3 border rounded-xl text-center flex flex-col justify-center items-center h-20 transition-all ${ocupado ? 'bg-red-50 border-red-100 shadow-inner' : 'bg-white border-slate-200 shadow-sm'}`}>
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${ocupado ? 'text-red-400' : 'text-slate-400'}`}>{hoy.toLocaleDateString('es-ES', { month: 'short' })}</span>
                      <span className={`text-xl font-black mt-1 ${ocupado ? 'text-red-600' : 'text-slate-700'}`}>{hoy.getDate()}</span>
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