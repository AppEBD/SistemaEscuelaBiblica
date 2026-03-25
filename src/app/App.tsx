import React from 'react';
import { useAuth } from './modules/auth/application/useAuth'; // Asegúrate de que esta ruta sea correcta
import { LoginView } from './modules/auth/presentation/LoginView'; // Ajusta la ruta a tu componente de Login
import { StudentsView } from './modules/students/presentation/StudentsView';

export const App = () => {
    // Obtenemos el estado de la sesión desde tu hook de autenticación
    const { userData, cargando } = useAuth();

    // 1. Mientras Firebase verifica si hay sesión, mostramos un cargando central
    if (cargando) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#4f46e5' }}>
                <i className="fa-solid fa-spinner fa-spin fa-3x"></i>
            </div>
        );
    }

    // 2. Si no hay datos de usuario, lo mandamos a la pantalla de iniciar sesión
    if (!userData) {
        return <LoginView />;
    }

    // 3. Si el usuario ESTÁ logueado, mostramos nuestra súper aplicación.
    // Como StudentsView ya tiene su propio menú superior, botón de perfil y cierre de sesión,
    // NO necesitamos envolverlo en ningún otro <div> o <Header>.
    return (
        <StudentsView />
    );
};

export default App;
