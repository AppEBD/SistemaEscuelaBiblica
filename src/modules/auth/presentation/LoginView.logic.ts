import { useState, useEffect, FormEvent } from 'react';
import { useAuth } from '../application/useAuth';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../../core/firebase/firebase.config';
import { AuthService } from '../infrastructure/auth.service';

export const useLoginLogic = () => {
    const { login, isLoading } = useAuth();
    
    const estadoInicial = { rol: '', nombre: '', clave: '', campo: '', birthDay: '', birthMonth: '', birthYear: '' };
    const [form, setForm] = useState(estadoInicial);
    const [status, setStatus] = useState({ error: '', info: '' });
    
    const [recordar, setRecordar] = useState(true);
    const [isPending, setIsPending] = useState(false);
    const [isReturning, setIsReturning] = useState(false);
    const [pendingAuth, setPendingAuth] = useState<{id: string, rol: string} | null>(null);

    const days = Array.from({ length: 31 }, (_, i) => i + 1);
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 91 }, (_, i) => currentYear - 10 - i);

    useEffect(() => {
        if (localStorage.getItem('cuenta_eliminada')) {
            localStorage.removeItem('cuenta_eliminada');
            setStatus({ info: '', error: 'Tu cuenta ha sido eliminada permanentemente por el administrador.' });
            return;
        }

        const pendingData = localStorage.getItem('usuario_en_espera');
        if (pendingData) {
            const datos = JSON.parse(pendingData);
            setForm(datos.form);
            setIsPending(true);
            setPendingAuth({ id: datos.id, rol: datos.form.rol });
            setStatus({ error: '', info: "Tu cuenta está pendiente de aprobación." });
        } else {
            const recentData = localStorage.getItem('usuario_reciente');
            if (recentData) {
                setForm(JSON.parse(recentData));
                setIsReturning(true);
            }
        }
    }, []);

    useEffect(() => {
        if (!pendingAuth) return;
        const coleccion = AuthService.obtenerColeccion(pendingAuth.rol);
        const unsubscribe = onSnapshot(doc(db, coleccion, pendingAuth.id), (docSnap) => {
            if (!docSnap.exists()) {
                localStorage.removeItem('usuario_en_espera');
                setPendingAuth(null);
                setIsPending(false);
                setForm(estadoInicial);
                setStatus({ info: '', error: "Tu solicitud fue DENEGADA. Los datos han sido borrados." });
            } else if (docSnap.data().estado === 'Activo') {
                localStorage.removeItem('usuario_en_espera');
                setPendingAuth(null);
                AuthService.sesion.guardar(pendingAuth.rol, { id: docSnap.id, ...docSnap.data() }, recordar);
                window.location.reload();
            }
        });
        return () => unsubscribe();
    }, [pendingAuth, recordar]);

    const handleLogin = async (e: FormEvent) => {
        e.preventDefault();
        setStatus({ error: '', info: '' });

        if (!form.rol) return setStatus({ ...status, error: "Selecciona tu usuario arriba." });

        let fechaCompleta = '';
        if (form.rol !== 'ADMIN') {
            if (!form.birthDay || !form.birthMonth || !form.birthYear) {
                return setStatus({ ...status, error: "Completa tu fecha de nacimiento." });
            }
            fechaCompleta = `${form.birthYear}-${form.birthMonth}-${form.birthDay}`;
        }

        const res = await login(form.rol as any, form.clave, form.nombre, form.campo, fechaCompleta, recordar, isPending);
        
        if (!res.exito) {
            if (res.mensaje === "DENEGADO") {
                localStorage.removeItem('usuario_en_espera');
                setIsPending(false); setForm(estadoInicial);
                setStatus({ info: '', error: "Tu solicitud fue DENEGADA por el Director." });
            } else {
                setStatus({ ...status, error: res.mensaje });
            }
        } else if (res.mensaje === "SOLICITUD_ENVIADA" || res.mensaje === "PENDIENTE_APROBACION") {
            localStorage.setItem('usuario_en_espera', JSON.stringify({ id: res.id, form }));
            setIsPending(true); setIsReturning(false);
            setPendingAuth({ id: res.id, rol: form.rol });
            setStatus({ ...status, info: "Tu cuenta está pendiente. Espera a que el Director te apruebe." });
        } else if (res.mensaje === "ACCESO_CONCEDIDO" || res.mensaje === "Bienvenido Director") {
            localStorage.setItem('usuario_reciente', JSON.stringify(form));
            window.location.reload();
        }
    };

    const limpiarCuenta = () => {
        localStorage.removeItem('usuario_en_espera');
        localStorage.removeItem('usuario_reciente');
        setPendingAuth(null);
        setIsPending(false); setIsReturning(false);
        setForm(estadoInicial);
        setStatus({ info: '', error: '' });
    };

    return {
        form, setForm, status, recordar, setRecordar, isPending, isReturning, isLoading,
        days, months, years, handleLogin, limpiarCuenta
    };
};
