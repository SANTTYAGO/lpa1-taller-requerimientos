import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function Admin() {
  const [hoteles, setHoteles] = useState([]);
  const [nuevoHotel, setNuevoHotel] = useState({
    nombre: '', direccion: '', telefono: '', correo: '', ubicacion: '', servicios: ''
  });

  const cargarHoteles = () => {
    fetch('http://127.0.0.1:5000/api/hoteles')
      .then(r => r.json())
      .then(datos => setHoteles(datos))
      .catch(err => console.error("Error cargando hoteles", err));
  };

  useEffect(() => {
    cargarHoteles();
  }, []);

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
    } catch (error) {
      alert("Error conectando con el servidor.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800">
      {/* BARRA DE NAVEGACIÓN ADMIN */}
      <nav className="bg-slate-900 text-white p-4 shadow-md flex justify-between items-center">
        <h1 className="text-2xl font-bold">⚙️ Panel de Administración LPA1</h1>
        <Link to="/" className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded transition-colors text-sm font-bold">
          Ver vista de Clientes
        </Link>
      </nav>

      <div className="max-w-6xl mx-auto py-8 px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLUMNA IZQUIERDA: FORMULARIO */}
        <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-md h-fit">
          <h2 className="text-xl font-bold mb-4 border-b pb-2">Registrar Nuevo Hotel</h2>
          <form onSubmit={registrarNuevoHotel} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nombre del Hotel</label>
              <input type="text" required className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-slate-500" value={nuevoHotel.nombre} onChange={e => setNuevoHotel({...nuevoHotel, nombre: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Ubicación</label>
              <input type="text" required className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-slate-500" value={nuevoHotel.ubicacion} onChange={e => setNuevoHotel({...nuevoHotel, ubicacion: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium mb-1">Teléfono</label>
                <input type="text" required className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-slate-500" value={nuevoHotel.telefono} onChange={e => setNuevoHotel({...nuevoHotel, telefono: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Correo</label>
                <input type="email" required className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-slate-500" value={nuevoHotel.correo} onChange={e => setNuevoHotel({...nuevoHotel, correo: e.target.value})} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Dirección</label>
              <input type="text" required className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-slate-500" value={nuevoHotel.direccion} onChange={e => setNuevoHotel({...nuevoHotel, direccion: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Servicios (separados por coma)</label>
              <input type="text" className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-slate-500" placeholder="Ej: Piscina, Wifi..." value={nuevoHotel.servicios} onChange={e => setNuevoHotel({...nuevoHotel, servicios: e.target.value})} />
            </div>
            <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-lg mt-4 transition-colors">
              Guardar Hotel
            </button>
          </form>
        </div>

        {/* COLUMNA DERECHA: LISTA DE HOTELES */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-bold mb-4">Hoteles en el Sistema ({hoteles.length})</h2>
          <div className="space-y-4">
            {hoteles.map(hotel => (
              <div key={hotel.id} className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-lg">{hotel.nombre} <span className="text-sm font-normal text-slate-500">📍 {hotel.ubicacion}</span></h3>
                  <p className="text-sm text-slate-600">Habitaciones registradas: {hotel.habitaciones.length}</p>
                </div>
                {/* Aquí en el futuro agregaremos botones para editar, agregar promociones (R2) o cambiar estado (R4) */}
                <button className="bg-slate-100 text-slate-600 px-3 py-1 rounded text-sm font-bold hover:bg-slate-200">
                  Gestionar
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

export default Admin;