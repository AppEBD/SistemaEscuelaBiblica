import React from 'react';
import { useAuth } from '../modules/auth/application/useAuth';
import { LoginView } from '../modules/auth/presentation/LoginView';
import { AdminDashboard } from '../modules/admin/presentation/AdminDashboard';
import { StudentsView } from '../modules/students/presentation/StudentsView';
import './App.css';

const App: React.FC = () => {
  const { userRole, userData, logout } = useAuth();

  // Si no hay sesión, mostramos el Login
  if (!userRole) {
    return <LoginView />;
  }

  // Verificamos si es Maestro o Auxiliar para aplicar el diseño nuevo
  const esMaestroOAuxiliar = userRole === 'MAESTRO' || userRole === 'AUXILIAR';

  return (
    <div>
      {/* Ocultamos el encabezado antiguo SÓLO para Maestros y Auxiliares.
        Ellos ya tienen el nuevo encabezado global y su menú de perfil.
        Próximamente, cuando actualicemos al Admin, quitaremos esto por completo.
      */}
      {!esMaestroOAuxiliar && (
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

      {/* Si es maestro, le quitamos la clase 'app-main' para que su diseño ocupe toda la pantalla */}
      <main className={esMaestroOAuxiliar ? '' : 'app-main'}>
        
        {/* Vista para el Director */}
        {userRole === 'ADMIN' && <AdminDashboard />}
        
        {/* Vista para Maestros y Auxiliares (Con su nuevo diseño integrado) */}
        {esMaestroOAuxiliar && <StudentsView />}
        
        {/* Placeholder para los demás roles */}
        {(userRole === 'LOGISTICA' || userRole === 'SECRETARIA' || userRole === 'TESORERO') && (
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
