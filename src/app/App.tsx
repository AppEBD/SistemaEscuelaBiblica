import React from 'react';
import { useAuth } from '../modules/auth/application/useAuth';
import { LoginView } from '../modules/auth/presentation/LoginView';
import { AdminDashboard } from '../modules/admin/presentation/AdminDashboard';
// Importamos la nueva vista de los alumnos
import { StudentsView } from '../modules/students/presentation/StudentsView';
import './App.css';

const App: React.FC = () => {
  const { userRole, userData, logout } = useAuth();

  // Si no hay sesión, mostramos el Login
  if (!userRole) {
    return <LoginView />;
  }

  // Si hay sesión, mostramos la App principal
  return (
    <div>
      <header className="app-header">
        <div className="app-header-info">
          <h1>EBD v2.0</h1>
          <p>{userRole} • {userData?.campo || 'Sede Central'}</p>
        </div>
        <button onClick={logout} className="btn-logout">
          <i className="fas fa-sign-out-alt"></i> Salir
        </button>
      </header>

      <main className="app-main">
        {/* Vista para el Director */}
        {userRole === 'ADMIN' && <AdminDashboard />}
        
        {/* Vista para Maestros y Auxiliares */}
        {(userRole === 'MAESTRO' || userRole === 'AUXILIAR') && <StudentsView />}
        
        {/* Placeholder para los demás roles */}
        {(userRole === 'LOGISTICA' || userRole === 'SECRETARIA' || userRole === 'TESORERO') && (
            <div style={{ background: 'white', padding: '30px', borderRadius: '20px', textAlign: 'center' }}>
                <h2>¡Bienvenido, {userData?.nombre}!</h2>
                <p>Tu panel de {userRole.toLowerCase()} está en construcción.</p>
            </div>
        )}
      </main>
    </div>
  );
};

export default App;
