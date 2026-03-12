import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '../features/auth/store/authStore';

export const AppRouter = () => {
  const { usuarioActual } = useAuthStore();

  return (
    <BrowserRouter>
      <Routes>
        {/* Si no hay usuario, lo mandamos al Login */}
        <Route path="/login" element={<div className="p-10 text-center">Pantalla de Login (En construcción)</div>} />
        
        {/* Ruta temporal para pruebas */}
        <Route path="/dashboard" element={<div className="p-10 text-center">Panel Principal (En construcción)</div>} />
        
        {/* Redirección por defecto */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
};
