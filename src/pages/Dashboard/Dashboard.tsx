import React from 'react';
import AdminView from '../admin/AdminView';
import MaestroView from '../maestro/MaestroView';
import { LogOut } from 'lucide-react';

const WorkInProgress = ({ role }: { role: string }) => (
  <div className="flex flex-col items-center justify-center p-10 w-full h-full">
    <h2 className="text-2xl font-black text-slate-700 uppercase">Interfaz de {role}</h2>
    <p className="text-slate-500 mt-2">Estamos trabajando en tu experiencia V2.0...</p>
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
    <div className="w-full min-h-screen flex flex-col bg-slate-50">
      
      {/* Barra de Navegación 100% Ancho */}
      <nav className="w-full bg-white border-b border-slate-200 px-6 md:px-12 py-4 flex justify-between items-center shadow-sm z-10">
        <span className="font-black text-blue-700 tracking-widest uppercase text-lg md:text-xl">
          Iglesia Bitinia
        </span>
        <div className="flex items-center gap-3 md:gap-6">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-800">{user.username}</p>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{user.role}</p>
          </div>
          <button 
            onClick={() => {localStorage.clear(); window.location.reload();}} 
            className="p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all"
            title="Cerrar Sesión"
          >
            <LogOut size={24}/>
          </button>
        </div>
      </nav>

      {/* Contenedor de la Vista (Se estira según la pantalla) */}
      <main className="w-full flex-1 p-4 md:p-8 lg:p-12">
        <div className="w-full h-full mx-auto">
          {renderView()}
        </div>
      </main>
      
    </div>
  );
};

export default Dashboard;
