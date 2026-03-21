import { useState, useEffect } from 'react';
import { AuthService } from '../infrastructure/auth.service';
import { UserRole, AuthUser } from '../domain/auth.model';

export const useAuth = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [userRole, setUserRole] = useState<UserRole | null>(null);
    const [userData, setUserData] = useState<AuthUser | null>(null);

    useEffect(() => {
        const { rol, user } = AuthService.sesion.recuperar();
        if (rol) {
            setUserRole(rol as UserRole);
            setUserData(user);
        }
    }, []);

    const calcularEdad = (fecha: string): number | null => {
        if (!fecha) return null;
        const hoy = new Date(); const cumple = new Date(fecha);
        let edad = hoy.getFullYear() - cumple.getFullYear();
        if (hoy.getMonth() < cumple.getMonth() || (hoy.getMonth() === cumple.getMonth() && hoy.getDate() < cumple.getDate())) edad--;
        return edad;
    };

    const login = async (rol: UserRole, clave: string, nombre: string, campo: string, fechaNac: string) => {
        setIsLoading(true);
        try {
            // 1. Validar la contraseña primero
            if (!AuthService.validarCredenciales(rol, clave)) {
                return { exito: false, mensaje: "Clave incorrecta." };
            }
            
            // 2. Si es Admin, entra directo y RECARGA la página
            if (rol === 'ADMIN') {
                AuthService.sesion.guardar('ADMIN', null);
                window.location.reload(); // <--- ESTA ES LA MAGIA QUE FALTABA
                return { exito: true, mensaje: "Bienvenido Director" };
            }

            // 3. Si es otro rol, revisa Firebase
            const usuarioExistente = await AuthService.buscarUsuario(rol, nombre);
            
            // Si no existe, envía solicitud de registro
            if (!usuarioExistente) {
                const edad = calcularEdad(fechaNac);
                await AuthService.registrarSolicitud({ nombre, rol, campo, fechaNacimiento: fechaNac, edad, clase: rol } as any);
                return { exito: true, mensaje: "SOLICITUD_ENVIADA" };
            }

            // Si ya está aprobado (Activo), entra y RECARGA la página
            if (usuarioExistente.estado === 'Activo') {
                AuthService.sesion.guardar(rol, usuarioExistente);
                window.location.reload(); // <--- ESTA ES LA MAGIA QUE FALTABA
                return { exito: true, mensaje: "ACCESO_CONCEDIDO" };
            }

            // Si existe pero aún no lo aprueba el Admin
            return { exito: true, mensaje: "PENDIENTE_APROBACION" };
            
        } catch (error) {
            console.error("Error en Firebase:", error);
            return { exito: false, mensaje: "Error de conexión con la base de datos." };
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        AuthService.sesion.borrar();
        window.location.reload(); // También recargamos al salir
    };

    return { login, logout, isLoading, userRole, userData };
};
