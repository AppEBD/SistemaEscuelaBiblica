import Login from './pages/auth/Login';
import Dashboard from './pages/Dashboard/Dashboard';

function App() {
  // Leemos si existe la sesión en el almacenamiento local del navegador
  const session = localStorage.getItem('ebd_v2_session');

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans">
      {/* Lógica condicional (Ternaria):
          ¿Existe sesión? 
          SI -> Muestra el Dashboard
          NO -> Muestra el Login
      */}
      {session ? <Dashboard /> : <Login />}
    </div>
  );
}

export default App;
