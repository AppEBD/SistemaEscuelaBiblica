export interface Alumno {
    id?: string;
    nombre: string;
    fechaNacimiento: string;
    edad: number | string;
    genero: string;
    campo: string;
    createdAt?: number;
    updatedAt?: number;
    registradoPor?: string;
    actualizadoPor?: string;
}

export interface AsistenciaRegistro {
    estado: string; // 'Presente' | 'Ausente' | 'Permiso'
    ofrenda: string;
}

export interface ResumenAsistencia {
    total: number;
    presentes: number;
    ausentes: number;
    permisos: number;
    ofrendaTotal: number;
}

export interface AsistenciaDia {
    campo: string;
    fecha: string;
    registros: Record<string, AsistenciaRegistro>;
    resumen: ResumenAsistencia;
    registradoPor: string;
    createdAt?: number;
}
