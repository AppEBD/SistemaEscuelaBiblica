import { collection, onSnapshot, doc, addDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
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
    
    crearAlumno: async (alumno: Alumno) => {
        return await addDoc(collection(db, 'alumnos'), alumno);
    },
    
    actualizarAlumno: async (id: string, alumno: Partial<Alumno>) => {
        return await updateDoc(doc(db, 'alumnos', id), alumno);
    },
    
    eliminarAlumno: async (id: string) => {
        return await deleteDoc(doc(db, 'alumnos', id));
    },

    guardarAsistencia: async (asistencia: AsistenciaDia) => {
        return await addDoc(collection(db, 'asistencias'), asistencia);
    }
};
