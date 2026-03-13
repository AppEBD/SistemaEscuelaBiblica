import React, { useEffect, useState } from 'react';
import AdminView from '../admin/AdminView';
import MaestroView from '../maestro/MaestroView';
import { LogOut, ShieldCheck } from 'lucide-react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../config/firebase'; 

const Dashboard = () => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('ebd_v2_session') || '{}'));

  useEffect(() => {
    if (!user.id) return;
    const unsubscribe = onSnapshot(doc(db, 'users', user.id), (docSnap) => {
      if (!docSnap.exists()) {
        alert("Tu usuario ha sido eliminado del sistema.");
        localStorage.removeItem('ebd_v2_session');
        window.location.reload(); 
      } else {
        const freshData = docSnap.data();
        if (JSON.stringify(freshData) !== JSON.stringify(user)) {
          const updatedUser = { id: docSnap.id, ...freshData };
          setUser(updatedUser);
          localStorage.setItem('ebd_v2_session', JSON.stringify(updatedUser));
        }
      }
    });
    return () => unsubscribe();
  }, [user.id]);

  const renderView = () => {
    if (user.role === 'Administrador / Director') return <AdminView />;
    if (user.role === 'Maestro' || user.role === 'Auxiliar') return <MaestroView />;
    
    return (
      <div className="flex flex-col items-center justify-center p-10 w-full h-full text-center">
        <h2 className="text-2xl font-black text-slate-700 uppercase">¡Hola, {user.username}!</h2>
        <p className="text-slate-500 mt-2 font-medium">Estamos construyendo la interfaz de {user.role}.</p>
      </div>
    );
  };

  const isFemale = user.gender === 'Femenino';
  const logoColor = isFemale ? 'text-rose-600' : 'text-blue-700';
  const badgeColor = isFemale ? 'text-rose-500' : 'text-blue-500';

  const handleLogout = () => {
    // CORRECCIÓN: Usamos el bisturí en lugar de la excavadora
    localStorage.removeItem('ebd_v2_session');
    window.location.reload();
  };

  return (
    <div className="w-full min-h-screen flex flex-col bg-slate-50">
      
      <nav className="w-full bg-white border-b border-slate-200 px-6 py-4 flex justify-center shadow-sm z-10">
        <div className="w-full max-w-7xl flex justify-between items-center">
          <span className={`font-black tracking-widest uppercase text-lg md:text-xl transition-colors ${logoColor}`}>
            Iglesia Bitinia
          </span>
          <div className="flex items-center gap-3 md:gap-6">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-800 uppercase">{user.username}</p>
              <p className={`text-[10px] font-black uppercase tracking-wider flex items-center justify-end gap-1 ${badgeColor}`}>
                <ShieldCheck size={12} /> {user.role}
              </p>
            </div>
            <button onClick={handleLogout} className="p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all" title="Cerrar Sesión">
              <LogOut size={24}/>
            </button>
          </div>
        </div>
      </nav>

      <main className="w-full flex-1 p-4 md:p-8 lg:p-12 flex justify-center">
        <div className="w-full max-w-7xl">
          {renderView()}
        </div>
      </main>
      
    </div>
  );
};

export default Dashboard;
