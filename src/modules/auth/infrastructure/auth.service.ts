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
    // Validar clave estática
    validarCredenciales: (rol: UserRole, clave: string): boolean => {
        return CLAVES[rol] === clave;
    },

    // Buscar usuario en Firestore
    buscarUsuario: async (rol: UserRole, nombre: string): Promise<AuthUser | null> => {
        const q = query(
            collection(db, "maestros"), 
            where("nombre", "==", nombre.trim()),
            where("clase", "==", rol)
        );
        const snapshot = await getDocs(q);
        if (snapshot.empty) return null;
        
        const doc = snapshot.docs[0];
        return { id: doc.id, ...doc.data() } as AuthUser;
    },

    // Registrar solicitud nueva si no existe
    registrarSolicitud: async (datos: Partial<AuthUser>) => {
        await addDoc(collection(db, "maestros"), {
            ...datos,
            estado: 'Pendiente',
            createdAt: Date.now()
        });
    },

    // Persistencia en LocalStorage
    sesion: {
        guardar: (rol: string, datos: AuthUser | null) => {
            localStorage.setItem('rol_dominical', rol);
            if (datos) localStorage.setItem('datos_usuario_dominical', JSON.stringify(datos));
        },
        recuperar: () => {
            const rol = localStorage.getItem('rol_dominical');
            const datos = localStorage.getItem('datos_usuario_dominical');
            return { rol, user: datos ? JSON.parse(datos) : null };
        },
        borrar: () => {
            localStorage.removeItem('rol_dominical');
            localStorage.removeItem('datos_usuario_dominical');
        }
    }
};
