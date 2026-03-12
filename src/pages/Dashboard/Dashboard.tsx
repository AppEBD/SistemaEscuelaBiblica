import React from 'react';
import AdminView from '../admin/AdminView';
import MaestroView from '../maestro/MaestroView';
import { LogOut } from 'lucide-react';

const WorkInProgress = ({ role }: { role: string }) => (
  <div className="flex flex-col items-center justify-center text-center p-10 w-full">
    <h2 className="text-2xl font-black text-slate-700 uppercase tracking-tight">Interfaz de {role}</h2>
    <p className="text-slate-500 mt-2 font-medium">Estamos trabajando en tu nueva experiencia V2.0...</p>
  </div>
);

const Dashboard = () => {
  const user = JSON.parse(localStorage.getItem('ebd_v2_session') || '{}');

  const renderView = () => {
    switch (user.role) {
      case 'Administrador / Director': return <AdminView />;
      case 'Maestro': return <MaestroView />;
      default: return <WorkInProgress role={user.role} />;
    }
  };

  return (
    <div className="w-full flex flex-col min-h-screen">
      
      {/* Navbar Centrado (Contenido) */}
      <nav className="bg-white border-b shadow-sm w-full flex justify-center">
        <div className="w-full max-w-7xl p-4 flex justify-between items-center">
          <span className="font-black text-blue-600 italic tracking-widest uppercase">Iglesia Bitinia</span>
          <div className="flex items-center gap-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{user.username} ({user.role})</span>
            <button onClick={() => {localStorage.clear(); window.location.reload();}} className="text-slate-400 hover:text-red-500 transition-colors">
              <LogOut size={20}/>
            </button>
          </div>
        </div>
      </nav>

      {/* Contenido Principal Centrado */}
      <main className="flex-1 w-full flex justify-center items-start p-4 md:p-8">
        <div className="w-full max-w-7xl flex flex-col items-center">
          {renderView()}
        </div>
      </main>
      
    </div>
  );
};

export default Dashboard;
