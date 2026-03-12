import React from 'react';
import { Users } from 'lucide-react';

const MaestroView = () => {
  return (
    <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200 text-center">
      <Users className="h-16 w-16 text-blue-500 mx-auto mb-4" />
      <h2 className="text-2xl font-bold text-slate-800">Panel del Maestro</h2>
      <p className="text-slate-500 mt-2">Aquí irá la lista de asistencia de tus alumnos.</p>
    </div>
  );
};

export default MaestroView;
