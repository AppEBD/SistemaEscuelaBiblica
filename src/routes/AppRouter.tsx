import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '../features/auth/store/authStore';
import Login from '../pages/auth/Login';

export const AppRouter = () => {
  const { usuarioActual } = useAuthStore();

  return (
    <BrowserRouter>
      <Routes>
        {/* Si el usuario ya está logueado, lo sacamos del login */}
        <Route 
          path="/login" 
          element={usuarioActual ? <Navigate to="/dashboard" /> : <Login />} 
        />
        
        {/* Rutas placeholder (Las verdaderas las haremos después) */}
        <Route path="/admin" element={<div className="p-10 text-center font-bold">🛠️ Panel del Director (Próximamente)</div>} />
        <Route path="/maestro" element={<div className="p-10 text-center font-bold">🍎 Panel del Maestro (Próximamente)</div>} />
        <Route path="/secretaria" element={<div className="p-10 text-center font-bold">📝 Panel de Secretaría (Próximamente)</div>} />
        <Route path="/tesorero" element={<div className="p-10 text-center font-bold">💰 Panel de Tesorería (Próximamente)</div>} />
        <Route path="/logistica" element={<div className="p-10 text-center font-bold">📦 Panel de Logística (Próximamente)</div>} />
        
        {/* Ruta genérica */}
        <Route path="/dashboard" element={<div className="p-10 text-center font-bold">Panel Principal (Cargando perfil...)</div>} />

        {/* Si escriben una URL rara, los mandamos al login por defecto */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
};
