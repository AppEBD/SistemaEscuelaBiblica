import { AlumnosService } from '../infrastructure/alumnos.service';
import { Alumno, AsistenciaDia } from '../domain/student.model';

export const StudentUseCases = {
    obtenerAlumnosActivos: (campo: string, callback: (alumnos: Alumno[]) => void) => {
        return AlumnosService.suscribirAlumnosPorCampo(campo, (alumnos) => {
            // Regla de negocio: Siempre entregarlos ordenados de la A a la Z
            const ordenados = alumnos.sort((a, b) => a.nombre.localeCompare(b.nombre));
            callback(ordenados);
        });
    },
    
    registrarAlumno: async (alumno: Omit<Alumno, 'id'>) => {
        await AlumnosService.crearAlumno({ ...alumno, createdAt: Date.now() });
    },
    
    editarAlumno: async (id: string, alumno: Partial<Alumno>) => {
        await AlumnosService.actualizarAlumno(id, { ...alumno, updatedAt: Date.now() });
    },
    
    borrarAlumno: async (id: string) => {
        await AlumnosService.eliminarAlumno(id);
    },

    registrarAsistenciaDiaria: async (asistencia: AsistenciaDia) => {
        await AlumnosService.guardarAsistencia({ ...asistencia, createdAt: Date.now() });
    }
};
