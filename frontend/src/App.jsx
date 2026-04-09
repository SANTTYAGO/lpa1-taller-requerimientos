import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Admin from './pages/Admin';

function App() {
  return (
    <Router>
      <Routes>
        {/* Ruta para los clientes */}
        <Route path="/" element={<Home />} />
        
        {/* Ruta exclusiva para Luciana, Felipe y administradores */}
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </Router>
  );
}

export default App;