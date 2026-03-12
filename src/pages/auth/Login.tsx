import React, { useState } from 'react';
import { User, Lock, LogIn } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 p-4">
      {/* Contenedor principal: Ajustable en ancho según el dispositivo */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 space-y-8">
        
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <span className="text-white text-2xl font-bold">EBD</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">
            Escuela Bíblica Dominical
          </h2>
          <p className="mt-2 text-sm text-gray-600">Acceso al Sistema V2.0</p>
        </div>

        <form className="mt-8 space-y-6">
          <div className="space-y-4">
            {/* Cambiado de Correo a Usuario */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Usuario</label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-base"
                  placeholder="Tu nombre de usuario"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Contraseña</label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-base"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <span className="absolute left-0 inset-y-0 flex items-center pl-3">
              <LogIn className="h-5 w-5 text-blue-300" />
            </span>
            Entrar al Sistema
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
