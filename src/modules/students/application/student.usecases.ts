import { AlumnosService } from '../infrastructure/alumnos.service';
import { Alumno, AsistenciaDia } from '../domain/student.model';

export const StudentUseCases = {
    obtenerAlumnosActivos: (campo: string, callback: (alumnos: Alumno[]) => void) => {
        return AlumnosService.suscribirAlumnosPorCampo(campo, (alumnos) => {
            // BLINDAJE: Si un niño no tiene nombre, no rompe el sistema
            const ordenados = (alumnos || []).sort((a, b) => {
                const nameA = a.nombre || '';
                const nameB = b.nombre || '';
                return nameA.localeCompare(nameB);
            });
            callback(ordenados);
        });
    },

    suscribirAsistenciasActivas: (campo: string, callback: (asistencias: AsistenciaDia[]) => void) => {
        return AlumnosService.suscribirAsistenciasPorCampo(campo, callback);
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

    obtenerHistorialCompleto: async (campo: string) => {
        const historial = await AlumnosService.obtenerHistorialAsistencias(campo);
        return (historial || []).sort((a, b) => {
            const timeA = a.fecha ? new Date(a.fecha).getTime() : 0;
            const timeB = b.fecha ? new Date(b.fecha).getTime() : 0;
            return timeB - timeA;
        });
    }
};
