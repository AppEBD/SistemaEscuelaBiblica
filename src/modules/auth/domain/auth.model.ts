export type UserRole = 'ADMIN' | 'MAESTRO' | 'AUXILIAR' | 'LOGISTICA' | 'SECRETARIA' | 'TESORERO' | 'PRUEBA';

export interface AuthUser {
    id: string;
    nombre: string;
    rol: UserRole;
    campo: string;
    estado: 'Activo' | 'Pendiente';
    fechaNacimiento?: string;
    edad?: number | null;
    grupo?: string;
    clase?: string;
    fechaInicioServicio?: string; // NUEVO: Fecha en la que inició el ministerio
    insignias?: string[]; // NUEVO: Array para guardar los ID de las insignias asignadas
}
