import { useState, useEffect, FormEvent, useMemo } from 'react';
import { getAuth, signOut } from 'firebase/auth'; 
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../../core/firebase/firebase.config';
import { useAuth } from '../../auth/application/useAuth';
import { FinanceService } from '../infrastructure/finance.service';
import { Transaccion } from '../domain/finance.model';

export const useSecretariaLogic = () => {
    const { userData, logout } = useAuth(); 
    const [insigniasGlobales, setInsigniasGlobales] = useState<any[]>([]);

    // Estados de interfaz general
    const [mainTab, setMainTab] = useState<'home' | 'reportes' | 'documentos'>('home');
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [cargando, setCargando] = useState(true);
    
    // Temas de colores
    const [appTheme, setAppTheme] = useState<'indigo' | 'emerald' | 'rose' | 'amber'>(() => {
        return (localStorage.getItem('ebd_theme_v2') as any) || 'indigo';
    });

    useEffect(() => { localStorage.setItem('ebd_theme_v2', appTheme); }, [appTheme]);

    // Modal Universal de Confirmación
    const [confirmState, setConfirmState] = useState({
        isOpen: false, title: '', message: '', confirmText: '', type: 'danger' as 'danger' | 'warning' | 'success', onConfirm: async () => {}
    });

    const mostrarExito = (mensaje: string) => { setConfirmState({ isOpen: true, title: '✅ Operación Exitosa', message: mensaje, type: 'success', confirmText: 'Aceptar', onConfirm: async () => setConfirmState(prev => ({...prev, isOpen: false})) }); };
    const mostrarError = (mensaje: string) => { setConfirmState({ isOpen: true, title: '❌ Error', message: mensaje, type: 'danger', confirmText: 'Entendido', onConfirm: async () => setConfirmState(prev => ({...prev, isOpen: false})) }); };

    // ==========================================
    // SISTEMA FINANCIERO (FONDOS Y REPORTES)
    // ==========================================
    const [transacciones, setTransacciones] = useState<Transaccion[]>([]);
    const [isTxModalOpen, setIsTxModalOpen] = useState(false);
    
    // Eliminamos la fecha manual del estado inicial
    const estadoTxInicial = { tipo: 'ingreso' as 'ingreso' | 'retiro', monto: '', motivo: '', descripcion: '' };
    const [txForm, setTxForm] = useState(estadoTxInicial);

    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

    useEffect(() => {
        // Suscripción a insignias
        const unsubInsignias = onSnapshot(collection(db, 'insignias_creadas'), (snap) => {
            setInsigniasGlobales(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });

        // Suscripción a transacciones financieras
        const unsubFinanzas = FinanceService.suscribirTransacciones((datos) => {
            setTransacciones(datos);
            setCargando(false);
        });
        
        return () => { unsubInsignias(); unsubFinanzas(); };
    }, []);

    const cerrarSesionApp = () => {
        if (window.confirm("¿Estás seguro de que deseas cerrar sesión?")) {
            if (logout) { logout(); } else { const auth = getAuth(); signOut(auth).then(() => window.location.reload()); }
        }
    };

    // Cálculos financieros automáticos
    const totalFondos = useMemo(() => {
        return transacciones.reduce((total, tx) => {
            return tx.tipo === 'ingreso' ? total + tx.monto : total - tx.monto;
        }, 0);
    }, [transacciones]);

    // Agrupación en Acordeón por Meses y Semanas
    const agruparTransaccionesPorMes = () => {
        const grupos: Record<string, { totalIngresos: number, totalRetiros: number, semanas: Record<string, Transaccion[]> }> = {};
        const txsOrdenadas = [...transacciones].sort((a, b) => b.createdAt - a.createdAt);

        txsOrdenadas.forEach(tx => {
            const dateObj = new Date(tx.fecha + 'T12:00:00');
            const mesStr = `${months[dateObj.getMonth()]} ${dateObj.getFullYear()}`;
            const semanaNum = Math.ceil(dateObj.getDate() / 7);
            const semanaStr = `Semana ${semanaNum}`;

            if (!grupos[mesStr]) grupos[mesStr] = { totalIngresos: 0, totalRetiros: 0, semanas: {} };
            if (!grupos[mesStr].semanas[semanaStr]) grupos[mesStr].semanas[semanaStr] = [];

            grupos[mesStr].semanas[semanaStr].push(tx);
            if (tx.tipo === 'ingreso') grupos[mesStr].totalIngresos += tx.monto;
            if (tx.tipo === 'retiro') grupos[mesStr].totalRetiros += tx.monto;
        });

        return grupos;
    };

    // Guardar Transacción con Fecha y Hora Automática
    const guardarTransaccion = async (e: FormEvent) => {
        e.preventDefault();
        const montoNum = parseFloat(txForm.monto);
        
        if (isNaN(montoNum) || montoNum <= 0) {
            mostrarError("El monto debe ser mayor a cero.");
            return;
        }

        if (txForm.tipo === 'retiro' && montoNum > totalFondos) {
            mostrarError("Fondos insuficientes. No puedes retirar más dinero del que hay en caja.");
            return;
        }

        // Generamos la fecha y hora exacta en el momento de darle clic a guardar
        const ahora = new Date();
        const fechaActual = ahora.toISOString().split('T')[0]; // Formato YYYY-MM-DD
        const horaActual = ahora.toLocaleTimeString('es-SV', { hour: '2-digit', minute: '2-digit', hour12: true });

        try {
            await FinanceService.registrarTransaccion({
                tipo: txForm.tipo,
                monto: montoNum,
                motivo: txForm.motivo,
                descripcion: txForm.descripcion,
                fecha: fechaActual,
                hora: horaActual,
                registradoPor: userData?.nombre || 'Secretaría',
                createdAt: ahora.getTime()
            });
            setIsTxModalOpen(false);
            setTxForm(estadoTxInicial);
            mostrarExito(`Se registró un ${txForm.tipo} por $${montoNum.toFixed(2)}.`);
        } catch (error) {
            mostrarError("Ocurrió un error al guardar la transacción.");
        }
    };

    // Eliminar Transacción
    const solicitarEliminarTx = (id: string | undefined, tipo: string, monto: number) => {
        if (!id) return;
        setConfirmState({
            isOpen: true, 
            title: 'Eliminar Registro', 
            message: `¿Estás seguro de que deseas eliminar este ${tipo} de $${monto.toFixed(2)}?\n\nEl fondo total se recalculará automáticamente.`, 
            type: 'danger', 
            confirmText: 'Sí, Eliminar',
            onConfirm: async () => {
                try {
                    await FinanceService.eliminarTransaccion(id);
                    setConfirmState(prev => ({...prev, isOpen: false}));
                    setTimeout(() => mostrarExito("Registro eliminado con éxito."), 300);
                } catch (error) {
                    mostrarError("No se pudo eliminar el registro.");
                }
            }
        });
    };

    return {
        userData, cargando, mainTab, setMainTab,
        isProfileOpen, setIsProfileOpen, appTheme, setAppTheme, cerrarSesionApp, insigniasGlobales,
        confirmState, setConfirmState,
        // Datos Financieros
        transacciones, totalFondos, agruparTransaccionesPorMes,
        isTxModalOpen, setIsTxModalOpen, txForm, setTxForm,
        guardarTransaccion, solicitarEliminarTx, estadoTxInicial
    };
};
