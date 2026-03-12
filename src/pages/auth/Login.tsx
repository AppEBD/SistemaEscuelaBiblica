import React, { useState, useEffect } from 'react';
import { User, Lock, Calendar, Users, LogIn, RefreshCw, ChevronDown } from 'lucide-react';

const Login = () => {
  // Estados para los datos del formulario
  const [role, setRole] = useState('');
  const [username, setUsername] = useState('');
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [gender, setGender] = useState('');
  const [password, setPassword] = useState('');
  
  // Estado para bloquear el formulario (Modo Lectura)
  const [isLocked, setIsLocked] = useState(false);

  // 1. Cargar datos del LocalStorage al iniciar
  useEffect(() => {
    const saved = localStorage.getItem('ebd_v2_session');
    if (saved) {
      const data = JSON.parse(saved);
      setRole(data.role || '');
      setUsername(data.username || '');
      setDay(data.day || '');
      setMonth(data.month || '');
      setYear(data.year || '');
      setGender(data.gender || '');
      setPassword(data.password || '');
      setIsLocked(true); // Bloquear automáticamente si existen datos
    }
  }, []);

  // 2. Función para Guardar y Bloquear
  const handleRequestAccess = (e: React.FormEvent) => {
    e.preventDefault();
    const data = { role, username, day, month, year, gender, password };
    localStorage.setItem('ebd_v2_session', JSON.stringify(data));
    setIsLocked(true);
  };

  // 3. Función para Desbloquear (Limpiar)
  const handleReset = () => {
    if (confirm("¿Deseas editar los datos de acceso?")) {
      setIsLocked(false);
      localStorage.removeItem('ebd_v2_session');
    }
  };

  // Generadores para los selectores de fecha
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  const years = Array.from({ length: 90 }, (_, i) => new Date().getFullYear() - 10 - i);

  return (
    <div className="min-h-screen w-screen flex flex-col items-center justify-center bg-slate-100 p-4 font-sans">
      <div className="w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden transition-all duration-500 border border-white">
        
        {/* Encabezado con Identidad de la Iglesia */}
        <div className="bg-blue-600 p-6 text-center text-white relative">
          <div className="mx-auto h-16 w-16 bg-white/20 rounded-2xl flex items-center justify-center mb-2 backdrop-blur-md">
            <Users className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Iglesia Bitinia</h2>
          <p className="text-blue-100 text-xs font-semibold uppercase tracking-tighter">Escuela Bíblica V2.0</p>
          
          {isLocked && (
            <button onClick={handleReset} className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all">
              <RefreshCw className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="p-6 md:p-10 space-y-6">
          <form onSubmit={handleRequestAccess} className="space-y-4">
            
            {/* Cargo e Iglesia */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 ml-1">CARGO EN LA IGLESIA</label>
              <select 
                disabled={isLocked}
                className={`w-full px-4 py-3 rounded-xl border ${isLocked ? 'bg-gray-100 text-gray-400 border-transparent' : 'bg-gray-50 border-gray-200'} outline-none focus:ring-2 focus:ring-blue-500 appearance-none`}
                value={role} onChange={(e) => setRole(e.target.value)} required
              >
                <option value="">Selecciona tu cargo...</option>
                {['Administrador / Director', 'Maestro', 'Auxiliar', 'Logística', 'Secretaria', 'Tesorero'].map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            {/* Nombre de Usuario */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 ml-1">NOMBRE DE USUARIO</label>
              <div className="relative">
                <User className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                <input 
                  readOnly={isLocked}
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border ${isLocked ? 'bg-gray-100 text-gray-400 border-transparent' : 'bg-gray-50 border-gray-200'} outline-none focus:ring-2 focus:ring-blue-500`}
                  type="text" placeholder="Ej: marcos_12" value={username} onChange={(e) => setUsername(e.target.value)} required
                />
              </div>
            </div>

            {/* Fecha de Nacimiento (Día, Mes, Año) */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 ml-1">FECHA DE NACIMIENTO</label>
              <div className="grid grid-cols-3 gap-2">
                <select disabled={isLocked} value={day} onChange={(e) => setDay(e.target.value)} className="p-3 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none" required>
                  <option value="">Día</option>
                  {days.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <select disabled={isLocked} value={month} onChange={(e) => setMonth(e.target.value)} className="p-3 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none" required>
                  <option value="">Mes</option>
                  {months.map((m, i) => <option key={m} value={i+1}>{m}</option>)}
                </select>
                <select disabled={isLocked} value={year} onChange={(e) => setYear(e.target.value)} className="p-3 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none" required>
                  <option value="">Año</option>
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>

            {/* Género y Contraseña */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 ml-1">GÉNERO</label>
                <select 
                  disabled={isLocked}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500"
                  value={gender} onChange={(e) => setGender(e.target.value)} required
                >
                  <option value="">Seleccionar...</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Femenino">Femenino</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 ml-1">CONTRASEÑA</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                  <input 
                    readOnly={isLocked}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border ${isLocked ? 'bg-gray-100 text-gray-400 border-transparent' : 'bg-gray-50 border-gray-200'} outline-none focus:ring-2 focus:ring-blue-500`}
                    type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required
                  />
                </div>
              </div>
            </div>

            {/* Botón de Acción */}
            <button
              type="submit"
              disabled={isLocked}
              className={`w-full py-4 mt-4 font-bold rounded-2xl transition-all flex items-center justify-center gap-3 ${isLocked ? 'bg-green-500 text-white cursor-default' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg active:scale-95'}`}
            >
              <LogIn className="h-5 w-5" />
              {isLocked ? 'ACCESO SOLICITADO (MODO LECTURA)' : 'SOLICITAR ACCESO AL SISTEMA'}
            </button>
          </form>
          
          <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest">
            © 2026 Sistema EBD • Iglesia Bitinia
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
