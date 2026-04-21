import { useState, useEffect, useMemo } from 'react';
import { doc, collection, onSnapshot, runTransaction, deleteDoc } from 'firebase/firestore';
import { db } from '../../../core/firebase/firebase.config'; 
import { useAuth } from '../../../modules/auth/application/useAuth';

export const useNotifications = () => {
    const { userData } = useAuth();
    const [staffList, setStaffList] = useState<any[]>([]);
    
    const [notificacionesAdmin, setNotificacionesAdmin] = useState<any[]>([]);
    const [showBirthdayOverlay, setShowBirthdayOverlay] = useState(false);
    const [hasShownOverlay, setHasShownOverlay] = useState(false);
    const [reaccionesBD, setReaccionesBD] = useState<Record<string, any>>({});

    // MODAL DE CONFIRMACIÓN PARA EL WIDGET
    const [notifConfirm, setNotifConfirm] = useState({ isOpen: false, id: '' });

    useEffect(() => {
        const unsub = onSnapshot(collection(db, 'interacciones_avisos'), (snapshot) => {
            const reacts: Record<string, any> = {};
            const avisosEnVivo: any[] = [];
            const miRol = userData?.rol || '';

            snapshot.forEach(doc => {
                const data = doc.data();
                reacts[doc.id] = data; 

                const publicoObjetivo = data.targetRole || 'TODOS';
                
                if (publicoObjetivo === 'TODOS' || publicoObjetivo === miRol || miRol === 'ADMIN') {
                    avisosEnVivo.push({
                        id: doc.id,
                        titulo: data.titulo,
                        mensaje: data.mensaje,
                        fecha: data.fecha || 'Reciente',
                        hora: data.hora || '',
                        leida: false,
                        isCumplePersonal: false,
                        isCumpleEquipo: false,
                        createdAt: data.createdAt || 0
                    });
                }
            });

            setReaccionesBD(reacts);
            setNotificacionesAdmin([
                { id: "admin-1", titulo: "Bienvenida al Sistema", mensaje: "¡Bienvenido a EBD 2.0! Aquí aparecerán los avisos de la directiva.", fecha: "Sistema", hora: "", leida: false, createdAt: 0 },
                ...avisosEnVivo
            ]);
        });
        return () => unsub();
    }, [userData?.rol]);

    const manejarReaccion = async (notifId: string, tipo: 'up' | 'down' | 'cake', e: React.MouseEvent) => {
        e.stopPropagation(); 
        const userId = userData?.uid || userData?.id; 
        if (!userId) return;

        try { navigator.vibrate(50); } catch(err){} 
        const docRef = doc(db, 'interacciones_avisos', notifId);

        try {
            await runTransaction(db, async (transaction) => {
                const sfDoc = await transaction.get(docRef);
                const actualData = sfDoc.exists() ? sfDoc.data() : { usuarios: {} };
                const usuarios = actualData.usuarios || {};

                if (usuarios[userId] === tipo) { delete usuarios[userId]; } 
                else { usuarios[userId] = tipo; }

                let up = 0, down = 0, cake = 0;
                Object.values(usuarios).forEach(voto => {
                    if (voto === 'up') up++; if (voto === 'down') down++; if (voto === 'cake') cake++;
                });

                transaction.set(docRef, { up, down, cake, usuarios }, { merge: true });
            });
        } catch (error) { console.error(error); }
    };

    // SOLICITUD ESTÉTICA EN EL WIDGET
    const solicitarEliminarAviso = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setNotifConfirm({ isOpen: true, id });
    };

    const confirmarEliminarAviso = async () => {
        if (!notifConfirm.id) return;
        try {
            await deleteDoc(doc(db, 'interacciones_avisos', notifConfirm.id));
        } catch (error) {}
        setNotifConfirm({ isOpen: false, id: '' });
    };

    useEffect(() => {
        if (!userData) return; 
        
        const colecciones = ['usuarios_maestro', 'usuarios_auxiliar', 'usuarios_logistica', 'usuarios_tesorero', 'usuarios_secretaria'];
        const unsubs: any[] = [];
        const staffMap: Record<string, any[]> = {};
        
        const actualizarStaff = () => {
            const todoElStaff: any[] = [];
            Object.values(staffMap).forEach(lista => todoElStaff.push(...lista));
            setStaffList(todoElStaff);
        };

        colecciones.forEach(nombreCol => {
            try {
                const unsub = onSnapshot(collection(db, nombreCol), (snapshot) => {
                    const listaCol: any[] = [];
                    snapshot.forEach(documento => {
                        const data = documento.data();
                        const rolLimpio = nombreCol.split('_')[1];
                        listaCol.push({ ...data, id: documento.id, rolParaCumple: rolLimpio });
                    });
                    staffMap[nombreCol] = listaCol;
                    actualizarStaff();
                }, () => {});
                unsubs.push(unsub);
            } catch (e) {}
        });

        return () => { unsubs.forEach(unsub => unsub && unsub()); };
    }, [userData]); 

    const currentYear = new Date().getFullYear();

    const { notificacionesCumple, esMiCumpleHoy } = useMemo(() => {
        if (staffList.length === 0) return { notificacionesCumple: [], esMiCumpleHoy: false };
        const hoy = new Date();
        const mmddHoy = `${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;
        const ayer = new Date(hoy); ayer.setDate(hoy.getDate() - 1);
        const mmddAyer = `${String(ayer.getMonth() + 1).padStart(2, '0')}-${String(ayer.getDate()).padStart(2, '0')}`;
        
        const diasDeEstaSemana = new Set<string>();
        const domingo = new Date(hoy); domingo.setDate(hoy.getDate() - hoy.getDay());
        for (let i = 0; i < 7; i++) {
            const dia = new Date(domingo); dia.setDate(domingo.getDate() + i);
            diasDeEstaSemana.add(`${String(dia.getMonth() + 1).padStart(2, '0')}-${String(dia.getDate()).padStart(2, '0')}`);
        }

        const userId = userData?.uid || userData?.id;
        const nombreUsuario = userData?.nombre || 'Equipo';
        let miCumpleFlag = false;

        const cumpleaneros = staffList.filter(user => {
            if (!user || typeof user.fechaNacimiento !== 'string') return false;
            const partes = user.fechaNacimiento.split('-');
            if (partes.length !== 3) return false;
            return diasDeEstaSemana.has(`${partes[1]}-${partes[2]}`);
        }).sort((a, b) => parseInt(a.fechaNacimiento.split('-')[2] || '0', 10) - parseInt(b.fechaNacimiento.split('-')[2] || '0', 10));

        const cards = cumpleaneros.map(c => {
            const esMio = c.id === userId;
            const mmddCumple = c.fechaNacimiento.substring(5);
            const esHoy = mmddCumple === mmddHoy;
            const esAyer = mmddCumple === mmddAyer;
            const yaPaso = mmddCumple < mmddHoy; 

            const diaNum = c.fechaNacimiento.split('-')[2];
            const rolCapitalizado = c.rolParaCumple ? c.rolParaCumple.charAt(0).toUpperCase() + c.rolParaCumple.slice(1) : 'Staff';
            const sedeDisplay = c.campo ? ` - ${c.campo}` : '';
            const notifId = `cumple-${c.id}-${currentYear}`;

            if (esMio) {
                if (esHoy) miCumpleFlag = true;
                return {
                    id: notifId, titulo: esHoy ? "🎉 ¡Feliz Cumpleaños a ti!" : (yaPaso ? "🎉 ¡Esperamos que la hayas pasado genial!" : "🎉 ¡Tu cumpleaños se acerca!"),
                    mensaje: esHoy ? `¡Felicidades, ${nombreUsuario}!` : (yaPaso ? `Tu cumpleaños fue el día ${diaNum}.` : `Tu cumpleaños es esta semana (Día ${diaNum}).`),
                    fecha: esHoy ? "Hoy" : (esAyer ? "Ayer" : "Esta semana"), hora: "", leida: true, isCumplePersonal: true,
                    createdAt: esHoy ? Date.now() + 100000 : Date.now() - 86400000 
                };
            } else {
                return {
                    id: notifId, titulo: esHoy ? `🎂 ¡Hoy es el cumpleaños de ${c.nombre}!` : (yaPaso ? `🎂 Cumpleaños de ${c.nombre}` : `🎂 Cumpleaños de ${c.nombre}`),
                    mensaje: esHoy ? `¡Felicítale! (${rolCapitalizado}${sedeDisplay})` : `El día ${diaNum} es el cumpleaños de ${c.nombre} (${rolCapitalizado}${sedeDisplay}).`,
                    fecha: esHoy ? "Hoy" : (esAyer ? "Ayer" : "Esta semana"), hora: "", leida: true, isCumpleEquipo: true,
                    createdAt: esHoy ? Date.now() + 100000 : Date.now() - 86400000 
                };
            }
        });

        return { notificacionesCumple: cards, esMiCumpleHoy: miCumpleFlag };
    }, [staffList, userData, currentYear]);

    useEffect(() => {
        if (esMiCumpleHoy && !hasShownOverlay) {
            setShowBirthdayOverlay(true); setHasShownOverlay(true);
            const timer = setTimeout(() => setShowBirthdayOverlay(false), 5500);
            return () => clearTimeout(timer);
        }
    }, [esMiCumpleHoy, hasShownOverlay]);

    const notificaciones = useMemo(() => {
        const todas = [...notificacionesCumple, ...notificacionesAdmin];
        return todas.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    }, [notificacionesAdmin, notificacionesCumple]);

    const reproducirSonido = () => { try { const audio = new Audio('https://actions.google.com/sounds/v1/water/droplet_reverb.ogg'); audio.volume = 0.5; audio.play(); } catch (e) {} };
    const marcarNotificacion = (id: string) => { 
        if (id.startsWith('cumple-')) return; 
        setNotificacionesAdmin(prev => prev.map(n => { if (n.id === id && !n.leida) { reproducirSonido(); return { ...n, leida: true }; } return n; })); 
    };

    return { 
        notificaciones, reaccionesBD, manejarReaccion, marcarNotificacion, 
        showBirthdayOverlay, userData, 
        notifConfirm, setNotifConfirm, solicitarEliminarAviso, confirmarEliminarAviso 
    };
};
