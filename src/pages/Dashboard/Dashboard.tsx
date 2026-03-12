import React from 'react';
import { Construction, LogOut, UserCircle, ShieldCheck, Calendar, Heart } from 'lucide-react';

const Dashboard = () => {
  // Extraemos la información guardada en el LocalStorage
  const session = localStorage.getItem('ebd_v2_session');
  
  // Si por alguna razón no hay datos, ponemos valores por defecto para evitar errores
  const userData = session ? JSON.parse(session) : { 
    username: 'Usuario', 
    role: 'Invitado', 
    birthDate: '--/--/--', 
    gender: 'No definido' 
  };

  const handleLogout = () => {
    // Limpiamos la sesión y recargamos para volver al Login
    localStorage.removeItem('ebd_v2_session');
    window.location.reload();
  };

  return (
    <div className="min-h-screen w-full bg-slate-100 flex flex-col items-center justify-center p-4 font-sans text-slate-900">
      
      <div className="w-full max-w-lg bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-white">
        
        {/* Encabezado Superior */}
        <div className="bg-slate-800 p-8 text-white text-center">
          <div className="mx-auto h-20 w-20 bg-blue-500 rounded-full flex items-center justify-center mb-4 shadow-lg border-4 border-slate-700">
            <UserCircle className="h-12 w-12 text-white" />
          </div>
          <h2 className="text-xl font-light italic opacity-80">Bienvenido,</h2>
          <h1 className="text-3xl font-black uppercase tracking-tight">{userData.username}</h1>
          
          <div className="mt-4 inline-flex items-center gap-2 bg-blue-600/30 px-4 py-1 rounded-full border border-blue-400/50">
            <ShieldCheck className="h-4 w-4 text-blue-300" />
            <span className="text-xs font-bold uppercase tracking-widest text-blue-100">
              {userData.role}
            </span>
          </div>
        </div>

        {/* Cuerpo del Dashboard */}
        <div className="p-8 space-y-8">
          
          {/* Mensaje de Construcción Personalizado */}
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="p-4 bg-amber-50 rounded-full">
              <Construction className="h-12 w-12 text-amber-500 animate-bounce" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-700">Interfaz en Proceso</h3>
              <p className="text-sm text-slate-500 leading-relaxed px-4">
                Hola <span className="font-bold text-blue-600">{userData.username}</span>, estamos trabajando en las herramientas específicas para tu cargo de <span className="italic font-medium">{userData.role}</span> en esta nueva <span className="font-bold">V2.0</span> de la Iglesia Bitinia.
              </p>
            </div>
          </div>

          {/* Ficha de Datos del Usuario (Persistentes) */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center">
              <Heart className="h-4 w-4 text-rose-400 mb-1" />
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Género</p>
              <p className="text-sm font-semibold text-slate-700">{userData.gender}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center">
              <Calendar className="h-4 w-4 text-blue-400 mb-1" />
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Nacimiento</p>
              <p className="text-sm font-semibold text-slate-700">{userData.birthDate}</p>
            </div>
          </div>

          {/* Botón Salir */}
          <button 
            onClick={handleLogout}
            className="w-full py-4 flex items-center justify-center gap-2 text-slate-400 hover:text-red-500 font-bold transition-all border-t border-slate-50 mt-4 group"
          >
            <LogOut className="h-5 w-5 group-hover:-translate-x-1 transition-transform" /> 
            Cerrar Sesión
          </button>
        </div>
      </div>
      
      <p className="mt-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
        Iglesia Bitinia • Depto. de Sistemas 2026
      </p>
    </div>
  );
};

export default Dashboard;
