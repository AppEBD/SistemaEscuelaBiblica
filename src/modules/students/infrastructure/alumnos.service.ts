import { collection, onSnapshot, doc, addDoc, updateDoc, deleteDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../core/firebase/firebase.config';
import { Alumno, AsistenciaDia } from '../domain/student.model';

export const AlumnosService = {
    suscribirAlumnosPorCampo: (campo: string, callback: (alumnos: Alumno[]) => void) => {
        const q = query(collection(db, 'alumnos'), where('campo', '==', campo));
        return onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Alumno));
            callback(data);
        });
    },
    
    crearAlumno: async (alumno: Alumno) => await addDoc(collection(db, 'alumnos'), alumno),
    actualizarAlumno: async (id: string, alumno: Partial<Alumno>) => await updateDoc(doc(db, 'alumnos', id), alumno),
    eliminarAlumno: async (id: string) => await deleteDoc(doc(db, 'alumnos', id)),

    guardarAsistencia: async (asistencia: AsistenciaDia) => await addDoc(collection(db, 'asistencias'), asistencia),
    
    // NUEVO: Para actualizar la asistencia si el maestro le da a "Editar datos"
    actualizarAsistenciaDoc: async (id: string, asistencia: Partial<AsistenciaDia>) => await updateDoc(doc(db, 'asistencias', id), asistencia),

    // NUEVO: Busca la última vez que el maestro pasó lista para auto-sumar la lección
    obtenerUltimaAsistencia: async (campo: string) => {
        const q = query(collection(db, 'asistencias'), where('campo', '==', campo));
        const snapshot = await getDocs(q);
        if (snapshot.empty) return null;
        
        // Ordenamos en memoria para obtener la más reciente
        const asistencias = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AsistenciaDia));
        asistencias.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        return asistencias[0];
    }
};
