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

    // === NUEVO: SUSCRIPCIÓN EN TIEMPO REAL A LAS ASISTENCIAS ===
    suscribirAsistenciasPorCampo: (campo: string, callback: (asistencias: AsistenciaDia[]) => void) => {
        const q = query(collection(db, 'asistencias'), where('campo', '==', campo));
        return onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AsistenciaDia));
            callback(data);
        });
    },
    
    crearAlumno: async (alumno: Alumno) => await addDoc(collection(db, 'alumnos'), alumno),
    actualizarAlumno: async (id: string, alumno: Partial<Alumno>) => await updateDoc(doc(db, 'alumnos', id), alumno),
    eliminarAlumno: async (id: string) => await deleteDoc(doc(db, 'alumnos', id)),

    guardarAsistencia: async (asistencia: AsistenciaDia) => await addDoc(collection(db, 'asistencias'), asistencia),
    actualizarAsistenciaDoc: async (id: string, asistencia: Partial<AsistenciaDia>) => await updateDoc(doc(db, 'asistencias', id), asistencia),

    // Se conservan por si algún reporte antiguo las necesita
    obtenerUltimaAsistencia: async (campo: string) => {
        const q = query(collection(db, 'asistencias'), where('campo', '==', campo));
        const snapshot = await getDocs(q);
        if (snapshot.empty) return null;
        const asistencias = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AsistenciaDia));
        asistencias.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        return asistencias[0];
    },

    obtenerHistorialAsistencias: async (campo: string) => {
        const q = query(collection(db, 'asistencias'), where('campo', '==', campo));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AsistenciaDia));
    }
};
