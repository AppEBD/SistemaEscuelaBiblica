import React, { useState, useEffect } from 'react';
import { User, Lock, Users, LogIn, RefreshCw } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({
    role: '', username: '', day: '', month: '', year: '', gender: '', password: ''
  });
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
      const newUser = { 
        ...formData, 
        id: Date.now().toString(),
        status: isDir ? 'approved' : 'pending' 
      };
      
      localStorage.setItem('ebd_v2_session', JSON.stringify(newUser));
      
      if (!isDir) {
        const globalPending = JSON.parse(localStorage.getItem('ebd_global_users') || '[]');
        localStorage.setItem('ebd_global_users', JSON.stringify([...globalPending, newUser]));
      }
      
      window.location.reload();
    } else {
      alert("Contraseña de cargo incorrecta");
    }
  };

  if (status === 'pending') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
        <div className="bg-white p-10 rounded-[2.5rem] shadow-xl text-center max-w-md">
          <RefreshCw className="h-12 w-12 text-blue-500 animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-800">Solicitud Pendiente</h2>
          <p className="text-slate-500 mt-2">Esperando que el Director apruebe tu acceso...</p>
          <button onClick={() => {localStorage.clear(); window.location.reload();}} className="mt-6 text-blue-600 font-bold">Cancelar solicitud</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-white">
        <div className="bg-blue-600 p-6 text-center text-white">
          <Users className="h-10 w-10 mx-auto mb-2" />
          <h2 className="text-2xl font-bold italic">Iglesia Bitinia</h2>
          <p className="text-xs font-bold uppercase tracking-widest">Acceso V2.0</p>
        </div>
        <form onSubmit={handleLogin} className="p-8 space-y-4">
          <select className="w-full p-3 rounded-xl border bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500"
            onChange={e => setFormData({...formData, role: e.target.value})} required>
            <option value="">Selecciona tu cargo...</option>
            {['Administrador / Director', 'Maestro', 'Auxiliar', 'Logística', 'Secretaria', 'Tesorero'].map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <input className="w-full p-3 rounded-xl border bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Nombre Completo" onChange={e => setFormData({...formData, username: e.target.value})} required />
          <div className="grid grid-cols-3 gap-2">
            <input placeholder="Día" className="p-3 border rounded-xl" onChange={e => setFormData({...formData, day: e.target.value})} />
            <input placeholder="Mes" className="p-3 border rounded-xl" onChange={e => setFormData({...formData, month: e.target.value})} />
            <input placeholder="Año" className="p-3 border rounded-xl" onChange={e => setFormData({...formData, year: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <select className="p-3 border rounded-xl" onChange={e => setFormData({...formData, gender: e.target.value})} required>
              <option value="">Género</option>
              <option value="Masculino">M</option>
              <option value="Femenino">F</option>
            </select>
            <input type="password" placeholder="Contraseña de Cargo" className="p-3 border rounded-xl" 
              onChange={e => setFormData({...formData, password: e.target.value})} required />
          </div>
          <button type="submit" className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-lg active:scale-95 transition-all">
            ENTRAR AL SISTEMA
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
