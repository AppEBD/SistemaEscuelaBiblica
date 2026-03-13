import React, { useState, useEffect } from 'react';
import { UserCheck, UserX, ChevronDown, Users, Bell, Trash2, Edit, Save, X } from 'lucide-react';
import { collection, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';

const AdminView = () => {
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [openRole, setOpenRole] = useState<string | null>(null);
  
  // Estado para controlar el modal de edición
  const [editingUser, setEditingUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
      setAllUsers(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsubscribe();
  }, []);

  const handleAction = async (id: string, action: 'approved' | 'rejected') => {
    const userRef = doc(db, 'users', id);
    if (action === 'approved') await updateDoc(userRef, { status: 'approved' });
    else await deleteDoc(userRef);
  };

  const handleDeleteUser = async (id: string, name: string) => {
    if (window.confirm(`¿Estás seguro de ELIMINAR a ${name}? Esto cerrará su sesión de inmediato.`)) {
      await deleteDoc(doc(db, 'users', id));
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userRef = doc(db, 'users', editingUser.id);
      await updateDoc(userRef, {
        username: editingUser.username,
        gender: editingUser.gender,
        role: editingUser.role,
        // Actualizamos también la fecha consolidada
        birthDate: `${editingUser.day}/${editingUser.month}/${editingUser.year}`,
        day: editingUser.day,
        month: editingUser.month,
        year: editingUser.year
      });
      setEditingUser(null); // Cerrar el modal
      alert("Usuario actualizado con éxito.");
    } catch (error) {
      alert("Error al actualizar. Revisa tu conexión.");
    }
  };

  const roles = ['Maestro', 'Auxiliar', 'Logística', 'Tesorero', 'Secretaria'];
  const pendingUsers = allUsers.filter(u => u.status === 'pending');

  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  const years = Array.from({ length: 80 }, (_, i) => new Date().getFullYear() - 10 - i);

  return (
    <div className="w-full grid grid-cols-1 xl:grid-cols-2 gap-8 items-start relative">
      
      {/* --- MODAL DE EDICIÓN --- */}
      {editingUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <form onSubmit={handleSaveEdit} className="bg-white p-8 rounded-[2rem] shadow-2xl w-full max-w-md flex flex-col gap-4 relative">
            <button type="button" onClick={() => setEditingUser(null)} className="absolute top-6 right-6 text-slate-400 hover:text-red-500"><X size={24}/></button>
            <h3 className="text-xl font-black text-slate-800 uppercase">Editar Usuario</h3>
            
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase">Nombre</label>
              <input className="w-full p-3 border rounded-xl bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none" value={editingUser.username} onChange={e => setEditingUser({...editingUser, username: e.target.value})} required />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase">Cargo</label>
              <select className="w-full p-3 border rounded-xl bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none" value={editingUser.role} onChange={e => setEditingUser({...editingUser, role: e.target.value})} required>
                {roles.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase">Nacimiento</label>
              <div className="grid grid-cols-3 gap-2">
                <select className="p-3 border rounded-xl bg-slate-50" value={editingUser.day} onChange={e => setEditingUser({...editingUser, day: e.target.value})}><option value="">Día</option>{days.map(d=><option key={d}>{d}</option>)}</select>
                <select className="p-3 border rounded-xl bg-slate-50" value={editingUser.month} onChange={e => setEditingUser({...editingUser, month: e.target.value})}><option value="">Mes</option>{months.map(m=><option key={m}>{m}</option>)}</select>
                <select className="p-3 border rounded-xl bg-slate-50" value={editingUser.year} onChange={e => setEditingUser({...editingUser, year: e.target.value})}><option value="">Año</option>{years.map(y=><option key={y}>{y}</option>)}</select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase">Género</label>
              <select className="w-full p-3 border rounded-xl bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none" value={editingUser.gender} onChange={e => setEditingUser({...editingUser, gender: e.target.value})} required>
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
              </select>
            </div>

            <button type="submit" className="w-full py-4 mt-2 bg-blue-600 text-white font-black uppercase rounded-xl hover:bg-blue-700 flex items-center justify-center gap-2">
              <Save size={20}/> Guardar Cambios
            </button>
          </form>
        </div>
      )}
      {/* --- FIN MODAL --- */}

      <section className="w-full flex flex-col gap-4">
        <div className="flex items-center justify-center md:justify-start gap-2 bg-amber-100 text-amber-800 p-4 rounded-2xl">
          <Bell className="h-6 w-6 animate-bounce" />
          <h2 className="text-sm font-black uppercase tracking-widest">Solicitudes Entrantes ({pendingUsers.length})</h2>
        </div>
        
        {pendingUsers.length === 0 ? (
          <div className="w-full p-8 border-2 border-dashed border-slate-200 rounded-3xl text-center text-slate-400 font-bold">Sin solicitudes pendientes.</div>
        ) : (
          <div className="w-full flex flex-col gap-3">
            {pendingUsers.map(u => (
              <div key={u.id} className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-center sm:text-left">
                  <p className="font-black text-lg text-slate-800">{u.username}</p>
                  <p className="text-xs text-slate-500 font-bold uppercase">{u.role} • {u.gender}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleAction(u.id, 'rejected')} className="px-4 py-2 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100"><UserX size={20}/></button>
                  <button onClick={() => handleAction(u.id, 'approved')} className="px-4 py-2 bg-green-50 text-green-600 font-bold rounded-xl hover:bg-green-100"><UserCheck size={20}/></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="w-full bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 bg-slate-800 text-white flex justify-center sm:justify-start gap-3">
          <Users size={24} className="text-blue-400" /> 
          <h2 className="font-black text-lg tracking-widest uppercase">Directorio en Vivo</h2>
        </div>
        
        <div className="w-full flex flex-col">
          {roles.map(r => {
            const approvedUsers = allUsers.filter(u => u.role === r && u.status === 'approved');
            return (
              <div key={r} className="w-full border-b border-slate-100 last:border-0">
                <button onClick={() => setOpenRole(openRole === r ? null : r)} className="w-full p-6 flex justify-between items-center hover:bg-slate-50 transition-colors">
                  <span className="font-bold text-slate-700 text-lg">{r}s</span>
                  <div className="flex items-center gap-4 text-slate-400">
                    <span className="bg-slate-100 px-3 py-1 rounded-lg text-xs font-black text-slate-500">{approvedUsers.length} registrados</span>
                    <ChevronDown className={`transition-transform ${openRole === r ? 'rotate-180' : ''}`} />
                  </div>
                </button>
                
                {openRole === r && (
                  <div className="bg-slate-50 p-6 flex flex-col gap-3 w-full">
                    {approvedUsers.length > 0 ? (
                      approvedUsers.map(u => (
                        <div key={u.id} className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4 transition-all hover:border-blue-300">
                          <div className="text-center sm:text-left w-full">
                            <span className="font-black text-slate-800 text-lg">{u.username}</span>
                            <div className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mt-1 flex flex-col sm:flex-row sm:gap-3">
                              <span>Género: <span className="text-slate-700">{u.gender}</span></span>
                              <span className="hidden sm:inline">•</span>
                              <span>Nacimiento: <span className="text-slate-700">{u.birthDate}</span></span>
                            </div>
                          </div>
                          <div className="flex gap-2 w-full sm:w-auto justify-center">
                            <button onClick={() => setEditingUser(u)} className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors" title="Editar">
                              <Edit size={18}/>
                            </button>
                            <button onClick={() => handleDeleteUser(u.id, u.username)} className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors" title="Eliminar">
                              <Trash2 size={18}/>
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-slate-400 italic text-center py-2">No hay personal registrado.</p>
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
