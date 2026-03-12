import React, { useState } from 'react';
import { User, Lock, LogIn, Users } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');

  const roles = [
    'Administrador / Director',
    'Maestro',
    'Auxiliar',
    'Logística',
    'Secretaria',
    'Tesorero'
  ];

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Encabezado con color distintivo de la Iglesia */}
        <div className="bg-blue-700 p-8 text-center text-white">
          <div className="mx-auto h-16 w-16 bg-white/20 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-sm">
            <Users className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold">Iglesia Bitinia</h2>
          <p className="text-blue-100 text-sm">Escuela Bíblica Dominical V2.0</p>
        </div>

        <div className="p-8 space-y-6">
          <form className="space-y-5">
            {/* Selector de Rol */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Tipo de Usuario</label>
              <select 
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 transition-all"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
              >
                <option value="">Selecciona tu cargo...</option>
                {roles.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            {/* Usuario */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre de Usuario</label>
              <div className="relative">
                <User className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Ej: juan_perez"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Contraseña */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <LogIn className="h-5 w-5" />
              Entrar al Sistema
            </button>
          </form>
          
          <p className="text-center text-xs text-gray-400">
            © 2026 Sistema EBD - Iglesia Bitinia
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
