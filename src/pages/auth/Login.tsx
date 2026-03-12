import React, { useState, useEffect } from 'react';
import { User, Lock, Users, LogIn, RefreshCw, CheckSquare } from 'lucide-react';
// IMPORTA TU FIREBASE AQUÍ (Ajusta la ruta según tu proyecto)
import { doc, setDoc, onSnapshot, deleteDoc } from 'firebase/firestore';
import { db } from '../../config/firebase'; // <--- Asegúrate de que esta ruta sea correcta

const Login = () => {
  const [formData, setFormData] = useState({
    role: '', username: '', day: '', month: '', year: '', gender: '', password: ''
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  // 1. Cargar datos recordados y sesión activa al iniciar
  useEffect(() => {
    // Revisar si el usuario pidió recordar sus datos
    const savedData = localStorage.getItem('ebd_v2_remember');
    if (savedData) {
      setFormData(JSON.parse(savedData));
      setRememberMe(true);
    }

    // Revisar si hay una sesión en curso (pendiente o aprobada)
    const session = localStorage.getItem('ebd_v2_session');
    if (session) {
      const user = JSON.parse(session);
      setIsLocked(true);
      
      // ESCUCHADOR EN TIEMPO REAL: Vigilar el documento del usuario en Firebase
      const unsubscribe = onSnapshot(doc(db, 'users', user.id), (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.status === 'approved' && user.status !== 'approved') {
            // ¡El admin lo aprobó en tiempo real!
            localStorage.setItem('ebd_v2_session', JSON.stringify({ ...user, status: 'approved' }));
            window.location.reload(); // Recarga para entrar al Dashboard
          }
        } else {
          // Si el documento ya no existe, el admin lo RECHAZÓ
          if (user.role !== 'Administrador / Director') {
            alert("Tu solicitud fue denegada por el Administrador.");
            handleCancel();
          }
        }
      });

      return () => unsubscribe(); // Limpiar el escuchador si el componente se desmonta
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const keys: Record<string, string> = {
      'Administrador / Director': '1234', 'Maestro': '2222', 'Auxiliar': '3333',
      'Logística': '4444', 'Tesorero': '5555', 'Secretaria': '8888'
    };

    if (formData.password === keys[formData.role]) {
      // Si marcó "Recordar", guardamos los datos tipeados
      if (rememberMe) {
        localStorage.setItem('ebd_v2_remember', JSON.stringify(formData));
      } else {
        localStorage.removeItem('ebd_v2_remember');
      }

      const isDir = formData.role === 'Administrador / Director';
      const userId = `${formData.role}-${formData.username}`.replace(/\s+/g, '').toLowerCase();
      
      const newUser = { 
        ...formData, 
        id: userId,
        status: isDir ? 'approved' : 'pending' 
      };
      
      // Guardar en Firebase (Firestore)
      await setDoc(doc(db, 'users', userId), newUser);
      
      // Bloquear pantalla localmente
      localStorage.setItem('ebd_v2_session', JSON.stringify(newUser));
      setIsLocked(true);

      if (isDir) window.location.reload(); // El director entra de golpe
    } else {
      alert("La contraseña no coincide con el cargo seleccionado.");
    }
  };

  const handleCancel = async () => {
    const session = JSON.parse(localStorage.getItem('ebd_v2_session') || '{}');
    if (session.id) {
      await deleteDoc(doc(db, 'users', session.id)); // Borrar de Firebase
    }
    localStorage.removeItem('ebd_v2_session');
    setIsLocked(false);
  };

  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  const years = Array.from({ length: 80 }, (_, i) => new Date().getFullYear() - 10 - i);

  // Clases dinámicas para el Modo Lectura (Gris)
  const inputClass = `w-full text-center px-4 py-3 sm:py-3.5 rounded-xl border outline-none transition-all text-sm sm:text-base ${
    isLocked ? 'bg-slate-200 border-transparent text-slate-500 cursor-not-allowed' : 'bg-slate-50 border-slate-200 focus:ring-2 focus:ring-blue-500'
  }`;

  return (
    <div className="w-full flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md sm:max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-white transition-all duration-300">
        
        <div className="bg-blue-600 p-8 text-center text-white flex flex-col items-center relative">
          <div className="h-16 w-16 bg-white/20 rounded-2xl flex items-center justify-center mb-3 backdrop-blur-md">
            <Users className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">Iglesia Bitinia</h2>
          <p className="text-blue-100 text-[10px] sm:text-xs uppercase tracking-[0.2em] font-bold mt-1">Registro V2.0</p>
          
          {isLocked && (
            <div className="absolute top-4 right-4 p-2 bg-white/20 rounded-full animate-pulse">
              <RefreshCw className="h-5 w-5 text-white animate-spin" />
            </div>
          )}
        </div>

        <form onSubmit={handleLogin} className="p-8 flex flex-col gap-5">
          
          <div className="flex flex-col items-center w-full">
             <label className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest mb-1 text-center w-full">Cargo en la Iglesia</label>
             <select disabled={isLocked} className={inputClass} value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} required>
              <option value="">-- Selecciona tu función --</option>
              {['Administrador / Director', 'Maestro', 'Auxiliar', 'Logística', 'Secretaria', 'Tesorero'].map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <div className="flex flex-col items-center w-full">
             <label className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest mb-1 text-center w-full">Nombre Completo</label>
             <div className="relative w-full flex justify-center">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input readOnly={isLocked} className={inputClass} style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }} value={formData.username} placeholder="Ej: Juan Pérez" onChange={e => setFormData({...formData, username: e.target.value})} required />
             </div>
          </div>

          <div className="flex flex-col items-center w-full">
            <label className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest mb-1 text-center w-full">Fecha de Nacimiento</label>
            <div className="w-full grid grid-cols-3 gap-3">
              <select disabled={isLocked} className={`${inputClass} px-1`} value={formData.day} onChange={e => setFormData({...formData, day: e.target.value})} required><option value="">Día</option>{days.map(d => <option key={d} value={d}>{d}</option>)}</select>
              <select disabled={isLocked} className={`${inputClass} px-1`} value={formData.month} onChange={e => setFormData({...formData, month: e.target.value})} required><option value="">Mes</option>{months.map(m => <option key={m} value={m}>{m}</option>)}</select>
              <select disabled={isLocked} className={`${inputClass} px-1`} value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})} required><option value="">Año</option>{years.map(y => <option key={y} value={y}>{y}</option>)}</select>
            </div>
          </div>

          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col items-center w-full">
              <label className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest mb-1 text-center w-full">Género</label>
              <select disabled={isLocked} className={inputClass} value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})} required>
                <option value="">-- Seleccionar --</option>
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
              </select>
            </div>
            
            <div className="flex flex-col items-center w-full">
              <label className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest mb-1 text-center w-full">Contraseña</label>
              <div className="relative w-full flex justify-center">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input readOnly={isLocked} type="password" placeholder="Código" className={`${inputClass} tracking-[0.3em]`} style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required />
              </div>
            </div>
          </div>

          {/* CHECKBOX DE RECORDAR DATOS */}
          {!isLocked && (
            <label className="flex items-center justify-center gap-2 cursor-pointer w-full text-slate-500 hover:text-blue-600 transition-colors">
              <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer" />
              <span className="text-xs font-bold uppercase tracking-wider">Recordar mis datos</span>
            </label>
          )}

          {/* BOTÓN DINÁMICO */}
          {isLocked ? (
            <div className="w-full flex flex-col gap-2">
              <div className="w-full py-4 mt-2 bg-amber-500 text-white font-black uppercase tracking-widest rounded-2xl shadow-lg flex justify-center items-center gap-3">
                <RefreshCw className="w-5 h-5 animate-spin"/> ESPERANDO APROBACIÓN...
              </div>
              <button type="button" onClick={handleCancel} className="text-[10px] font-black uppercase tracking-widest text-red-400 hover:text-red-600 py-2">
                Cancelar e Intentar de Nuevo
              </button>
            </div>
          ) : (
            <button type="submit" className="w-full py-4 mt-2 bg-blue-600 text-white font-black uppercase tracking-widest rounded-2xl shadow-lg hover:bg-blue-700 active:scale-[0.98] transition-all flex justify-center items-center gap-3">
              <LogIn className="w-5 h-5"/> SOLICITAR ACCESO
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default Login;
