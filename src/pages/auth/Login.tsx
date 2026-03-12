import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, AlertCircle } from 'lucide-react';
import { loginUsuario } from '../../features/auth/services/authService';
import { useAuthStore } from '../../features/auth/store/authStore';

export default function Login() {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const setUsuario = useAuthStore((state) => state.setUsuario);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    const result = await loginUsuario(correo, password);

    if (result.success && result.data) {
      setUsuario(result.data);
      
      // Magia del enrutador: ¡Redirigimos según el rol!
      const rol = result.data.clase;
      if (rol === 'Director') navigate('/admin');
      else if (rol === 'MAESTRO' || rol === 'AUXILIAR') navigate('/maestro');
      else if (rol === 'SECRETARIA') navigate('/secretaria');
      else if (rol === 'TESORERO') navigate('/tesorero');
      else if (rol === 'LOGISTICA') navigate('/logistica');
      else navigate('/dashboard');

    } else {
      setError(result.error || 'Ocurrió un error al iniciar sesión.');
    }
    
    setCargando(false);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="mx-auto w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center shadow-lg shadow-indigo-200 mb-4">
          <span className="text-white text-3xl font-black">EBD</span>
        </div>
        <h2 className="text-center text-3xl font-black text-slate-800 tracking-tight">
          Escuela Bíblica Dominical
        </h2>
        <p className="mt-2 text-center text-sm font-bold text-slate-500 uppercase tracking-widest">
          Acceso al Sistema V2.0
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-3xl sm:px-10 border border-slate-100 mx-2">
          <form className="space-y-6" onSubmit={handleSubmit}>
            
            {error && (
              <div className="bg-rose-50 p-4 rounded-2xl flex items-center shadow-sm border border-rose-100 animate-in fade-in">
                <AlertCircle className="text-rose-500 mr-3 w-5 h-5 shrink-0" />
                <p className="text-xs font-bold text-rose-700">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">
                Correo Electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-300" />
                </div>
                <input
                  type="email"
                  required
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  className="block w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="ejemplo@iglesia.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-300" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={cargando}
              className={`w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-2xl shadow-lg text-sm font-black text-white transition-all active:scale-95 ${
                cargando ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'
              }`}
            >
              {cargando ? (
                'Verificando credenciales...'
              ) : (
                <>
                  <LogIn className="w-5 h-5 mr-2" />
                  Entrar al Sistema
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
