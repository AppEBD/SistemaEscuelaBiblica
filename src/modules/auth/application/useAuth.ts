import { useState, useEffect } from 'react';
import { AuthService } from '../infrastructure/auth.service';
import { UserRole, AuthUser } from '../domain/auth.model';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../../core/firebase/firebase.config';
import { calcularEdadExacta } from '../../../core/utils/date.utils'; 

export const useAuth = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [userRole, setUserRole] = useState<UserRole | null>(null);
    const [userData, setUserData] = useState<AuthUser | null>(null);

    useEffect(() => {
        const { rol, user } = AuthService.sesion.recuperar();
        
        if (rol && user && user.id && rol !== 'ADMIN') {
            setUserRole(rol as UserRole);
            setUserData(user);

            const coleccion = AuthService.obtenerColeccion(rol);
            const unsubscribe = onSnapshot(doc(db, coleccion, user.id), (docSnap) => {
                if (!docSnap.exists()) {
                    AuthService.sesion.borrar();
                    localStorage.setItem('cuenta_eliminada', 'true');
                    window.location.reload();
                } else {
                    const updatedUser = { id: docSnap.id, ...docSnap.data() } as AuthUser;
                    setUserData(updatedUser);
                    const recordar = localStorage.getItem('rol_dominical') !== null;
                    AuthService.sesion.guardar(rol, updatedUser, recordar);
                }
            });

            return () => unsubscribe();
        } else if (rol === 'ADMIN') {
            setUserRole(rol as UserRole);
        }
    }, []);

    // NUEVO: Agregamos el parámetro "genero"
    const login = async (rol: UserRole, clave: string, nombre: string, campo: string, fechaNac: string, genero: string, recordar: boolean, isVerifying: boolean = false) => {
        setIsLoading(true);
        try {
            if (!AuthService.validarCredenciales(rol, clave)) return { exito: false, mensaje: "Clave incorrecta." };
            
            if (rol === 'ADMIN') {
                AuthService.sesion.guardar('ADMIN', null, recordar);
                return { exito: true, mensaje: "Bienvenido Director" };
            }

            const usuarioExistente = await AuthService.buscarUsuario(rol, nombre);
            
            if (!usuarioExistente) {
                if (isVerifying) return { exito: false, mensaje: "DENEGADO" };
                
                const edad = calcularEdadExacta(fechaNac);
                // NUEVO: Guardamos el género en Firebase
                const nuevoId = await AuthService.registrarSolicitud({ nombre, rol, campo, fechaNacimiento: fechaNac, genero, edad, clase: rol } as any);
                return { exito: true, mensaje: "SOLICITUD_ENVIADA", id: nuevoId };
            }

            if (usuarioExistente.estado === 'Activo') {
                AuthService.sesion.guardar(rol, usuarioExistente, recordar);
                return { exito: true, mensaje: "ACCESO_CONCEDIDO" };
            }

            return { exito: true, mensaje: "PENDIENTE_APROBACION", id: usuarioExistente.id };
        } catch (error) {
            return { exito: false, mensaje: "Error de conexión con la base de datos." };
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => { AuthService.sesion.borrar(); window.location.reload(); };

    return { login, logout, isLoading, userRole, userData };
};
