import { AlumnosService } from '../infrastructure/alumnos.service';
import { Alumno, AsistenciaDia } from '../domain/student.model';

export const StudentUseCases = {
    obtenerAlumnosActivos: (campo: string, callback: (alumnos: Alumno[]) => void) => {
        return AlumnosService.suscribirAlumnosPorCampo(campo, (alumnos) => {
            const ordenados = alumnos.sort((a, b) => a.nombre.localeCompare(b.nombre));
            callback(ordenados);
        });
    },
    
    registrarAlumno: async (alumno: Omit<Alumno, 'id'>) => await AlumnosService.crearAlumno({ ...alumno, createdAt: Date.now() }),
    editarAlumno: async (id: string, alumno: Partial<Alumno>) => await AlumnosService.actualizarAlumno(id, { ...alumno, updatedAt: Date.now() }),
    borrarAlumno: async (id: string) => await AlumnosService.eliminarAlumno(id),

    registrarAsistenciaDiaria: async (asistencia: AsistenciaDia) => {
        if (asistencia.id) {
            const { id, ...data } = asistencia;
            await AlumnosService.actualizarAsistenciaDoc(id, data);
            return id;
        } else {
            const docRef = await AlumnosService.guardarAsistencia({ ...asistencia, createdAt: Date.now() });
            return docRef.id;
        }
    },

    obtenerUltimaAsistencia: async (campo: string) => await AlumnosService.obtenerUltimaAsistencia(campo),

    // NUEVO: Trae el historial y lo ordena por fecha
    obtenerHistorialCompleto: async (campo: string) => {
        const historial = await AlumnosService.obtenerHistorialAsistencias(campo);
        return historial.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
    }
};
