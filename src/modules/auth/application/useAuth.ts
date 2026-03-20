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
        const hoy = new Date();
        const cumple = new Date(fecha);
        let edad = hoy.getFullYear() - cumple.getFullYear();
        if (
            hoy.getMonth() < cumple.getMonth() ||
            (hoy.getMonth() === cumple.getMonth() && hoy.getDate() < cumple.getDate())
        ) edad--;
        return edad;
    };

    const login = async (
        rol: UserRole,
        clave: string,
        nombre: string,
        campo: string,
        fechaNac: string
    ): Promise<{ exito: boolean; mensaje: string }> => {
        // Validaciones básicas antes de llamar a Firebase
        if (!rol) return { exito: false, mensaje: "Selecciona un rol." };
        if (!clave) return { exito: false, mensaje: "Ingresa tu contraseña." };

        setIsLoading(true);
        try {
            // 1. Validar credenciales (clave del rol)
            if (!AuthService.validarCredenciales(rol, clave)) {
                return { exito: false, mensaje: "Clave incorrecta." };
            }

            // 2. Flujo ADMIN — no necesita nombre ni campo
            if (rol === 'ADMIN') {
                const adminUser: AuthUser = {
                    id: 'admin',
                    nombre: 'Director',
                    rol: 'ADMIN',
                    campo: 'Sede Central',
                    estado: 'Activo',
                };
                AuthService.sesion.guardar('ADMIN', adminUser);
                setUserRole('ADMIN');
                setUserData(adminUser);
                return { exito: true, mensaje: "Bienvenido Director" };
            }

            // 3. Validar campos obligatorios para otros roles
            if (!nombre.trim()) return { exito: false, mensaje: "Ingresa tu nombre completo." };
            if (!campo) return { exito: false, mensaje: "Selecciona tu campo." };
            if (!fechaNac) return { exito: false, mensaje: "Ingresa tu fecha de nacimiento." };

            // 4. Buscar usuario en Firestore
            const usuarioExistente = await AuthService.buscarUsuario(rol, nombre);

            // 5. No existe → registrar solicitud
            if (!usuarioExistente) {
                const edad = calcularEdad(fechaNac);
                await AuthService.registrarSolicitud({
                    nombre: nombre.trim(),
                    rol,
                    campo,
                    fechaNacimiento: fechaNac,
                    edad,
                    clase: rol,
                } as any);
                return { exito: true, mensaje: "SOLICITUD_ENVIADA" };
            }

            // 6. Existe pero pendiente
            if (usuarioExistente.estado !== 'Activo') {
                return { exito: true, mensaje: "PENDIENTE_APROBACION" };
            }

            // 7. Activo → guardar sesión y actualizar estado
            AuthService.sesion.guardar(rol, usuarioExistente);
            setUserRole(rol);
            setUserData(usuarioExistente);
            return { exito: true, mensaje: "ACCESO_CONCEDIDO" };

        } catch (error) {
            console.error("Error en login:", error);
            return { exito: false, mensaje: "Error de conexión. Intenta de nuevo." };
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        AuthService.sesion.borrar();
        setUserRole(null);
        setUserData(null);
    };

    return { login, logout, isLoading, userRole, userData };
};
