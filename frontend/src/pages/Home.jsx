import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function Home() {
  const [hoteles, setHoteles] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  
  const [busqueda, setBusqueda] = useState('');
  const [habitacionSeleccionada, setHabitacionSeleccionada] = useState(null);
  const [detalleHabitacion, setDetalleHabitacion] = useState(null);
  
  const [nombreCliente, setNombreCliente] = useState('');
  const [telefonoCliente, setTelefonoCliente] = useState('');
  const [correoCliente, setCorreoCliente] = useState('');
  const [direccionCliente, setDireccionCliente] = useState('');
  
  const [noches, setNoches] = useState(1);
  const [personas, setPersonas] = useState(1);
  const [fechaLlegada, setFechaLlegada] = useState('');
  
  const [totalCalculado, setTotalCalculado] = useState(0);
  const [temporadaDetectada, setTemporadaDetectada] = useState('');
  const [errorCotizacion, setErrorCotizacion] = useState(null);
  const [procesandoPago, setProcesandoPago] = useState(false);
  const [reservaConfirmada, setReservaConfirmada] = useState(null);

  const [filtroPrecio, setFiltroPrecio] = useState(1500);
  const [filtroCalificacion, setFiltroCalificacion] = useState(0);

  const [nuevoComentario, setNuevoComentario] = useState({ autor: '', calificacion: '5', texto: '' });

  useEffect(() => {
    fetch('http://127.0.0.1:5000/api/hoteles')
      .then(r => r.json())
      .then(datos => { setHoteles(datos); setCargando(false); })
      .catch(err => { setError("Error de conexión"); setCargando(false); });
  }, []);

  useEffect(() => {
    if (habitacionSeleccionada && fechaLlegada) {
      const p = parseInt(personas) || 1;
      const n = parseInt(noches) || 1;
      const mes = new Date(fechaLlegada).getMonth() + 1; 

      fetch('http://127.0.0.1:5000/api/cotizar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hotel_id: habitacionSeleccionada.hotelId,
          habitacion_numero: habitacionSeleccionada.hab.numero,
          personas: p, noches: n, mes_llegada: mes
        })
      })
      .then(r => r.json())
      .then(data => {
        if(data.total) {
          setTotalCalculado(data.total); setTemporadaDetectada(data.temporada_aplicada); setErrorCotizacion(null);
        } else if (data.error) { setErrorCotizacion(data.error); }
      })
      .catch(err => console.error("Error cotizando", err));
    }
  }, [noches, personas, fechaLlegada, habitacionSeleccionada]);

  const obtenerImagen = (ubicacion) => {
    const nombreArchivo = ubicacion?.toLowerCase().replace('ú', 'u').replace('á', 'a').replace(' ', '');
    return `/static/${nombreArchivo}.png`;
  };

  const hotelesFiltrados = hoteles.filter(hotel => {
    const coincideUbicacion = hotel.ubicacion.toLowerCase().includes(busqueda.toLowerCase()) || hotel.nombre.toLowerCase().includes(busqueda.toLowerCase());
    const coincideCalificacion = hotel.calificacion_promedio_general >= filtroCalificacion;
    const tieneHabitacionBarata = hotel.habitaciones.some(hab => hab.precio_base <= filtroPrecio && hab.estado === 'activa');
    return hotel.estado === 'activo' && coincideUbicacion && coincideCalificacion && tieneHabitacionBarata;
  });

  const confirmarReserva = async (e) => {
    e.preventDefault();
    setProcesandoPago(true);

    const datosReserva = {
      hotel_id: habitacionSeleccionada.hotelId, habitacion_numero: habitacionSeleccionada.hab.numero,
      nombre_cliente: nombreCliente, telefono_cliente: telefonoCliente, correo_cliente: correoCliente, direccion_cliente: direccionCliente,
      noches: parseInt(noches), personas: parseInt(personas), fecha_llegada: fechaLlegada
    };

    try {
      const respuesta = await fetch('http://127.0.0.1:5000/api/reservas', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(datosReserva)
      });
      if (respuesta.ok) {
        const data = await respuesta.json();
        setReservaConfirmada(data.reserva); 
        setHabitacionSeleccionada(null);
        setNombreCliente(''); setTelefonoCliente(''); setCorreoCliente(''); setDireccionCliente('');
        setNoches(1); setPersonas(1); setFechaLlegada('');
      } else { alert("Hubo un error al procesar la reserva."); }
    } catch (error) { alert("Error de conexión con el servidor."); } 
    finally { setProcesandoPago(false); }
  };

  const enviarComentario = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://127.0.0.1:5000/api/hoteles/${detalleHabitacion.hotel.id}/habitaciones/${detalleHabitacion.hab.numero}/comentarios`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(nuevoComentario)
      });
      if (res.ok) {
        const data = await res.json();
        alert("¡Gracias por compartir tu experiencia!");
        setDetalleHabitacion({ ...detalleHabitacion, hab: data.habitacion });
        setNuevoComentario({ autor: '', calificacion: '5', texto: '' });
      }
    } catch (err) { alert("Error al enviar el comentario."); }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-800 relative selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* NAVEGACIÓN SUPERIOR */}
      <nav className="absolute top-0 w-full z-20 px-8 py-6 flex justify-between items-center text-white">
        <div className="flex items-center gap-2">
          {/* Logo Minimalista (SVG Inline) */}
          <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
             <path d="M12 2L2 22h20L12 2z" />
             <path d="M12 10l-4 8h8l-4-8z" />
          </svg>
          <span className="text-xl font-bold tracking-widest uppercase">Aura Travel</span>
        </div>
        <Link to="/admin" className="text-sm font-medium hover:text-indigo-200 transition-colors bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
          Acceso Empleados
        </Link>
      </nav>

      {/* HERO SECTION INMERSIVO */}
      <header className="relative h-[60vh] flex flex-col justify-center items-center px-4 overflow-hidden">
        {/* Imagen de fondo con overlay elegante */}
        <div className="absolute inset-0 z-0">
          <img src="/static/aura_overwater_dusk.png" alt="Aura Travel Destinations" className="w-full h-full object-cover object-center" />
          {/* Gradiente oscuro para contraste */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-900/50 to-slate-900/90"></div>
        </div>
        
        <div className="relative z-10 text-center w-full max-w-4xl mt-12">
          <h1 className="text-5xl md:text-7xl font-light mb-4 text-white tracking-tight">
            Descubre <span className="font-semibold text-indigo-300">Aura.</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-300 mb-10 font-light tracking-wide max-w-2xl mx-auto">
            Hospedaje de lujo, diseño minimalista y experiencias inolvidables alrededor del mundo.
          </p>
          
          {/* Buscador Efecto Glassmorphism */}
          <div className="group bg-white/10 backdrop-blur-md p-2 rounded-full shadow-2xl max-w-2xl mx-auto flex items-center border border-white/20 focus-within:bg-white focus-within:border-white transition-all duration-500">
            <svg className="w-6 h-6 ml-4 text-white group-focus-within:text-indigo-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            <input 
              type="text" 
              placeholder="¿A dónde deseas viajar? (Ej: Madrid, Paris...)" 
              className="flex-1 px-4 py-3 text-white focus-within:text-slate-800 placeholder-white/70 group-focus-within:placeholder-slate-400 bg-transparent outline-none rounded-full font-medium"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
        </div>
      </header>

      {/* BARRA DE FILTROS FLOTANTE */}
      <div className="bg-white border-b border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-wrap gap-8 items-center justify-center">
          <div className="flex flex-col">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Presupuesto Máximo</label>
            <div className="flex items-center gap-4">
              <span className="text-sm font-semibold text-indigo-600 w-12">${filtroPrecio}</span>
              <input type="range" min="100" max="1500" step="50" value={filtroPrecio} onChange={(e) => setFiltroPrecio(e.target.value)} className="w-48 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
            </div>
          </div>
          <div className="hidden md:block w-px h-8 bg-slate-200"></div>
          <div className="flex flex-col">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Calidad Mínima</label>
            <select value={filtroCalificacion} onChange={(e) => setFiltroCalificacion(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-1.5 text-sm font-medium outline-none hover:bg-slate-100 transition-colors text-slate-700 cursor-pointer">
              <option value="0">Todos los alojamientos</option>
              <option value="3">3+ Estrellas</option>
              <option value="4">4+ Estrellas Premium</option>
              <option value="5">5 Estrellas Lujo</option>
            </select>
          </div>
          <div className="text-sm font-medium text-slate-500 ml-auto hidden lg:block">
            Mostrando <span className="text-indigo-600 font-bold">{hotelesFiltrados.length}</span> resultados
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto py-16 px-6">
        {error && <div className="bg-red-50 text-red-600 border border-red-100 p-4 rounded-xl mb-8 font-medium text-center">{error}</div>}
        {cargando ? (
          <div className="flex flex-col justify-center items-center h-64 gap-4 text-slate-400">
            <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <p className="font-medium tracking-wide animate-pulse">Preparando destinos exclusivos...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {hotelesFiltrados.map(hotel => (
              /* TARJETAS FLOTANTES Y MINIMALISTAS */
              <div key={hotel.id} className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden border border-slate-50">
                <div className="h-60 relative group overflow-hidden">
                  <img src={obtenerImagen(hotel.ubicacion)} alt={hotel.ubicacion} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"/>
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-slate-700 shadow-sm flex items-center gap-1">
                    <svg className="w-3 h-3 text-indigo-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path></svg>
                    {hotel.ubicacion}
                  </div>
                </div>
                
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-bold text-slate-800 tracking-tight">{hotel.nombre}</h3>
                    <span className="bg-slate-50 border border-slate-100 text-slate-700 text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1">
                      <svg className="w-3 h-3 text-indigo-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                      {hotel.calificacion_promedio_general > 0 ? hotel.calificacion_promedio_general : 'Nuevo'}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {hotel.servicios_generales.map((srv, i) => <span key={i} className="bg-slate-50 text-slate-500 border border-slate-100 text-[10px] px-2 py-0.5 rounded-md font-medium uppercase tracking-wider">{srv}</span>)}
                  </div>
                  
                  <div className="mt-auto pt-5 border-t border-slate-100 space-y-4">
                    {hotel.habitaciones.filter(hab => hab.estado === 'activa').length === 0 ? (
                      <p className="text-sm text-slate-400 italic text-center py-4">Sin disponibilidad actual</p>
                    ) : (
                      hotel.habitaciones.filter(hab => hab.estado === 'activa').map(hab => (
                        <div key={hab.numero} className="flex flex-col group/hab">
                          <div className="flex justify-between items-end mb-3">
                            <div>
                              <p className="font-semibold text-slate-700">{hab.tipo}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <p className="text-xs text-slate-400 flex items-center gap-1">
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                                  {hab.capacidad_maxima} pers.
                                </p>
                                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                <p className="text-xs font-medium text-slate-500">
                                  ★ {hab.calificacion_promedio > 0 ? hab.calificacion_promedio : '-'}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-slate-400">desde</p>
                              <p className="text-xl font-bold text-slate-800">${hab.precio_base}</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2 opacity-0 group-hover/hab:opacity-100 transition-opacity duration-300 h-0 group-hover/hab:h-auto overflow-hidden">
                            <button onClick={() => setDetalleHabitacion({hotel, hab})} className="bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold py-2.5 rounded-lg transition-colors border border-slate-200">
                              Ver Detalles
                            </button>
                            <button onClick={() => setHabitacionSeleccionada({hotelId: hotel.id, hotelNombre: hotel.nombre, hab: hab, politicas_pago: hotel.politicas_pago})} className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2.5 rounded-lg shadow-sm transition-colors">
                              Reservar
                            </button>
                          </div>
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

      {/* FOOTER AURA */}
      <footer className="bg-slate-900 text-slate-400 py-12 text-center mt-12 border-t border-slate-800">
        <div className="flex justify-center items-center gap-2 mb-4 opacity-50">
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 22h20L12 2z" /><path d="M12 10l-4 8h8l-4-8z" /></svg>
        </div>
        <p className="text-sm tracking-wide">© 2026 Aura Travel. Todos los derechos reservados.</p>
        <Link to="/admin" className="text-xs hover:text-indigo-300 mt-4 inline-block transition-colors opacity-70">Panel Administrativo</Link>
      </footer>

      {/* === MODALES (MANTENEMOS LA MISMA LÓGICA R1 AL R16 PERO RE-ESTILIZADOS) === */}
      
      {/* 1. Modal Detalles y Comentarios */}
      {detalleHabitacion && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="h-72 relative bg-slate-100">
              <button onClick={() => setDetalleHabitacion(null)} className="absolute top-4 right-4 z-10 bg-white/20 backdrop-blur-md hover:bg-white/40 text-white rounded-full w-8 h-8 flex justify-center items-center transition-all">✖</button>
              <img src={detalleHabitacion.hab.fotos?.length > 0 ? detalleHabitacion.hab.fotos[0] : obtenerImagen(detalleHabitacion.hotel.ubicacion)} alt="Room" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-transparent to-transparent"></div>
              <div className="absolute bottom-6 left-8">
                <h3 className="text-4xl font-light text-white tracking-tight mb-1">{detalleHabitacion.hab.tipo}</h3>
                <p className="text-indigo-200 font-medium tracking-wide flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path></svg>
                  {detalleHabitacion.hotel.nombre}
                </p>
              </div>
            </div>
            
            <div className="p-8 overflow-y-auto flex-1 bg-white">
              <div className="flex gap-8 mb-8 pb-8 border-b border-slate-100">
                <div className="flex-1">
                  <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-3">La Experiencia</h4>
                  <p className="text-slate-600 leading-relaxed font-light">{detalleHabitacion.hab.descripcion}</p>
                </div>
                <div className="w-1/3 bg-slate-50 p-6 rounded-2xl text-center border border-slate-100 flex flex-col justify-center">
                  <p className="text-sm text-slate-400 mb-1">Precio por noche</p>
                  <p className="text-4xl font-light text-slate-800 mb-3">${detalleHabitacion.hab.precio_base}</p>
                  <div className="inline-flex items-center justify-center gap-2 px-3 py-1 bg-white rounded-full border border-slate-200 text-xs font-bold text-slate-600">
                    <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                    Hasta {detalleHabitacion.hab.capacidad_maxima} huéspedes
                  </div>
                </div>
              </div>

              <div className="mb-8 pb-8 border-b border-slate-100">
                <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-4">Comodidades Exclusivas</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-y-3 gap-x-4">
                  {detalleHabitacion.hab.servicios_incluidos.map((srv, i) => (
                    <div key={i} className="flex items-center gap-2 text-slate-600 text-sm font-medium">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div> {srv}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-8">
                <div className="flex items-center gap-3 mb-6">
                  <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Reseñas de Huéspedes</h4>
                  <span className="bg-slate-800 text-white px-2 py-0.5 rounded text-xs font-bold flex items-center gap-1">
                    ★ {detalleHabitacion.hab.calificacion_promedio > 0 ? detalleHabitacion.hab.calificacion_promedio : 'Nuevo'}
                  </span>
                </div>
                {detalleHabitacion.hab.comentarios?.length === 0 ? (
                  <p className="text-sm text-slate-400 italic bg-slate-50 p-4 rounded-xl text-center">Aún no hay reseñas. ¡Sé el primero en compartir tu experiencia!</p>
                ) : (
                  <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
                    {detalleHabitacion.hab.comentarios.map((com, i) => (
                      <div key={i} className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                        <div className="flex justify-between items-center mb-3">
                          <p className="font-bold text-slate-800 text-sm">{com.autor || com.cliente}</p>
                          <div className="flex gap-0.5 text-indigo-400 text-xs">{'★'.repeat(com.calificacion)}{'☆'.repeat(5-com.calificacion)}</div>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed font-light">{com.texto}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-8 border-t border-slate-100">
                <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-4">Deja tu opinión</h4>
                <form onSubmit={enviarComentario} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.02)] space-y-4">
                  <div className="flex gap-4">
                    <input type="text" required placeholder="Tu Nombre Completo" className="flex-1 bg-slate-50 border-transparent focus:border-indigo-300 focus:bg-white rounded-xl px-4 py-3 text-sm outline-none transition-all" value={nuevoComentario.autor} onChange={e => setNuevoComentario({...nuevoComentario, autor: e.target.value})} />
                    <select className="w-1/3 bg-slate-50 border-transparent focus:border-indigo-300 focus:bg-white rounded-xl px-4 py-3 text-sm outline-none transition-all text-slate-600" value={nuevoComentario.calificacion} onChange={e => setNuevoComentario({...nuevoComentario, calificacion: e.target.value})}>
                      <option value="5">5 - Excelente</option><option value="4">4 - Muy Bueno</option><option value="3">3 - Regular</option><option value="2">2 - Malo</option><option value="1">1 - Pésimo</option>
                    </select>
                  </div>
                  <textarea required placeholder="Cuéntanos sobre tu estancia..." className="w-full bg-slate-50 border-transparent focus:border-indigo-300 focus:bg-white rounded-xl px-4 py-3 text-sm outline-none resize-none h-24 transition-all" value={nuevoComentario.texto} onChange={e => setNuevoComentario({...nuevoComentario, texto: e.target.value})}></textarea>
                  <button type="submit" className="w-full bg-slate-800 hover:bg-slate-900 text-white font-medium tracking-wide py-3 rounded-xl text-sm transition-colors">Publicar Reseña</button>
                </form>
              </div>
            </div>

            <div className="p-6 bg-slate-50 flex justify-between items-center border-t border-slate-100">
              <p className="text-xs text-slate-500 font-medium">Condición de pago: <span className="text-slate-700">{detalleHabitacion.hotel.politicas_pago}</span></p>
              <button onClick={() => { setHabitacionSeleccionada({hotelId: detalleHabitacion.hotel.id, hotelNombre: detalleHabitacion.hotel.nombre, hab: detalleHabitacion.hab, politicas_pago: detalleHabitacion.hotel.politicas_pago}); setDetalleHabitacion(null); }} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-8 rounded-xl shadow-md transition-all hover:shadow-lg">
                Reservar Fechas
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Modal Formalizar Reserva (Check-out) */}
      {habitacionSeleccionada && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-slate-800 text-white p-6 relative">
              <button onClick={() => setHabitacionSeleccionada(null)} className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors">✖</button>
              <h3 className="text-xl font-light tracking-wide mb-1">Completar Reserva</h3>
              <p className="text-indigo-300 text-sm font-medium">{habitacionSeleccionada.hotelNombre} • Habitación {habitacionSeleccionada.hab.tipo}</p>
            </div>
            
            <div className="p-8 overflow-y-auto flex-1">
              <form id="reservaForm" onSubmit={confirmarReserva} className="space-y-6">
                
                {/* Datos Personales */}
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">1. Datos del Huésped Principal</h4>
                  <div className="space-y-4">
                    <input type="text" required placeholder="Nombre Completo" className="w-full bg-slate-50 border-transparent focus:bg-white focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 rounded-xl px-4 py-3 text-sm outline-none transition-all" value={nombreCliente} onChange={(e) => setNombreCliente(e.target.value)} />
                    <div className="grid grid-cols-2 gap-4">
                      <input type="tel" required placeholder="Teléfono" className="w-full bg-slate-50 border-transparent focus:bg-white focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 rounded-xl px-4 py-3 text-sm outline-none transition-all" value={telefonoCliente} onChange={(e) => setTelefonoCliente(e.target.value)} />
                      <input type="email" required placeholder="Correo Electrónico" className="w-full bg-slate-50 border-transparent focus:bg-white focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 rounded-xl px-4 py-3 text-sm outline-none transition-all" value={correoCliente} onChange={(e) => setCorreoCliente(e.target.value)} />
                    </div>
                    <input type="text" required placeholder="Dirección de Residencia" className="w-full bg-slate-50 border-transparent focus:bg-white focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 rounded-xl px-4 py-3 text-sm outline-none transition-all" value={direccionCliente} onChange={(e) => setDireccionCliente(e.target.value)} />
                  </div>
                </div>

                {/* Detalles de la Estancia */}
                <div className="pt-6 border-t border-slate-100">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">2. Detalles de la Estancia</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-3 md:col-span-1">
                      <label className="block text-xs text-slate-500 mb-1 ml-1">Fecha Llegada</label>
                      <input type="date" required className="w-full bg-slate-50 border-transparent focus:bg-white focus:border-indigo-300 rounded-xl px-4 py-3 text-sm outline-none transition-all text-slate-700" value={fechaLlegada} onChange={(e) => setFechaLlegada(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1 ml-1">Noches</label>
                      <input type="number" min="1" required className="w-full bg-slate-50 border-transparent focus:bg-white focus:border-indigo-300 rounded-xl px-4 py-3 text-sm outline-none transition-all text-center" value={noches} onChange={(e) => setNoches(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1 ml-1">Personas</label>
                      <input type="number" min="1" max={habitacionSeleccionada.hab.capacidad_maxima} required className="w-full bg-slate-50 border-transparent focus:bg-white focus:border-indigo-300 rounded-xl px-4 py-3 text-sm outline-none transition-all text-center" value={personas} onChange={(e) => setPersonas(e.target.value)} />
                    </div>
                  </div>
                </div>

                {errorCotizacion && (
                  <div className="bg-red-50 text-red-600 border border-red-100 p-3 rounded-xl text-sm font-medium text-center">
                    {errorCotizacion}
                  </div>
                )}
              </form>
            </div>

            {/* Panel Inferior: Resumen y Pago */}
            <div className="bg-slate-50 border-t border-slate-200 p-6">
              <div className="flex justify-between items-end mb-4">
                <div>
                  <p className="text-sm text-slate-500 font-medium mb-1">Total a pagar</p>
                  {temporadaDetectada && <span className="inline-block text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded">Temp. {temporadaDetectada}</span>}
                </div>
                <div className="text-right">
                  <p className="text-3xl font-light text-slate-800">${totalCalculado > 0 ? totalCalculado.toFixed(2) : (habitacionSeleccionada.hab.precio_base * noches).toFixed(2)}</p>
                </div>
              </div>
              
              <div className={`mb-6 p-3 rounded-xl text-xs flex gap-2 items-start ${habitacionSeleccionada.politicas_pago === 'Pago al llegar' ? 'bg-amber-50 text-amber-800 border border-amber-100' : 'bg-emerald-50 text-emerald-800 border border-emerald-100'}`}>
                <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <p><b>Condición:</b> {habitacionSeleccionada.politicas_pago}. {habitacionSeleccionada.politicas_pago === 'Pago al llegar' ? "Tu tarjeta se usará solo como garantía." : "Se realizará el cargo completo inmediatamente."}</p>
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setHabitacionSeleccionada(null)} className="flex-1 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium py-3 rounded-xl transition-colors">Cancelar</button>
                <button type="submit" form="reservaForm" disabled={procesandoPago || errorCotizacion} className="flex-[2] bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-xl shadow-md transition-all disabled:opacity-50">
                  {procesandoPago ? 'Procesando segura...' : (habitacionSeleccionada.politicas_pago === 'Pago al llegar' ? 'Confirmar Reserva' : 'Pagar Ahora')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Modal R16: Voucher Ticket Final */}
      {reservaConfirmada && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-fade-in-up relative">
            
            <div className="bg-indigo-600 text-white p-8 text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              </div>
              <h3 className="text-2xl font-light tracking-wide">Reserva Confirmada</h3>
              <p className="text-indigo-200 text-sm mt-1">¡Todo listo para tu viaje!</p>
            </div>
            
            <div className="p-8 relative bg-white">
              {/* Efecto ticket de borde dentado usando un gradiente radial sutil */}
              <div className="absolute top-0 left-0 w-full h-3 bg-[radial-gradient(circle,transparent_4px,#ffffff_5px)] bg-[length:12px_12px] -mt-1.5"></div>

              <div className="text-center mb-6">
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">Localizador</p>
                <p className="text-3xl font-mono font-bold text-slate-800 tracking-wider">#{reservaConfirmada.id.toString().padStart(5, '0')}</p>
              </div>

              <div className="space-y-4 text-sm text-slate-600 border-t border-dashed border-slate-200 pt-6">
                <div className="flex justify-between">
                  <span className="text-slate-400">Titular</span>
                  <span className="font-semibold text-slate-800">{reservaConfirmada.cliente}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Destino</span>
                  <span className="font-semibold text-slate-800 text-right">{reservaConfirmada.hotel}<br/><span className="text-xs text-slate-500 font-normal">{reservaConfirmada.habitacion_tipo} (N° {reservaConfirmada.habitacion_numero})</span></span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Fechas</span>
                  <span className="font-semibold text-slate-800">{reservaConfirmada.fechas[0]} al {reservaConfirmada.fechas[reservaConfirmada.fechas.length - 1]}</span>
                </div>
                <div className="flex justify-between pt-4">
                  <span className="text-slate-400">Estado</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${reservaConfirmada.estado_pago.includes('Pendiente') ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    {reservaConfirmada.estado_pago}
                  </span>
                </div>
              </div>

              <div className="mt-8 bg-slate-50 p-4 rounded-xl flex justify-between items-center border border-slate-100">
                <span className="font-bold text-slate-400 uppercase text-xs tracking-wider">Importe Final</span>
                <span className="text-2xl font-light text-slate-800">${reservaConfirmada.monto_total}</span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100">
              <button onClick={() => setReservaConfirmada(null)} className="w-full bg-slate-800 hover:bg-slate-900 text-white font-medium py-3.5 rounded-xl transition-colors text-sm">
                Volver al inicio
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default Home;