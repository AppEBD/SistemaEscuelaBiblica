import Login from './pages/auth/Login';
import Dashboard from './pages/Dashboard/Dashboard';

function App() {
  const session = localStorage.getItem('ebd_v2_session');

  return (
    /* Forzamos a que toda la aplicación sea un contenedor centrado absoluto */
    <div className="min-h-screen w-full bg-slate-100 text-slate-800 font-sans flex flex-col items-center justify-center overflow-x-hidden">
      {session ? <Dashboard /> : <Login />}
    </div>
  );
}

export default App;
