import Login from './pages/auth/Login';
import Dashboard from './pages/Dashboard/Dashboard';

function App() {
  const session = localStorage.getItem('ebd_v2_session');
  return session ? <Dashboard /> : <Login />;
}
