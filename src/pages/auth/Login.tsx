import React, { useState, useEffect } from 'react';
import { User, Lock, Users, LogIn, RefreshCw } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({
    role: '', username: '', day: '', month: '', year: '', gender: '', password: ''
  });
  
  // Estado para saber si está llenando, esperando aprobación o aprobado
  const [status, setStatus] = useState<'idle' | 'pending' | 'approved'>('idle');

  useEffect(() => {
    const session = localStorage.getItem('ebd_v2_session');
    if (session) {
      const user = JSON.parse(session);
      setStatus(user.status);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const keys: Record<string, string> = {
      'Administrador / Director': '1234', 'Maestro': '2222', 'Auxiliar': '3333',
      'Logística': '4444', 'Tesorero': '5555', 'Secretaria': '8888'
    };

    if (formData.password === keys[formData.role]) {
      const isDir = formData.role === 'Administrador / Director';
      
      // Creamos el usuario. Si es director entra de una vez, si no, a esperar.
      const newUser = { 
        ...formData, 
        id: Date.now().toString(),
        status: isDir ? 'approved' : 'pending' 
      };
      
      localStorage.setItem('ebd_v2_session', JSON.stringify(newUser));
      
      if (!isDir) {
        // Guardamos en la base de datos simulada para que el Director lo vea
        const globalPending = JSON.parse(localStorage.getItem('ebd_global_users') || '[]');
        localStorage.setItem('ebd_global_users', JSON.stringify([...globalPending, newUser]));
      }
      
      window.location.reload();
    } else {
      alert("La contraseña no coincide con el cargo seleccionado.");
    }
  };

  // Generadores para los menús desplegables
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  const years = Array.from({ length: 80 }, (_, i) => new Date().getFullYear() - 10 - i);

  // Pantalla de "Esperando Aprobación"
  if (status === 'pending') {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-100 p-4">
        <div className="bg-white p-8 sm:p-12 rounded-[2.5rem] shadow-xl text-center max-w-md w-full border border-slate-200">
          <RefreshCw className="h-14 w-14 text-blue-500 animate-spin mx-auto mb-6" />
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Solicitud Pendiente</h2>
          <p className="text-slate-500 mt-3 leading-relaxed">
            Hemos recibido tus datos. Esperando que el <span className="font-bold text-slate-700">Administrador</span> acepte tu solicitud para ingresar al sistema...
          </p>
          <button 
            onClick={() => {localStorage.clear(); window.location.reload();}} 
            className="mt-8 text-sm text-red-500 hover:text-red-700 font-bold uppercase tracking-widest transition-colors"
          >
            Cancelar solicitud
          </button>
        </div>
      </div>
    );
  }

  // Pantalla Principal de Registro/Login (100% Adaptable)
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-100 p-4 font-sans text-slate-900">
      
      {/* Contenedor Adaptable: max-w-md en móviles, sm:max-w-lg en laptops */}
      <div className="w-full max-w-md sm:max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-white transition-all duration-300">
        
        {/* Encabezado */}
        <div className="bg-blue-600 p-6 sm:p-8 text-center text-white">
          <div className="mx-auto h-16 w-16 bg-white/20 rounded-2xl flex items-center justify-center mb-3 backdrop-blur-md">
            <Users className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">Iglesia Bitinia</h2>
          <p className="text-blue-100 text-[10px] sm:text-xs uppercase tracking-[0.2em] font-bold mt-1">
            Registro de Acceso V2.0
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleLogin} className="p-6 sm:p-8 space-y-5">
          
          {/* Cargo */}
          <div className="space-y-1.5">
             <label className="text-[10px] sm:text-xs font-black text-slate-400 uppercase ml-1 tracking-wider">Cargo en la Iglesia</label>
             <select 
              className="w-full px-4 py-3 sm:py-3.5 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm sm:text-base cursor-pointer"
              onChange={e => setFormData({...formData, role: e.target.value})} required
             >
              <option value="">¿Cuál es tu función?</option>
              {['Administrador / Director', 'Maestro', 'Auxiliar', 'Logística', 'Secretaria', 'Tesorero'].map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          {/* Nombre */}
          <div className="space-y-1.5">
             <label className="text-[10px] sm:text-xs font-black text-slate-400 uppercase ml-1 tracking-wider">Nombre Completo</label>
             <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input 
                  className="w-full pl-12 pr-4 py-3 sm:py-3.5 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm sm:text-base"
                  placeholder="Ej: Juan Pérez" 
                  onChange={e => setFormData({...formData, username: e.target.value})} required 
                />
             </div>
          </div>

          {/* Fecha de Nacimiento (Con menús desplegables restaurados) */}
          <div className="space-y-1.5">
            <label className="text-[10px] sm:text-xs font-black text-slate-400 uppercase ml-1 tracking-wider">Fecha de Nacimiento</label>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <select className="px-2 sm:px-4 py-3 sm:py-3.5 rounded-xl border border-slate-200 bg-slate-50 text-sm sm:text-base outline-none cursor-pointer focus:ring-2 focus:ring-blue-500 transition-all" onChange={e => setFormData({...formData, day: e.target.value})} required>
                <option value="">Día</option>
                {days.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <select className="px-2 sm:px-4 py-3 sm:py-3.5 rounded-xl border border-slate-200 bg-slate-50 text-sm sm:text-base outline-none cursor-pointer focus:ring-2 focus:ring-blue-500 transition-all" onChange={e => setFormData({...formData, month: e.target.value})} required>
                <option value="">Mes</option>
                {months.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <select className="px-2 sm:px-4 py-3 sm:py-3.5 rounded-xl border border-slate-200 bg-slate-50 text-sm sm:text-base outline-none cursor-pointer focus:ring-2 focus:ring-blue-500 transition-all" onChange={e => setFormData({...formData, year: e.target.value})} required>
                <option value="">Año</option>
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>

          {/* Género y Contraseña (En dos columnas para Laptop, en una para Móvil) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            <div className="space-y-1.5">
              <label className="text-[10px] sm:text-xs font-black text-slate-400 uppercase ml-1 tracking-wider">Género</label>
              <select 
                className="w-full px-4 py-3 sm:py-3.5 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base cursor-pointer transition-all" 
                onChange={e => setFormData({...formData, gender: e.target.value})} required
              >
                <option value="">Seleccionar...</option>
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
              </select>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[10px] sm:text-xs font-black text-slate-400 uppercase ml-1 tracking-wider">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input 
                  type="password" 
                  placeholder="Código..." 
                  className="w-full pl-12 pr-4 py-3 sm:py-3.5 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base transition-all" 
                  onChange={e => setFormData({...formData, password: e.target.value})} required 
                />
              </div>
            </div>
          </div>

          {/* Botón */}
          <button 
            type="submit" 
            className="w-full py-4 mt-2 bg-blue-600 text-white font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-[0.98] transition-all flex justify-center items-center gap-3"
          >
            <LogIn className="w-5 h-5"/> Entrar al Sistema
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
