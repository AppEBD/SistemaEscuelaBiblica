import React from 'react';
import { useAuth } from '../modules/auth/application/useAuth';
import { LoginView } from '../modules/auth/presentation/LoginView';
import { AdminDashboard } from '../modules/admin/presentation/AdminDashboard';
import { StudentsView } from '../modules/students/presentation/StudentsView';
import { SecretariaDashboard } from '../modules/finance/presentation/SecretariaDashboard'; // Importamos la nueva vista
import './App.css';

const App: React.FC = () => {
  const { userRole, userData, logout } = useAuth();

  // Si no hay sesión, mostramos el Login
  if (!userRole) {
    return <LoginView />;
  }

  // Verificamos quiénes tienen ya su diseño finalizado
  const usaNuevoDiseno = userRole === 'MAESTRO' || userRole === 'AUXILIAR' || userRole === 'SECRETARIA';

  return (
    <div>
      {/* Ocultamos el encabezado antiguo para los que ya tienen su menú nuevo */}
      {!usaNuevoDiseno && (
        <header className="app-header">
          <div className="app-header-info">
            <h1>EBD v2.0</h1>
            <p>{userRole} • {userData?.campo || 'Sede Central'}</p>
          </div>
          <button onClick={logout} className="btn-logout">
            <i className="fas fa-sign-out-alt"></i> Salir
          </button>
        </header>
      )}

      {/* Si usan nuevo diseño, ocupan toda la pantalla */}
      <main className={usaNuevoDiseno ? '' : 'app-main'}>
        
        {userRole === 'ADMIN' && <AdminDashboard />}
        {(userRole === 'MAESTRO' || userRole === 'AUXILIAR') && <StudentsView />}
        {userRole === 'SECRETARIA' && <SecretariaDashboard />}
        
        {/* Placeholder para Logística y Tesorero que aún están pendientes */}
        {(userRole === 'LOGISTICA' || userRole === 'TESORERO') && (
            <div style={{ background: 'white', padding: '30px', borderRadius: '20px', textAlign: 'center', marginTop: '20px' }}>
                <h2>¡Bienvenido, {userData?.nombre}!</h2>
                <p>Tu panel de {userRole.toLowerCase()} está en construcción.</p>
            </div>
        )}
      </main>
    </div>
  );
};

export default App;
