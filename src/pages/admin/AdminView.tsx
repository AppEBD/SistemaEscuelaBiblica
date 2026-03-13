import React, { useState, useEffect } from 'react';
import { UserCheck, UserX, ChevronDown, Users, Bell, Trash2, Edit, Save, X, MapPin } from 'lucide-react';
import { collection, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../config/firebase'; 

const AdminView = () => {
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [openRole, setOpenRole] = useState<string | null>(null);
  
  // Estado para controlar el modal de edición
  const [editingUser, setEditingUser] = useState<any>(null);

  // LA LISTA OFICIAL DE TUS CAMPOS (Sedes)
  const camposOficiales = [
    'Sede Central', 'La Isla', 'El Amatal', 'Las Delicias', 'El Manguito', 
    'Buenos Aires', 'Corozal #1', 'El Porvenir', 'El Caulote', 'Corozal #2', 
    'Valle Encantado', 'La Playa'
  ];

  // Radar en Tiempo Real de Firebase
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
      setAllUsers(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsubscribe();
  }, []);

  // Aprobar o Rechazar Solicitudes Nuevas
  const handleAction = async (id: string, action: 'approved' | 'rejected') => {
    try {
      const userRef = doc(db, 'users', id);
      if (action === 'approved') await updateDoc(userRef, { status: 'approved' });
      else await deleteDoc(userRef);
    } catch (error) {
      alert("Error al procesar la solicitud en Firebase.");
    }
  };

  // Eliminar un usuario ya aprobado
  const handleDeleteUser = async (id: string, name: string) => {
    if (window.confirm(`¿Estás seguro de ELIMINAR a ${name}? Esto cerrará su sesión de inmediato y borrará sus datos.`)) {
      try {
        await deleteDoc(doc(db, 'users', id));
      } catch (error) {
        alert("Error al eliminar el usuario.");
      }
    }
  };

  // Guardar los cambios hechos en el Modal de Edición
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userRef = doc(db, 'users', editingUser.id);
      await updateDoc(userRef, {
        username: editingUser.username,
        gender: editingUser.gender,
        role: editingUser.role,
        campo: editingUser.campo,
        birthDate: `${editingUser.day}/${editingUser.month}/${editingUser.year}`,
        day: editingUser.day,
        month: editingUser.month,
        year: editingUser.year
      });
      setEditingUser(null); // Cierra el modal
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
      
      {/* =====================================================================
          MODAL DE EDICIÓN CENTRADO Y SIMÉTRICO
      ====================================================================== */}
      {editingUser && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <form onSubmit={handleSaveEdit} className="bg-white p-8 sm:p-10 rounded-[2.5rem] shadow-2xl w-full max-w-lg flex flex-col gap-5 relative text-center">
            
            <button type="button" onClick={() => setEditingUser(null)} className="absolute top-6 right-6 p-2 bg-slate-100 text-slate-400 rounded-full hover:text-red-500 hover:bg-red-50 transition-all">
              <X size={20}/>
            </button>
            
            <div className="flex flex-col items-center justify-center mb-2">
              <div className="h-16 w-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-3">
                <Edit size={32} />
              </div>
              <h3 className="text-xl font-black text-slate-800 uppercase tracking-widest">Editar Usuario</h3>
            </div>
            
            <div className="w-full flex flex-col items-center">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 w-full">Nombre Completo</label>
              <input className="w-full text-center p-3 sm:py-3.5 border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={editingUser.username} onChange={e => setEditingUser({...editingUser, username: e.target.value})} required />
            </div>

            <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="w-full flex flex-col items-center">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 w-full">Cargo</label>
                <select className="w-full text-center p-3 sm:py-3.5 border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={editingUser.role} onChange={e => setEditingUser({...editingUser, role: e.target.value})} required>
                  {roles.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="w-full flex flex-col items-center">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 w-full">Lugar / Campo</label>
                <select className="w-full text-center p-3 sm:py-3.5 border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={editingUser.campo || ''} onChange={e => setEditingUser({...editingUser, campo: e.target.value})} required>
                  <option value="">-- Seleccionar --</option>
                  {camposOficiales.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="w-full flex flex-col items-center">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 w-full">Fecha de Nacimiento</label>
              <div className="w-full grid grid-cols-3 gap-2">
                <select className="text-center p-3 border border-slate-200 rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500" value={editingUser.day} onChange={e => setEditingUser({...editingUser, day: e.target.value})}><option value="">Día</option>{days.map(d=><option key={d}>{d}</option>)}</select>
                <select className="text-center p-3 border border-slate-200 rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500" value={editingUser.month} onChange={e => setEditingUser({...editingUser, month: e.target.value})}><option value="">Mes</option>{months.map(m=><option key={m}>{m}</option>)}</select>
                <select className="text-center p-3 border border-slate-200 rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500" value={editingUser.year} onChange={e => setEditingUser({...editingUser, year: e.target.value})}><option value="">Año</option>{years.map(y=><option key={y}>{y}</option>)}</select>
              </div>
            </div>

            <div className="w-full flex flex-col items-center">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 w-full">Género</label>
              <select className="w-full text-center p-3 sm:py-3.5 border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={editingUser.gender} onChange={e => setEditingUser({...editingUser, gender: e.target.value})} required>
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
              </select>
            </div>

            <button type="submit" className="w-full py-4 mt-2 bg-blue-600 text-white font-black uppercase tracking-widest rounded-2xl hover:bg-blue-700 flex items-center justify-center gap-3 shadow-lg active:scale-95 transition-all">
              <Save size={20}/> Guardar Cambios
            </button>
          </form>
        </div>
      )}
      {/* ===================================================================== */}

      {/* COLUMNA IZQUIERDA: SOLICITUDES ENTRANTES */}
      <section className="w-full flex flex-col gap-4">
        <div className="flex items-center justify-center gap-3 bg-amber-100 text-amber-800 p-5 rounded-3xl text-center shadow-sm">
          <Bell className="h-6 w-6 animate-bounce" />
          <h2 className="text-sm sm:text-base font-black uppercase tracking-widest">
            Nuevas Solicitudes ({pendingUsers.length})
          </h2>
        </div>
        
        {pendingUsers.length === 0 ? (
          <div className="w-full p-10 border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center text-slate-400 font-bold text-center">
            <UserCheck className="h-12 w-12 text-slate-300 mb-3" />
            No hay solicitudes pendientes en este momento.
          </div>
        ) : (
          <div className="w-full flex flex-col gap-4">
            {pendingUsers.map(u => (
              <div key={u.id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200 flex flex-col items-center text-center gap-5 transition-all hover:shadow-md">
                
                <div className="w-full flex flex-col items-center gap-1">
                  <p className="font-black text-xl text-slate-800">{u.username}</p>
                  <div className="flex flex-wrap justify-center gap-2 mt-2">
                    <span className="bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg">{u.role}</span>
                    <span className="bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg flex items-center gap-1"><MapPin size={12}/>{u.campo || 'N/A'}</span>
                    <span className="bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg">{u.gender}</span>
                  </div>
                </div>

                <div className="flex w-full gap-3 justify-center">
                  <button onClick={() => handleAction(u.id, 'rejected')} className="flex-1 py-3 bg-red-50 text-red-600 font-black uppercase tracking-widest text-xs rounded-xl hover:bg-red-100 flex items-center justify-center gap-2 transition-colors">
                    <UserX size={16}/> Denegar
                  </button>
                  <button onClick={() => handleAction(u.id, 'approved')} className="flex-1 py-3 bg-green-50 text-green-600 font-black uppercase tracking-widest text-xs rounded-xl hover:bg-green-100 flex items-center justify-center gap-2 transition-colors">
                    <UserCheck size={16}/> Permitir
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* COLUMNA DERECHA: DIRECTORIO GENERAL */}
      <section className="w-full bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden text-center">
        <div className="p-6 sm:p-8 bg-slate-800 text-white flex flex-col items-center justify-center gap-3 w-full relative">
          <div className="absolute inset-0 bg-slate-900 opacity-50"></div>
          <Users size={32} className="text-blue-400 relative z-10" /> 
          <h2 className="font-black text-xl tracking-widest uppercase relative z-10">Directorio en Vivo</h2>
        </div>
        
        <div className="w-full flex flex-col">
          {roles.map(r => {
            const approvedUsers = allUsers.filter(u => u.role === r && u.status === 'approved');
            return (
              <div key={r} className="w-full border-b border-slate-100 last:border-0">
                <button 
                  onClick={() => setOpenRole(openRole === r ? null : r)} 
                  className="w-full p-6 flex justify-between items-center hover:bg-slate-50 transition-colors"
                >
                  <span className="font-black text-slate-700 text-lg uppercase tracking-wider">{r}S</span>
                  <div className="flex items-center gap-3 text-slate-400">
                    <span className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-xl text-xs font-black tracking-widest">{approvedUsers.length}</span>
                    <ChevronDown className={`transition-transform duration-300 ${openRole === r ? 'rotate-180' : ''}`} />
                  </div>
                </button>
                
                {openRole === r && (
                  <div className="bg-slate-50 p-4 sm:p-6 flex flex-col gap-4 w-full">
                    {approvedUsers.length > 0 ? (
                      approvedUsers.map(u => (
                        <div key={u.id} className="p-5 sm:p-6 bg-white rounded-[1.5rem] border border-slate-200 shadow-sm flex flex-col items-center text-center gap-4 transition-all hover:shadow-md hover:border-blue-200">
                          
                          <div className="w-full flex flex-col items-center gap-1">
                            <span className="font-black text-slate-800 text-xl">{u.username}</span>
                            <div className="flex flex-wrap justify-center gap-2 mt-2 w-full">
                              <span className="text-blue-600 bg-blue-50 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                                <MapPin size={12}/> {u.campo || 'N/A'}
                              </span>
                              <span className="text-slate-500 bg-slate-100 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                {u.gender}
                              </span>
                              <span className="text-slate-500 bg-slate-100 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                NAC: {u.birthDate || `${u.day}/${u.month}/${u.year}`}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex gap-3 w-full justify-center mt-2 border-t border-slate-50 pt-4">
                            <button onClick={() => setEditingUser(u)} className="flex-1 py-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-blue-50 hover:text-blue-600 font-bold text-xs uppercase tracking-widest flex justify-center items-center gap-2 transition-colors">
                              <Edit size={14}/> Editar
                            </button>
                            <button onClick={() => handleDeleteUser(u.id, u.username)} className="flex-1 py-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-red-50 hover:text-red-600 font-bold text-xs uppercase tracking-widest flex justify-center items-center gap-2 transition-colors">
                              <Trash2 size={14}/> Borrar
                            </button>
                          </div>

                        </div>
                      ))
                    ) : (
                      <div className="w-full py-6 flex flex-col items-center text-slate-400 font-medium">
                        <Users className="h-8 w-8 text-slate-300 mb-2 opacity-50" />
                        <p className="text-sm italic">No hay personal registrado en esta área.</p>
                      </div>
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
