import Login from './pages/auth/Login';
import Dashboard from './pages/Dashboard/Dashboard';

function App() {
  const sessionStr = localStorage.getItem('ebd_v2_session');
  let isApproved = false;

  // Verificamos si existe la sesión Y si el estado es exactamente 'approved'
  if (sessionStr) {
    const user = JSON.parse(sessionStr);
    if (user.status === 'approved') {
      isApproved = true;
    }
  }

  return (
    <div className="w-full min-h-screen font-sans text-slate-800 bg-slate-100 flex flex-col items-center justify-center">
      {/* Si está 100% aprobado entra al Dashboard. Si está pendiente o no existe, va al Login */}
      {isApproved ? <Dashboard /> : <Login />}
    </div>
  );
}

export default App;
