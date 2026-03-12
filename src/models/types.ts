// src/models/types.ts

// 1. TIPOS DE USUARIOS (Roles)
export type RolUsuario = 'Director' | 'MAESTRO' | 'AUXILIAR' | 'LOGISTICA' | 'SECRETARIA' | 'TESORERO';
export type EstadoUsuario = 'Activo' | 'Pendiente' | 'Inactivo';

export interface Usuario {
  id: string;
  nombre: string;
  correo: string;
  clase: RolUsuario;
  campo?: string; 
  grupo?: string; 
  estado: EstadoUsuario;
  fechaNacimiento?: string;
}

// 2. MODELO DE ALUMNOS
export type Genero = 'M' | 'F';

export interface Alumno {
  id: string;
  nombre: string;
  edad: number;
  genero: Genero;
  campo: string;
  fechaNacimiento?: string;
  activo: boolean;
}

// 3. MODELO DE ASISTENCIAS Y OFRENDAS
export type EstadoAsistencia = 'Presente' | 'Ausente' | 'Permiso';

export interface RegistroAsistencia {
  idAlumno: string;
  nombre: string;
  estado: EstadoAsistencia;
}

export interface ClaseImpartida {
  id?: string;
  fecha: string; // Formato YYYY-MM-DD
  timestamp: number;
  campo: string;
  maestroId: string;
  maestroNombre: string;
  leccion: number;
  leccionImpartida: boolean;
  ofrenda: number; 
  totales: {
    presentes: number;
    ausentes: number;
    permisos: number;
  };
  registros: RegistroAsistencia[]; 
}

// 4. MODELO DE FINANZAS (Tesorero / Secretaria)
export type TipoTransaccion = 'ingreso' | 'egreso';

export interface TransaccionFinanciera {
  id?: string;
  tipo: TipoTransaccion;
  monto: number;
  descripcion: string;
  fecha: string; 
  timestamp: number;
  registradoPorId: string;
  registradoPorNombre: string;
  entidad: 'Tesoreria' | 'Secretaria'; 
}
