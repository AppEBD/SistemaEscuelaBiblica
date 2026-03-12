import React, { useState, useEffect } from 'react';
import { User, Lock, Calendar, Users, LogIn, RefreshCw } from 'lucide-react';

const Login = () => {
  // Estados para los datos del formulario
  const [role, setRole] = useState('');
  const [username, setUsername] = useState('');
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [gender, setGender] = useState('');
  const [password, setPassword] = useState('');
  
  // Estado para bloquear el formulario y mostrar el Dashboard
  const [isLocked, setIsLocked] = useState(false);

  // 1. Cargar persistencia al iniciar
  useEffect(() => {
    const saved = localStorage.getItem('ebd_v2_session');
    if (saved) {
      setIsLocked(true);
    }
  }, []);

  // 2. Lógica de Validación y Registro
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Diccionario de contraseñas maestras solicitado
    const llavesMaestras: Record<string, string> = {
      'Administrador / Director': '1234',
      'Maestro': '2222',
      'Auxiliar': '3333',
      'Logística': '4444',
      'Tesorero': '5555',
      'Secretaria': '8888'
    };

    if (password === llavesMaestras[role]) {
      const userData = { 
        role, 
        username, 
        fullName: username, // Se registra con su nombre normal
        birthDate: `${day}/${month}/${year}`,
        gender 
      };
      
      localStorage.setItem('ebd_v2_session', JSON.stringify(userData));
      setIsLocked(true);
      // Recargamos para que el App.tsx detecte el cambio de estado
      window.location.reload(); 
    } else {
      alert(`La contraseña no coincide con el cargo de ${role}. Inténtalo de nuevo.`);
    }
  };

  // Generadores para fechas
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  const years = Array.from({ length: 80 }, (_, i) => new Date().getFullYear() - 10 - i);

  return (
    <div className="min-h-screen w-screen flex flex-col items-center justify-center bg-gray-100 p-4 font-sans text-slate-900">
      <div className="w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-white">
        
        <div className="bg-blue-600 p-6 text-center text-white">
          <div className="mx-auto h-16 w-16 bg-white/20 rounded-2xl flex items-center justify-center mb-2 backdrop-blur-md">
            <Users className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold">Iglesia Bitinia</h2>
          <p className="text-blue-100 text-[10px] uppercase tracking-widest font-bold">Registro de Acceso V2.0</p>
        </div>

        <div className="p-8 space-y-5">
          <form onSubmit={handleLogin} className="space-y-4">
            
            {/* Cargo */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 ml-1">SELECCIONA TU CARGO</label>
              <select 
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500"
                value={role} onChange={(e) => setRole(e.target.value)} required
              >
                <option value="">¿Cuál es tu función?</option>
                {['Administrador / Director', 'Maestro', 'Auxiliar', 'Logística', 'Secretaria', 'Tesorero'].map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            {/* Nombre Normal */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 ml-1">NOMBRE COMPLETO</label>
              <div className="relative">
                <User className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                <input 
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500"
                  type="text" placeholder="Escribe tu nombre y apellido" value={username} onChange={(e) => setUsername(e.target.value)} required
                />
              </div>
            </div>

            {/* Fecha de Nacimiento */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 ml-1">FECHA DE NACIMIENTO</label>
              <div className="grid grid-cols-3 gap-2">
                <select value={day} onChange={(e) => setDay(e.target.value)} className="p-3 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none" required>
                  <option value="">Día</option>
                  {days.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <select value={month} onChange={(e) => setMonth(e.target.value)} className="p-3 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none" required>
                  <option value="">Mes</option>
                  {months.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
                <select value={year} onChange={(e) => setYear(e.target.value)} className="p-3 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none" required>
                  <option value="">Año</option>
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>

            {/* Género y Contraseña Especial */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 ml-1">GÉNERO</label>
                <select 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500"
                  value={gender} onChange={(e) => setGender(e.target.value)} required
                >
                  <option value="">Seleccionar...</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Femenino">Femenino</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 ml-1">CONTRASEÑA DE CARGO</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                  <input 
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500"
                    type="password" placeholder="Código de acceso" value={password} onChange={(e) => setPassword(e.target.value)} required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 mt-4 font-bold rounded-2xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              <LogIn className="h-5 w-5" />
              Entrar al Sistema
            </button>
          </form>
          
          <p className="text-center text-[10px] text-gray-400 font-bold uppercase">
            © 2026 Iglesia Bitinia • EBD
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
