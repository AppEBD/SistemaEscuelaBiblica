import React, { useState, useEffect } from 'react';
import { UserCheck, UserX, ChevronDown, Users } from 'lucide-react';

const AdminView = () => {
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [openRole, setOpenRole] = useState<string | null>(null);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('ebd_global_users') || '[]');
    setAllUsers(data);
  }, []);

  const handleAction = (id: string, action: 'approved' | 'rejected') => {
    const updated = allUsers.map(u => u.id === id ? { ...u, status: action } : u);
    const filtered = action === 'rejected' ? updated.filter(u => u.id !== id) : updated;
    localStorage.setItem('ebd_global_users', JSON.stringify(filtered));
    setAllUsers(filtered);
  };

  const roles = ['Maestro', 'Auxiliar', 'Logística', 'Tesorero', 'Secretaria'];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Solicitudes Pendientes */}
      <section className="space-y-3">
        <h2 className="text-sm font-black text-amber-600 uppercase tracking-widest">Solicitudes Entrantes</h2>
        {allUsers.filter(u => u.status === 'pending').map(u => (
          <div key={u.id} className="bg-white p-4 rounded-2xl shadow-sm border flex justify-between items-center">
            <div>
              <p className="font-bold">{u.username}</p>
              <p className="text-xs text-slate-400">{u.role} • {u.gender}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleAction(u.id, 'rejected')} className="p-2 bg-red-50 text-red-500 rounded-lg"><UserX /></button>
              <button onClick={() => handleAction(u.id, 'approved')} className="p-2 bg-green-50 text-green-500 rounded-lg"><UserCheck /></button>
            </div>
          </div>
        ))}
      </section>

      {/* Directorio Desplegable */}
      <section className="bg-white rounded-[2rem] shadow-sm border overflow-hidden">
        <div className="p-6 bg-slate-800 text-white flex items-center gap-2">
          <Users size={20} /> <h2 className="font-bold">DIRECTORIO GENERAL</h2>
        </div>
        {roles.map(r => (
          <div key={r} className="border-b last:border-0">
            <button onClick={() => setOpenRole(openRole === r ? null : r)} className="w-full p-4 flex justify-between font-bold text-slate-600">
              {r}s ({allUsers.filter(u => u.role === r && u.status === 'approved').length})
              <ChevronDown />
            </button>
            {openRole === r && (
              <div className="bg-slate-50 p-4 grid gap-2">
                {allUsers.filter(u => u.role === r && u.status === 'approved').map(u => (
                  <div key={u.id} className="p-3 bg-white rounded-xl border text-sm flex justify-between">
                    <span>{u.username}</span>
                    <span className="text-slate-400 italic text-[10px] uppercase">{u.birthDate}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </section>
    </div>
  );
};

export default AdminView;
