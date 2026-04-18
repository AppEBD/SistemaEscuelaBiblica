import { useState, useEffect, useMemo } from 'react';
import { doc, collection, getDocs, onSnapshot, runTransaction } from 'firebase/firestore';
import { db } from '../../../core/firebase/firebase.config'; 
import { useAuth } from '../../../modules/auth/application/useAuth';

export const useNotifications = () => {
    const { userData } = useAuth();
    const [staffList, setStaffList] = useState<any[]>([]);
    const [notificacionesAdmin, setNotificacionesAdmin] = useState<any[]>([
        { id: "admin-1", titulo: "Bienvenida al Sistema", mensaje: "¡Bienvenido a EBD 2.0! Aquí aparecerán los avisos de la directiva para todos los maestros y auxiliares.", fecha: "Sistema", leida: false }
    ]);
    const [showBirthdayOverlay, setShowBirthdayOverlay] = useState(false);
    const [hasShownOverlay, setHasShownOverlay] = useState(false);
    const [reaccionesBD, setReaccionesBD] = useState<Record<string, any>>({});

    const [deviceId] = useState(() => {
        let id = localStorage.getItem('ebd_device_id');
        if (!id) {
            id = 'dev_' + Math.random().toString(36).substring(2, 10) + '_' + Date.now();
            localStorage.setItem('ebd_device_id', id);
        }
        return id;
    });

    useEffect(() => {
        const unsub = onSnapshot(collection(db, 'interacciones_avisos'), (snapshot) => {
            const reacts: Record<string, any> = {};
            snapshot.forEach(doc => { reacts[doc.id] = doc.data(); });
            setReaccionesBD(reacts);
        });
        return () => unsub();
    }, []);

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
                    if (voto === 'up') up++;
                    if (voto === 'down') down++;
                    if (voto === 'cake') cake++;
                });

                transaction.set(docRef, { up, down, cake, usuarios }, { merge: true });
            });
        } catch (error) { console.error("Error guardando reacción:", error); }
    };

    useEffect(() => {
        if (!userData || !userData.uid) return;
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
        const ayer = new Date(hoy);
        ayer.setDate(hoy.getDate() - 1);
        const mmddAyer = `${String(ayer.getMonth() + 1).padStart(2, '0')}-${String(ayer.getDate()).padStart(2, '0')}`;
        
        const diasDeEstaSemana = new Set<string>();
        const domingo = new Date(hoy);
        domingo.setDate(hoy.getDate() - hoy.getDay());
        for (let i = 0; i < 7; i++) {
            const dia = new Date(domingo);
            dia.setDate(domingo.getDate() + i);
            const mesFormat = String(dia.getMonth() + 1).padStart(2, '0');
            const diaFormat = String(dia.getDate()).padStart(2, '0');
            diasDeEstaSemana.add(`${mesFormat}-${diaFormat}`);
        }

        const userId = userData?.uid || userData?.id;
        const nombreUsuario = userData?.nombre || 'Miembro del Equipo';
        let miCumpleFlag = false;

        const cumpleaneros = staffList.filter(user => {
            if (!user || typeof user.fechaNacimiento !== 'string') return false;
            const partes = user.fechaNacimiento.split('-');
            if (partes.length !== 3) return false;
            const mmdd = `${partes[1]}-${partes[2]}`;
            return diasDeEstaSemana.has(mmdd);
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
                    id: notifId,
                    titulo: esHoy ? "🎉 ¡Feliz Cumpleaños a ti!" : (yaPaso ? "🎉 ¡Esperamos que la hayas pasado genial!" : "🎉 ¡Tu cumpleaños se acerca!"),
                    mensaje: esHoy 
                        ? `¡Felicidades en tu día especial, ${nombreUsuario.split(' ')[0]}! Que Dios te bendiga grandemente hoy.`
                        : (yaPaso ? `Tu cumpleaños fue el día ${diaNum}. ¡Deseamos que hayas tenido un día muy bendecido!` : `Tu cumpleaños es esta semana (Día ${diaNum}). ¡Ya casi celebramos!`),
                    fecha: esHoy ? "Hoy" : (esAyer ? "Ayer" : "Esta semana"), leida: true, isCumplePersonal: true
                };
            } else {
                return {
                    id: notifId,
                    titulo: esHoy ? `🎂 ¡Hoy es el cumpleaños de ${c.nombre.split(' ')[0]}!` : (yaPaso ? `🎂 Cumpleaños reciente de ${c.nombre.split(' ')[0]}` : `🎂 Cumpleaños de ${c.nombre.split(' ')[0]}`),
                    mensaje: esHoy
                        ? `¡Hoy celebramos la vida de ${c.nombre} (${rolCapitalizado}${sedeDisplay})! No olvides enviarle una felicitación.`
                        : (yaPaso ? `El día ${diaNum} fue el cumpleaños de ${c.nombre} (${rolCapitalizado}${sedeDisplay}). ¡Aún estás a tiempo de felicitarle!` : `El día ${diaNum} es el cumpleaños de ${c.nombre} (${rolCapitalizado}${sedeDisplay}). ¡Prepárate para felicitarle!`),
                    fecha: esHoy ? "Hoy" : (esAyer ? "Ayer" : "Esta semana"), leida: true, isCumpleEquipo: true
                };
            }
        });

        return { notificacionesCumple: cards, esMiCumpleHoy: miCumpleFlag };
    }, [staffList, userData, currentYear]);

    useEffect(() => {
        if (esMiCumpleHoy && !hasShownOverlay) {
            setShowBirthdayOverlay(true);
            setHasShownOverlay(true);
            const timer = setTimeout(() => setShowBirthdayOverlay(false), 5500);
            return () => clearTimeout(timer);
        }
    }, [esMiCumpleHoy, hasShownOverlay]);

    const getPesoFecha = (fechaStr: string) => {
        const f = (fechaStr || '').toLowerCase().trim();
        if (f === 'hoy') return 1; if (f === 'ayer') return 2; if (f === 'esta semana') return 3;
        if (f === 'semana pasada') return 4; if (f === 'este mes') return 5; if (f === 'mes pasado') return 6;
        return 99; 
    };

    const notificaciones = useMemo(() => {
        const todas = [...notificacionesCumple, ...notificacionesAdmin];
        return todas.sort((a, b) => getPesoFecha(a.fecha) - getPesoFecha(b.fecha));
    }, [notificacionesAdmin, notificacionesCumple]);

    const reproducirSonido = () => { try { const audio = new Audio('https://actions.google.com/sounds/v1/water/droplet_reverb.ogg'); audio.volume = 0.5; audio.play(); } catch (e) {} };
    const marcarNotificacion = (id: string) => { 
        if (id.startsWith('cumple-')) return; 
        setNotificacionesAdmin(prev => prev.map(n => { if (n.id === id && !n.leida) { reproducirSonido(); return { ...n, leida: true }; } return n; })); 
    };

    return { notificaciones, reaccionesBD, manejarReaccion, marcarNotificacion, showBirthdayOverlay, userData };
};
