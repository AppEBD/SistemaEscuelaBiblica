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
    estado: string; 
    ofrenda?: string; 
}

export interface ResumenAsistencia {
    total: number;
    presentes: number;
    ausentes: number;
    permisos: number;
    ofrendaTotal: number;
}

export interface AsistenciaDia {
    id?: string; // Necesario para poder actualizarla si le damos "Editar"
    campo: string;
    fecha: string;
    registros: Record<string, AsistenciaRegistro>;
    resumen: ResumenAsistencia;
    registradoPor: string;
    numeroLeccion: number;  // NUEVO: Número de lección
    leccionDada: boolean;   // NUEVO: ¿Se dio la clase?
    createdAt?: number;
}
