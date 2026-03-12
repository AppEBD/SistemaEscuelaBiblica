import React, { useState, useEffect } from 'react';
import { UserCheck, UserX, ChevronDown, Users, Bell } from 'lucide-react';
// IMPORTA TU FIREBASE AQUÍ
import { collection, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../config/firebase'; // <--- Ajusta la ruta

const AdminView = () => {
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [openRole, setOpenRole] = useState<string | null>(null);

  useEffect(() => {
    // ESCUCHADOR EN TIEMPO REAL: Trae todos los usuarios de la colección
    const usersRef = collection(db, 'users');
    const unsubscribe = onSnapshot(usersRef, (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAllUsers(usersData);
    });

    return () => unsubscribe(); // Limpiar cuando se cierre el panel
  }, []);

  const handleAction = async (id: string, action: 'approved' | 'rejected') => {
    const userRef = doc(db, 'users', id);
    if (action === 'approved') {
      // Actualizamos a aprobado. El Login del maestro escuchará esto y lo dejará entrar.
      await updateDoc(userRef, { status: 'approved' });
    } else {
      // Si lo rechazamos, borramos el documento. El maestro verá "Acceso Denegado".
      await deleteDoc(userRef);
    }
  };

  const roles = ['Maestro', 'Auxiliar', 'Logística', 'Tesorero', 'Secretaria'];
  const pendingUsers = allUsers.filter(u => u.status === 'pending');

  return (
    <div className="w-full grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
      
      {/* Columna Izquierda: Solicitudes en Tiempo Real */}
      <section className="w-full flex flex-col gap-4">
        <div className="flex items-center justify-center md:justify-start gap-2 bg-amber-100 text-amber-800 p-4 rounded-2xl text-center">
          <Bell className="h-6 w-6 animate-bounce" />
          <h2 className="text-sm font-black uppercase tracking-widest">
            Nuevas Solicitudes ({pendingUsers.length})
          </h2>
        </div>
        
        {pendingUsers.length === 0 ? (
          <div className="w-full p-8 border-2 border-dashed border-slate-200 rounded-3xl text-center text-slate-400 font-bold">
            No hay solicitudes pendientes. Todo al día.
          </div>
        ) : (
          <div className="w-full flex flex-col gap-3">
            {pendingUsers.map(u => (
              <div key={u.id} className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4 w-full transition-all hover:shadow-md text-center sm:text-left">
                <div className="w-full">
                  <p className="font-black text-lg text-slate-800">{u.username}</p>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{u.role} • {u.gender}</p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto justify-center">
                  <button onClick={() => handleAction(u.id, 'rejected')} className="w-full sm:w-auto px-6 py-3 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 flex items-center justify-center gap-2 transition-colors">
                    <UserX size={18}/> Denegar
                  </button>
                  <button onClick={() => handleAction(u.id, 'approved')} className="w-full sm:w-auto px-6 py-3 bg-green-50 text-green-600 font-bold rounded-xl hover:bg-green-100 flex items-center justify-center gap-2 transition-colors">
                    <UserCheck size={18}/> Permitir
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Columna Derecha: Directorio Expandido */}
      <section className="w-full bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden text-center sm:text-left">
        <div className="p-6 bg-slate-800 text-white flex items-center justify-center sm:justify-start gap-3 w-full">
          <Users size={24} className="text-blue-400" /> 
          <h2 className="font-black text-lg tracking-widest uppercase">Directorio en Vivo</h2>
        </div>
        
        <div className="w-full flex flex-col">
          {roles.map(r => {
            const approvedCount = allUsers.filter(u => u.role === r && u.status === 'approved').length;
            return (
              <div key={r} className="w-full border-b border-slate-100 last:border-0">
                <button 
                  onClick={() => setOpenRole(openRole === r ? null : r)} 
                  className="w-full p-6 flex justify-between items-center hover:bg-slate-50 transition-colors"
                >
                  <span className="font-bold text-slate-700 text-lg">{r}s</span>
                  <div className="flex items-center gap-4 text-slate-400">
                    <span className="bg-slate-100 px-3 py-1 rounded-lg text-xs font-black text-slate-500">{approvedCount} registrados</span>
                    <ChevronDown className={`transition-transform ${openRole === r ? 'rotate-180' : ''}`} />
                  </div>
                </button>
                
                {openRole === r && (
                  <div className="bg-slate-50 p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                    {approvedCount > 0 ? (
                      allUsers.filter(u => u.role === r && u.status === 'approved').map(u => (
                        <div key={u.id} className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center sm:items-start text-center sm:text-left">
                          <span className="font-black text-slate-800">{u.username}</span>
                          <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">{u.gender} • Nacimiento: {u.birthDate}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-slate-400 italic col-span-1 sm:col-span-2 text-center py-4">No hay personal registrado.</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
};

export default AdminView;
