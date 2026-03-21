import React from 'react';
import { useAuth } from '../modules/auth/application/useAuth';
import { LoginView } from '../modules/auth/presentation/LoginView';
import { AdminDashboard } from '../modules/admin/presentation/AdminDashboard';
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
          {/* El nombre y campo se actualizarán en vivo si el admin los edita */}
          <p>{userRole} • {userData?.campo || 'Sede Central'}</p>
        </div>
        <button onClick={logout} className="btn-logout">
          <i className="fas fa-sign-out-alt"></i> Salir
        </button>
      </header>

      <main className="app-main">
        {userRole === 'ADMIN' && <AdminDashboard />}
        
        {userRole !== 'ADMIN' && (
            <div style={{ background: 'white', padding: '30px', borderRadius: '20px', textAlign: 'center' }}>
                {/* El nombre se actualizará en vivo aquí también */}
                <h2>¡Bienvenido, {userData?.nombre}!</h2>
                <p>Tu cuenta está activa y sincronizada. Pronto conectaremos tu panel de trabajo.</p>
            </div>
        )}
      </main>
    </div>
  );
};

export default App;
