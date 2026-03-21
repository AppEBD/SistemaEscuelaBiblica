import { useState, useEffect } from 'react';
import { AuthService } from '../infrastructure/auth.service';
import { UserRole, AuthUser } from '../domain/auth.model';

export const useAuth = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [userRole, setUserRole] = useState<UserRole | null>(null);
    const [userData, setUserData] = useState<AuthUser | null>(null);

    useEffect(() => {
        const { rol, user } = AuthService.sesion.recuperar();
        if (rol) { setUserRole(rol as UserRole); setUserData(user); }
    }, []);

    const calcularEdad = (fecha: string): number | null => {
        if (!fecha) return null;
        const hoy = new Date(); const cumple = new Date(fecha);
        let edad = hoy.getFullYear() - cumple.getFullYear();
        if (hoy.getMonth() < cumple.getMonth() || (hoy.getMonth() === cumple.getMonth() && hoy.getDate() < cumple.getDate())) edad--;
        return edad;
    };

    // Agregamos el parámetro recordar
    const login = async (rol: UserRole, clave: string, nombre: string, campo: string, fechaNac: string, recordar: boolean) => {
        setIsLoading(true);
        try {
            if (!AuthService.validarCredenciales(rol, clave)) return { exito: false, mensaje: "Clave incorrecta." };
            
            if (rol === 'ADMIN') {
                AuthService.sesion.guardar('ADMIN', null, recordar);
                window.location.reload();
                return { exito: true, mensaje: "Bienvenido Director" };
            }

            const usuarioExistente = await AuthService.buscarUsuario(rol, nombre);
            
            if (!usuarioExistente) {
                const edad = calcularEdad(fechaNac);
                await AuthService.registrarSolicitud({ nombre, rol, campo, fechaNacimiento: fechaNac, edad, clase: rol } as any);
                return { exito: true, mensaje: "SOLICITUD_ENVIADA" };
            }

            if (usuarioExistente.estado === 'Activo') {
                AuthService.sesion.guardar(rol, usuarioExistente, recordar);
                window.location.reload();
                return { exito: true, mensaje: "ACCESO_CONCEDIDO" };
            }

            return { exito: true, mensaje: "PENDIENTE_APROBACION" };
        } catch (error) {
            return { exito: false, mensaje: "Error de conexión con la base de datos." };
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => { AuthService.sesion.borrar(); window.location.reload(); };

    return { login, logout, isLoading, userRole, userData };
};
