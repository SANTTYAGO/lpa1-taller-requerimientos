import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function Admin() {
  const [hoteles, setHoteles] = useState([]);
  const [nuevoHotel, setNuevoHotel] = useState({ nombre: '', direccion: '', telefono: '', correo: '', ubicacion: '', servicios: '' });
  
  // Estado para saber qué hotel estamos gestionando (R2)
  const [hotelGestion, setHotelGestion] = useState(null);
  const [nuevaPromocion, setNuevaPromocion] = useState({ nombre: '', descuento: '', temporada: '' });
  const [nuevoServicio, setNuevoServicio] = useState('');

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
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="font-bold text-lg text-indigo-700">{hotel.nombre} <span className="text-sm font-normal text-slate-500">📍 {hotel.ubicacion}</span></h3>
                  </div>
                  {/* BOTÓN MÁGICO QUE ABRE EL MODAL R2 */}
                  <button onClick={() => setHotelGestion(hotel)} className="bg-indigo-600 text-white px-4 py-2 rounded text-sm font-bold hover:bg-indigo-700 shadow-md">
                    Gestionar Promociones / Servicios
                  </button>
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
    </div>
  );
}

export default Admin;