import React from 'react';
import AdminView from '../admin/AdminView';
import MaestroView from '../maestro/MaestroView';
import { LogOut } from 'lucide-react';

// Componente simple para los que aún no tienen interfaz
const WorkInProgress = ({ role }: { role: string }) => (
  <div className="text-center p-10">
    <h2 className="text-xl font-bold text-slate-700">Interfaz de {role}</h2>
    <p className="text-slate-500">Estamos trabajando en tu nueva experiencia V2.0...</p>
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
    <div className="min-h-screen bg-slate-50">
      {/* Header Universal */}
      <nav className="bg-white border-b p-4 flex justify-between items-center shadow-sm">
        <span className="font-black text-blue-600 italic">IGLESIA BITINIA</span>
        <div className="flex items-center gap-4">
          <span className="text-xs font-bold text-slate-400 uppercase">{user.username} ({user.role})</span>
          <button onClick={() => {localStorage.clear(); window.location.reload();}} className="text-red-400"><LogOut size={20}/></button>
        </div>
      </nav>

      {/* Carga la vista correspondiente sin saturar este archivo */}
      <main className="p-4 md:p-8">
        {renderView()}
      </main>
    </div>
  );
};

export default Dashboard;
