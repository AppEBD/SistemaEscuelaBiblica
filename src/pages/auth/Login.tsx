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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí irá la lógica de conexión con Firebase más adelante
    console.log('Iniciando sesión con:', { username, role });
  };

  return (
    /* Contenedor principal: Centrado absoluto en PC y Móvil */
    <div className="min-h-screen w-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      
      {/* Tarjeta de Login: Ancho ajustable */}
      <div className="w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden transition-all duration-300">
        
        {/* Encabezado Institucional */}
        <div className="bg-blue-600 p-8 text-center text-white">
          <div className="mx-auto h-20 w-20 bg-white/20 rounded-3xl flex items-center justify-center mb-4 backdrop-blur-md shadow-inner">
            <Users className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight">Iglesia Bitinia</h2>
          <p className="text-blue-100 text-sm mt-1 font-medium">Escuela Bíblica Dominical V2.0</p>
        </div>

        {/* Cuerpo del Formulario */}
        <div className="p-8 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Selector de Rol */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Cargo en la Iglesia</label>
              <select 
                className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 transition-all text-gray-700 cursor-pointer"
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

            {/* Nombre de Usuario */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Usuario</label>
              <div className="relative group">
                <User className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Ej: juan_perez"
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 transition-all"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Contraseña */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Contraseña</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Botón de Entrada */}
            <button
              type="submit"
              className="w-full py-4 mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-3 active:scale-95 transform"
            >
              <LogIn className="h-5 w-5" />
              Entrar al Sistema
            </button>
          </form>
          
          {/* Footer del Card */}
          <div className="pt-6 border-t border-gray-100">
            <p className="text-center text-xs text-gray-400 font-medium">
              © 2026 Sistema EBD • Iglesia Bitinia
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
