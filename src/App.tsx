import Login from './pages/auth/Login';
import Dashboard from './pages/Dashboard/Dashboard';

function App() {
  const session = localStorage.getItem('ebd_v2_session');

  return (
    // w-full asegura que tome el 100% del monitor o pantalla del móvil
    <div className="w-full min-h-screen font-sans text-slate-800">
      {session ? <Dashboard /> : <Login />}
    </div>
  );
}

export default App;
