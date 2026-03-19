export type UserRole = 'ADMIN' | 'MAESTRO' | 'AUXILIAR' | 'LOGISTICA' | 'SECRETARIA' | 'TESORERO' | 'PRUEBA';

export interface AuthUser {
    id: string;
    nombre: string;
    rol: UserRole;
    campo: string;
    estado: 'Activo' | 'Pendiente';
    fechaNacimiento?: string;
    edad?: number | null;
    grupo?: string; // Para logística
}

export interface LoginResponse {
    exito: boolean;
    mensaje?: string;
    user?: AuthUser;
}
