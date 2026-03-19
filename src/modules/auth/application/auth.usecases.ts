import { useState } from 'react';
import { AuthService } from '../infrastructure/auth.service';
import { UserRole, AuthUser } from '../domain/auth.model';

export const useAuth = () => {
    const [isLoading, setIsLoading] = useState(false);

    const calcularEdad = (fecha: string): number | null => {
        if (!fecha) return null;
        const hoy = new Date();
        const cumple = new Date(fecha);
        let edad = hoy.getFullYear() - cumple.getFullYear();
        if (hoy.getMonth() < cumple.getMonth() || 
           (hoy.getMonth() === cumple.getMonth() && hoy.getDate() < cumple.getDate())) edad--;
        return edad;
    };

    const login = async (
        rol: UserRole, 
        clave: string, 
        nombre: string, 
        campo: string, 
        fechaNac: string
    ): Promise<{ exito: boolean; mensaje: string }> => {
        setIsLoading(true);
        try {
            // 1. Validar Clave
            if (!AuthService.validarCredenciales(rol, clave)) {
                return { exito: false, mensaje: "Clave incorrecta." };
            }

            // 2. Caso Administrador
            if (rol === 'ADMIN') {
                AuthService.sesion.guardar('ADMIN', null);
                return { exito: true, mensaje: "Bienvenido Director" };
            }

            // 3. Buscar Usuario
            const usuarioExistente = await AuthService.buscarUsuario(rol, nombre);

            if (!usuarioExistente) {
                // Registrar nueva solicitud
                const edad = calcularEdad(fechaNac);
                await AuthService.registrarSolicitud({ 
                    nombre, rol, campo, fechaNacimiento: fechaNac, edad, clase: rol 
                } as any);
                return { exito: true, mensaje: "SOLICITUD_ENVIADA" };
            }

            if (usuarioExistente.estado === 'Activo') {
                AuthService.sesion.guardar(rol, usuarioExistente);
                return { exito: true, mensaje: "ACCESO_CONCEDIDO" };
            }

            return { exito: true, mensaje: "PENDIENTE_APROBACION" };

        } catch (error) {
            return { exito: false, mensaje: "Error de conexión con el servidor." };
        } finally {
            setIsLoading(false);
        }
    };

    return { login, isLoading };
};
