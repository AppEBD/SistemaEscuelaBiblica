export type UserRole = 'ADMIN' | 'MAESTRO' | 'AUXILIAR' | 'LOGISTICA' | 'SECRETARIA' | 'TESORERO' | 'PRUEBA';

export interface AuthUser {
    id: string;
    nombre: string;
    rol: UserRole;
    campo: string;
    genero?: string; // ¡Faltaba esto! Causaba error de compilación en Vercel
    estado: 'Activo' | 'Pendiente';
    fechaNacimiento?: string;
    edad?: number | null;
    grupo?: string;
    clase?: string;
    fechaInicioServicio?: string;
    insignias?: string[];
}
