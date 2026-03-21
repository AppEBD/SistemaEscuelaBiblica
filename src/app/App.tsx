import React from 'react';
import { useAuth } from '../modules/auth/application/useAuth';
import { LoginView } from '../modules/auth/presentation/LoginView';

const App: React.FC = () => {
  const { userRole, userData, logout } = useAuth();

  if (!userRole) {
    return <LoginView />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 p-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl font-black text-indigo-600">EBD v2.0</h1>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
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

      <main className="p-4 md:p-8 max-w-7xl mx-auto">
        <div className="bg-white p-6 md:p-8 rounded-[32px] shadow-sm border border-slate-100">
          <h2 className="font-black text-2xl text-slate-800">¡Bienvenido, {userData?.nombre || 'Director'}!</h2>
          <p className="text-sm text-slate-500 mt-2">Pronto conectaremos aquí tu panel de {userRole.toLowerCase()}.</p>
        </div>
      </main>
    </div>
  );
};

export default App;
