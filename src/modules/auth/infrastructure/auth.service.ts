import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../../../core/firebase/firebase.config';
import { AuthUser, UserRole } from '../domain/auth.model';

const CLAVES: Record<string, string> = {
    ADMIN: "1111", MAESTRO: "2222", AUXILIAR: "3333",
    LOGISTICA: "4444", SECRETARIA: "5555", TESORERO: "8888"
};

export const AuthService = {
    validarCredenciales: (rol: UserRole, clave: string): boolean => CLAVES[rol] === clave,

    // ¡NUEVO! Crea una carpeta en la base de datos según el rol
    obtenerColeccion: (rol: string) => `usuarios_${rol.toLowerCase()}`,

    buscarUsuario: async (rol: UserRole, nombre: string): Promise<AuthUser | null> => {
        const coleccionNombre = AuthService.obtenerColeccion(rol);
        // Normalizamos el nombre (sin espacios extra y en minúsculas) para evitar duplicados
        const nombreBuscable = nombre.trim().toLowerCase(); 
        
        const q = query(collection(db, coleccionNombre), where("nombreNormalizado", "==", nombreBuscable));
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
            // Buscamos a los viejos usuarios (por si tienes algunos creados antes de esta actualización)
            const qAntiguo = query(collection(db, coleccionNombre), where("nombre", "==", nombre.trim()));
            const snapAntiguo = await getDocs(qAntiguo);
            if(snapAntiguo.empty) return null;
            return { id: snapAntiguo.docs[0].id, ...snapAntiguo.docs[0].data() } as AuthUser;
        }
        
        return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as AuthUser;
    },

    registrarSolicitud: async (datos: Partial<AuthUser>) => {
        const coleccionNombre = AuthService.obtenerColeccion(datos.rol || 'MAESTRO');
        const nombreBuscable = datos.nombre ? datos.nombre.trim().toLowerCase() : '';
        
        const docRef = await addDoc(collection(db, coleccionNombre), { 
            ...datos, 
            nombreNormalizado: nombreBuscable, // Guardamos el nombre oculto anti-duplicados
            estado: 'Pendiente', 
            createdAt: Date.now() 
        });
        return docRef.id;
    },

    sesion: {
        guardar: (rol: string, datos: AuthUser | null, recordar: boolean) => {
            const storage = recordar ? localStorage : sessionStorage;
            storage.setItem('rol_dominical', rol);
            if (datos) storage.setItem('datos_usuario_dominical', JSON.stringify(datos));
        },
        recuperar: () => {
            const rol = localStorage.getItem('rol_dominical') || sessionStorage.getItem('rol_dominical');
            const user = localStorage.getItem('datos_usuario_dominical') || sessionStorage.getItem('datos_usuario_dominical');
            return { rol, user: user ? JSON.parse(user) : null };
        },
        borrar: () => {
            localStorage.removeItem('rol_dominical'); localStorage.removeItem('datos_usuario_dominical');
            sessionStorage.removeItem('rol_dominical'); sessionStorage.removeItem('datos_usuario_dominical');
        }
    }
};
