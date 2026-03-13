import React from 'react';
import { Users, MapPin, ShieldCheck, User } from 'lucide-react';

const MaestroView = () => {
  // Extraemos la información del usuario en vivo
  const user = JSON.parse(localStorage.getItem('ebd_v2_session') || '{}');

  return (
    <div className="w-full flex flex-col items-center gap-8">
      
      {/* TARJETA DE BIENVENIDA HERO */}
      <div className="w-full bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden flex flex-col items-center text-center p-8 sm:p-12 relative mt-12">
         {/* Fondo Azul Superior */}
         <div className="absolute top-0 left-0 w-full h-32 bg-blue-600"></div>
         
         {/* Avatar Circular */}
         <div className="z-10 h-28 w-28 bg-white rounded-full flex items-center justify-center mb-6 border-4 border-blue-50 shadow-xl">
           <User className="h-12 w-12 text-blue-600" />
         </div>
         
         {/* Saludo Personalizado */}
         <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-1">Bienvenido de nuevo</h2>
         <h1 className="text-3xl sm:text-5xl font-black text-slate-800 uppercase tracking-tight">
           {user.username}
         </h1>
         
         {/* Insignias de Cargo y Lugar */}
         <div className="mt-6 flex flex-col sm:flex-row justify-center items-center gap-3 w-full">
           <span className="flex items-center justify-center gap-2 bg-blue-50 text-blue-600 px-6 py-3 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-widest w-full sm:w-auto">
             <ShieldCheck size={18} /> {user.role}
           </span>
           <span className="flex items-center justify-center gap-2 bg-amber-50 text-amber-600 px-6 py-3 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-widest w-full sm:w-auto">
             <MapPin size={18} /> {user.campo || 'Lugar no especificado'}
           </span>
         </div>
      </div>
      
      {/* SECCIÓN PREPARATORIA: LISTA DE ASISTENCIA */}
      <div className="w-full bg-white rounded-[2rem] shadow-sm border-2 border-dashed border-slate-200 p-10 flex flex-col items-center text-center">
        <Users className="h-16 w-16 text-slate-300 mb-4" />
        <h3 className="text-2xl font-black text-slate-700 uppercase tracking-tight">Lista de Asistencia</h3>
        <p className="text-slate-500 mt-2 font-medium">Esta sección está siendo configurada. Pronto podrás registrar la asistencia de tus alumnos aquí.</p>
      </div>

    </div>
  );
};

export default MaestroView;
