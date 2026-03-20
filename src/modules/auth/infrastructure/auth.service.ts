import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../../../core/firebase/firebase.config';
import { AuthUser, UserRole } from '../domain/auth.model';

const CLAVES: Record<string, string> = {
    ADMIN: "@Admin2026",
    MAESTRO: "2222",
    AUXILIAR: "3333",
    LOGISTICA: "4444",
    SECRETARIA: "5555",
    TESORERO: "8888",
    PRUEBA: "@Dev2026"
};

export const AuthService = {
    validarCredenciales: (rol: UserRole, clave: string): boolean => CLAVES[rol] === clave,

    buscarUsuario: async (rol: UserRole, nombre: string): Promise<AuthUser | null> => {
        const q = query(collection(db, "maestros"), where("nombre", "==", nombre.trim()), where("clase", "==", rol));
        const snapshot = await getDocs(q);
        if (snapshot.empty) return null;
        return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as AuthUser;
    },

    registrarSolicitud: async (datos: Partial<AuthUser>) => {
        await addDoc(collection(db, "maestros"), { ...datos, estado: 'Pendiente', createdAt: Date.now() });
    },

    sesion: {
        guardar: (rol: string, datos: AuthUser | null) => {
            localStorage.setItem('rol_dominical', rol);
            if (datos) localStorage.setItem('datos_usuario_dominical', JSON.stringify(datos));
        },
        recuperar: () => ({
            rol: localStorage.getItem('rol_dominical'),
            user: localStorage.getItem('datos_usuario_dominical') ? JSON.parse(localStorage.getItem('datos_usuario_dominical')!) : null
        }),
        borrar: () => {
            localStorage.removeItem('rol_dominical');
            localStorage.removeItem('datos_usuario_dominical');
        }
    }
};
