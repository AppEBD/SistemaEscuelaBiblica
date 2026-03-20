import React from 'react';
import { useAuth } from './modules/auth/application/useAuth';
import { LoginView } from './modules/auth/presentation/LoginView';

const App: React.FC = () => {
  const { userRole, userData, logout } = useAuth();

  // Si no ha iniciado sesión, mostramos el Login
  if (!userRole) {
    return <LoginView />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* HEADER RESPONSIVE */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl font-black text-indigo-600">EBD v2.0</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {userRole} • {userData?.campo || 'Sede Central'}
            </p>
          </div>
          <button 
            onClick={logout}
            className="w-10 h-10 flex items-center justify-center bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all"
          >
            <i className="fas fa-sign-out-alt"></i>
          </button>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL RESPONSIVE */}
      <main className="p-4 md:p-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Aquí inyectaremos los Dashboards según el rol */}
          <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100">
            <h2 className="font-black text-slate-800">Bienvenido, {userData?.nombre}</h2>
            <p className="text-sm text-slate-500 mt-2">El sistema se ha adaptado a tu dispositivo.</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
