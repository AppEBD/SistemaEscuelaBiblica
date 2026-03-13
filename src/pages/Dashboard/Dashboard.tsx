import React, { useEffect, useState } from 'react';
import AdminView from '../admin/AdminView';
import MaestroView from '../maestro/MaestroView';
import { LogOut, ShieldCheck } from 'lucide-react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../config/firebase'; // Asegúrate de la ruta

const WorkInProgress = ({ role, username }: { role: string, username: string }) => (
  <div className="flex flex-col items-center justify-center p-10 w-full h-full text-center">
    <h2 className="text-2xl font-black text-slate-700 uppercase">¡Hola, {username}!</h2>
    <p className="text-slate-500 mt-2 font-medium">
      Estamos construyendo tus herramientas específicas para el área de <span className="font-bold text-blue-600 uppercase">{role}</span>.
    </p>
  </div>
);

const Dashboard = () => {
  // Estado inicial con lo que hay en localStorage
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('ebd_v2_session') || '{}'));

  useEffect(() => {
    if (!user.id) return;

    // EL RADAR: Escucha específicamente el documento de este usuario en Firebase
    const unsubscribe = onSnapshot(doc(db, 'users', user.id), (docSnap) => {
      if (!docSnap.exists()) {
        // SI EL ADMIN LO ELIMINÓ: Lo expulsamos en tiempo real
        alert("Tu usuario ha sido eliminado del sistema por el Administrador.");
        localStorage.removeItem('ebd_v2_session');
        window.location.reload(); // Esto lo manda de regreso al Login limpio
      } else {
        // SI EL ADMIN LO MODIFICÓ: Actualizamos sus datos en vivo
        const freshData = docSnap.data();
        
        // Solo actualizamos si hubo un cambio real para no ciclar
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
    switch (user.role) {
      case 'Administrador / Director': return <AdminView />;
      case 'Maestro': return <MaestroView />;
      default: return <WorkInProgress role={user.role} username={user.username} />;
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col bg-slate-50">
      
      {/* Barra de Navegación Centrada */}
      <nav className="w-full bg-white border-b border-slate-200 px-6 py-4 flex justify-center shadow-sm z-10">
        <div className="w-full max-w-7xl flex justify-between items-center">
          <span className="font-black text-blue-700 tracking-widest uppercase text-lg md:text-xl">
            Iglesia Bitinia
          </span>
          <div className="flex items-center gap-3 md:gap-6">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-800 uppercase">{user.username}</p>
              <p className="text-[10px] font-black text-blue-500 uppercase tracking-wider flex items-center justify-end gap-1">
                <ShieldCheck size={12} /> {user.role}
              </p>
            </div>
            <button 
              onClick={() => {localStorage.clear(); window.location.reload();}} 
              className="p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all"
              title="Cerrar Sesión"
            >
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
