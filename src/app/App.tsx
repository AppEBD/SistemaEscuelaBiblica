import React from 'react';
import { useAuth } from './modules/auth/application/useAuth';
import { LoginView } from './modules/auth/presentation/LoginView';
// Importaremos los otros dashboards conforme los vayamos creando
// import { DashboardView } from './modules/shared/presentation/DashboardView';

const App: React.FC = () => {
  const { userRole, userData, logout } = useAuth();

  // Si no hay usuario, mostramos el login que ya es responsive
  if (!userRole) {
    return <LoginView />;
  }

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Container Responsive: max-w-7xl en escritorio, full en móvil */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header Adaptable */}
        <header className="flex flex-col sm:flex-row justify-between items-center py-6 gap-4 border-b border-slate-200">
          <div className="text-center sm:text-left">
            <h1 className="text-2xl font-black text-slate-800">Panel de Control</h1>
            <p className="text-sm text-slate-500 font-medium">
              Hola, {userData?.nombre || 'Usuario'} | {userRole}
            </p>
          </div>
          
          <button 
            onClick={logout}
            className="w-full sm:w-auto px-6 py-2 bg-white border border-rose-200 text-rose-500 font-bold rounded-xl shadow-sm hover:bg-rose-50 transition-all"
          >
            <i className="fas fa-sign-out-alt mr-2"></i> Cerrar Sesión
          </button>
        </header>

        {/* Zona de Contenido Principal Adaptable */}
        <main className="py-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Aquí se renderizarán los módulos de la V2.0 */}
            <div className="p-6 bg-white rounded-3xl shadow-sm border border-slate-100">
                <h3 className="font-bold">Módulo Cargado</h3>
                <p className="text-sm text-slate-400">Bienvenido al sistema responsive de la Escuela Bíblica.</p>
            </div>
          </div>
        </main>

      </div>
    </div>
  );
};

export default App;
