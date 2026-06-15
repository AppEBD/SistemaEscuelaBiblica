import { collection, onSnapshot, addDoc, deleteDoc, doc, query } from 'firebase/firestore';
import { db } from '../../../core/firebase/firebase.config';
import { Transaccion } from '../domain/finance.model';

export const FinanceService = {
    suscribirTransacciones: (callback: (transacciones: Transaccion[]) => void) => {
        const q = query(collection(db, 'finanzas_transacciones'));
        return onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaccion));
            callback(data);
        });
    },

    registrarTransaccion: async (transaccion: Transaccion) => {
        return await addDoc(collection(db, 'finanzas_transacciones'), transaccion);
    },

    eliminarTransaccion: async (id: string) => {
        return await deleteDoc(doc(db, 'finanzas_transacciones', id));
    }
};
