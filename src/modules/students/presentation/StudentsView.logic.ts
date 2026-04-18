import { useState, useEffect, useMemo, FormEvent } from 'react';
import { getAuth, signOut } from 'firebase/auth'; 
import { doc, collection, getDocs, onSnapshot, runTransaction } from 'firebase/firestore'; // IMPORTAMOS runTransaction
import { db } from '../../../core/firebase/firebase.config'; 
import { useAuth } from '../../auth/application/useAuth';
import { calcularEdadExacta } from '../../../core/utils/date.utils';
import { StudentUseCases } from '../application/student.usecases';
import { Alumno, AsistenciaDia } from '../domain/student.model';

export const useStudentsLogic = () => {
    const { userData, logout } = useAuth(); 
    const [alumnos, setAlumnos] = useState<Alumno[]>([]);
    const [staffList, setStaffList] = useState<any[]>([]); 
    const [cargando, setCargando] = useState(true);

    const [mainTab, setMainTab] = useState<'home' | 'alumnos' | 'asistencia' | 'reportes'>('home');
    const [activeTab, setActiveTab] = useState<'directorio' | 'cumpleanos'>('directorio');
    const [reportTab, setReportTab] = useState<'menu' | 'ranking' | 'clases' | 'edades'>('menu');
    const [historialAsistencias, setHistorialAsistencias] = useState<AsistenciaDia[]>([]);
    
    const [desdeD, setDesdeD] = useState(''); const [desdeM, setDesdeM] = useState(''); const [desdeY, setDesdeY] = useState('');
    const [hastaD, setHastaD] = useState(''); const [hastaM, setHastaM] = useState(''); const [hastaY, setHastaY] = useState('');
    const [edadMin, setEdadMin] = useState<number | ''>(''); const [edadMax, setEdadMax] = useState<number | ''>('');

    const estadoInicial = { nombre: '', birthDay: '', birthMonth: '', birthYear: '', genero: '' };
    const [form, setForm] = useState(estadoInicial);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editandoId, setEditandoId] = useState<string | null>(null);

    const [asistencia, setAsistencia] = useState<Record<string, string>>({});
    const [ofrendaDia, setOfrendaDia] = useState('');
    const [numeroLeccion, setNumeroLeccion] = useState(1);
    const [seDioLeccion, setSeDioLeccion] = useState(true);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [asistenciaDocId, setAsistenciaDocId] = useState<string | null>(null);
    const [asistenciaRegistradaPor, setAsistenciaRegistradaPor] = useState<string | null>(null);

    const [notificacionesAdmin, setNotificacionesAdmin] = useState<any[]>([
        { id: "admin-1", titulo: "Bienvenida al Sistema", mensaje: "¡Bienvenido a EBD 2.0! Aquí aparecerán los avisos de la directiva para todos los maestros y auxiliares.", fecha: "Sistema", leida: false }
    ]);

    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [showBirthdayOverlay, setShowBirthdayOverlay] = useState(false);
    const [hasShownOverlay, setHasShownOverlay] = useState(false);

    // ==========================================
    // 1. TEMA DE COLOR PERSISTENTE (GUARDA EN MEMORIA)
    // ==========================================
    const [appTheme, setAppTheme] = useState<'indigo' | 'emerald' | 'rose' | 'amber'>(() => {
        return (localStorage.getItem('ebd_theme') as any) || 'indigo';
    });

    useEffect(() => {
        localStorage.setItem('ebd_theme', appTheme);
    }, [appTheme]);

    // ==========================================
    // 2. REACCIONES CON TRANSACCIONES SEGURAS
    // ==========================================
    const [reaccionesBD, setReaccionesBD] = useState<Record<string, any>>({});

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

        // Usamos runTransaction para que nadie pueda restar más de la cuenta
        try {
            await runTransaction(db, async (transaction) => {
                const sfDoc = await transaction.get(docRef);
                const actualData = sfDoc.exists() ? sfDoc.data() : { up: 0, down: 0, cake: 0, usuarios: {} };
                
                const misVotosActuales = actualData.usuarios || {};
                const miVotoAnterior = misVotosActuales[userId];

                let nuevoUp = actualData.up || 0;
                let nuevoDown = actualData.down || 0;
                let nuevoCake = actualData.cake || 0;
                let nuevoVotoMio: string | null = tipo;

                if (miVotoAnterior === tipo) {
                    nuevoVotoMio = null; 
                    if (tipo === 'up') nuevoUp--;
                    if (tipo === 'down') nuevoDown--;
                    if (tipo === 'cake') nuevoCake--;
                } else {
                    if (miVotoAnterior === 'up') nuevoUp--;
                    if (miVotoAnterior === 'down') nuevoDown--;
                    if (miVotoAnterior === 'cake') nuevoCake--;
                    
                    if (tipo === 'up') nuevoUp++;
                    if (tipo === 'down') nuevoDown++;
                    if (tipo === 'cake') nuevoCake++;
                }

                // Blindaje extra: nunca bajar de 0
                nuevoUp = Math.max(0, nuevoUp);
                nuevoDown = Math.max(0, nuevoDown);
                nuevoCake = Math.max(0, nuevoCake);

                const nuevosUsuarios = { ...misVotosActuales };
                if (nuevoVotoMio === null) {
                    delete nuevosUsuarios[userId];
                } else {
                    nuevosUsuarios[userId] = nuevoVotoMio;
                }

                transaction.set(docRef, {
                    up: nuevoUp, down: nuevoDown, cake: nuevoCake, usuarios: nuevosUsuarios
                }, { merge: true });
            });
        } catch (error) {
            console.error("Error guardando reacción en tiempo real:", error);
        }
    };

    // ==========================================
    // BUSCAR AL STAFF
    // ==========================================
    useEffect(() => {
        const fetchStaff = async () => {
            const colecciones = ['usuarios_maestro', 'usuarios_auxiliar', 'usuarios_logistica', 'usuarios_tesorero', 'usuarios_secretaria'];
            let todoElStaff: any[] = [];
            
            for (const nombreCol of colecciones) {
                try {
                    const snap = await getDocs(collection(db, nombreCol));
                    snap.forEach(documento => {
                        const data = documento.data();
                        const campoData = (data.campo || '').toLowerCase().trim();
                        const campoUser = (userData?.campo || '').toLowerCase().trim();

                        if (campoData === campoUser) { 
                            const rolLimpio = nombreCol.split('_')[1];
                            todoElStaff.push({ ...data, id: documento.id, rolParaCumple: rolLimpio });
                        }
                    });
                } catch (e) { }
            }
            setStaffList(todoElStaff);
        };
        if (userData?.campo) { fetchStaff(); }
    }, [userData?.campo]);

    const currentYear = new Date().getFullYear();

    // ==========================================
    // CÁLCULO DE CUMPLEAÑOS
    // ==========================================
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
        const nombreUsuario = userData?.nombre || 'Maestro';
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
            
            const notifId = `cumple-${c.id}-${currentYear}`;

            if (esMio) {
                if (esHoy) miCumpleFlag = true;
                return {
                    id: notifId,
                    titulo: esHoy ? "🎉 ¡Feliz Cumpleaños a ti!" : (yaPaso ? "🎉 ¡Esperamos que la hayas pasado genial!" : "🎉 ¡Tu cumpleaños se acerca!"),
                    mensaje: esHoy 
                        ? `¡Felicidades en tu día especial, ${nombreUsuario.split(' ')[0]}! Que Dios te bendiga grandemente hoy.`
                        : (yaPaso 
                            ? `Tu cumpleaños fue el día ${diaNum}. ¡Deseamos que hayas tenido un día muy bendecido lleno de alegría!`
                            : `Tu cumpleaños es esta semana (Día ${diaNum}). ¡Ya casi celebramos!`),
                    fecha: esHoy ? "Hoy" : (esAyer ? "Ayer" : "Esta semana"),
                    leida: true,
                    isCumplePersonal: true
                };
            } else {
                return {
                    id: notifId,
                    titulo: esHoy ? `🎂 ¡Hoy es el cumpleaños de ${c.nombre.split(' ')[0]}!` : (yaPaso ? `🎂 Cumpleaños reciente de ${c.nombre.split(' ')[0]}` : `🎂 Cumpleaños de ${c.nombre.split(' ')[0]}`),
                    mensaje: esHoy
                        ? `¡Hoy celebramos la vida de ${c.nombre} (${rolCapitalizado})! No olvides enviarle una felicitación.`
                        : (yaPaso
                            ? `El día ${diaNum} fue el cumpleaños de ${c.nombre} (${rolCapitalizado}). ¡Aún estás a tiempo de desearle bendiciones!`
                            : `El día ${diaNum} es el cumpleaños de ${c.nombre} (${rolCapitalizado}). ¡Prepárate para felicitarle!`),
                    fecha: esHoy ? "Hoy" : (esAyer ? "Ayer" : "Esta semana"),
                    leida: true, 
                    isCumpleEquipo: true
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

    // ==========================================
    // 3. MOTOR DE ORDENAMIENTO (HOY -> AYER -> ESTA SEMANA)
    // ==========================================
    const getPesoFecha = (fechaStr: string) => {
        const f = (fechaStr || '').toLowerCase();
        if (f === 'hoy') return 1;
        if (f === 'ayer') return 2;
        if (f === 'esta semana') return 3;
        if (f === 'semana pasada') return 4;
        if (f === 'este mes') return 5;
        if (f === 'mes pasado') return 6;
        return 99; // Para "Sistema" o textos desconocidos
    };

    const notificaciones = useMemo(() => {
        const todas = [...notificacionesCumple, ...notificacionesAdmin];
        // Ordenamos del peso más bajo (1=Hoy) al más alto (99=Sistema)
        return todas.sort((a, b) => getPesoFecha(a.fecha) - getPesoFecha(b.fecha));
    }, [notificacionesAdmin, notificacionesCumple]);

    const reproducirSonido = () => { try { const audio = new Audio('https://actions.google.com/sounds/v1/water/droplet_reverb.ogg'); audio.volume = 0.5; audio.play(); } catch (e) {} };
    const marcarNotificacion = (id: string) => { 
        if (id.startsWith('cumple-')) return; 
        setNotificacionesAdmin(prev => prev.map(n => { if (n.id === id && !n.leida) { reproducirSonido(); return { ...n, leida: true }; } return n; })); 
    };

    const cerrarSesionApp = () => {
        if (window.confirm("¿Estás seguro de que deseas cerrar sesión?")) {
            if (logout) { logout(); } else { const auth = getAuth(); signOut(auth).then(() => window.location.reload()); }
        }
    };

    const days = Array.from({ length: 31 }, (_, i) => i + 1);
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const years = Array.from({ length: 20 }, (_, i) => currentYear - i);

    useEffect(() => {
        if (!userData?.campo) return;
        const unsub = StudentUseCases.obtenerAlumnosActivos(userData.campo, (data) => {
            setAlumnos(data); setCargando(false);
            setAsistencia(prev => {
                if (Object.keys(prev).length === 0 && data.length > 0) {
                    const inicial: Record<string, string> = {};
                    data.forEach(nino => { if(nino.id) inicial[nino.id] = 'Presente'; });
                    return inicial;
                }
                return prev;
            });
        });

        StudentUseCases.obtenerUltimaAsistencia(userData.campo).then(ultima => {
            if (ultima) {
                const fechaHoy = new Date().toISOString().split('T')[0];
                if (ultima.fecha === fechaHoy) {
                    setAsistenciaDocId(ultima.id || null); if (ultima.registros) setAsistencia(ultima.registros as any);
                    setOfrendaDia(ultima.resumen?.ofrendaTotal?.toString() || ''); setNumeroLeccion(ultima.numeroLeccion || 1);
                    setSeDioLeccion(ultima.leccionDada); setAsistenciaRegistradaPor(ultima.registradoPor || null); setIsSubmitted(true);
                } else {
                    const proxLeccion = ultima.leccionDada ? (ultima.numeroLeccion || 0) + 1 : (ultima.numeroLeccion || 1);
                    setNumeroLeccion(proxLeccion); setSeDioLeccion(true); setIsSubmitted(false); setAsistenciaDocId(null); setAsistenciaRegistradaPor(null);
                }
            }
        });

        StudentUseCases.obtenerHistorialCompleto(userData.campo).then(historial => setHistorialAsistencias(historial));
        return () => unsub();
    }, [userData]);

    const metaLeccionesAdmin = 0; 
    const maxLeccionImpartida = historialAsistencias.length > 0 ? Math.max(0, ...historialAsistencias.filter(a => a.leccionDada).map(a => a.numeroLeccion || 0)) : 0;
    const porcentajeLecciones = metaLeccionesAdmin > 0 ? Math.min(100, Math.round((maxLeccionImpartida / metaLeccionesAdmin) * 100)) : 0;

    const manejarCambioOfrenda = (valor: string) => { if (valor === '' || /^\d{0,2}(\.\d{0,2})?$/.test(valor)) { setOfrendaDia(valor); } };

    const obtenerRanking = () => { let validas = historialAsistencias; if (desdeD && desdeM && desdeY) { const d = desdeD.padStart(2, '0'); const m = desdeM.padStart(2, '0'); validas = validas.filter(a => a.fecha >= `${desdeY}-${m}-${d}`); } if (hastaD && hastaM && hastaY) { const d = hastaD.padStart(2, '0'); const m = hastaM.padStart(2, '0'); validas = validas.filter(a => a.fecha <= `${hastaY}-${m}-${d}`); } const conteo: Record<string, number> = {}; alumnos.forEach(a => conteo[a.id!] = 0); validas.forEach(asis => { if (asis.registros) { Object.entries(asis.registros).forEach(([id, estado]) => { if (estado === 'Presente') conteo[id] = (conteo[id] || 0) + 1; }); } }); return alumnos.map(a => ({ ...a, totalAsistencias: conteo[a.id!] || 0 })).sort((a, b) => b.totalAsistencias - a.totalAsistencias); };
    const limpiarFiltrosRanking = () => { setDesdeD(''); setDesdeM(''); setDesdeY(''); setHastaD(''); setHastaM(''); setHastaY(''); };
    const obtenerHistorialPorMes = () => { const agrupado: Record<string, AsistenciaDia[]> = {}; historialAsistencias.forEach(asis => { const [year, month] = asis.fecha.split('-'); const nombreMes = months[parseInt(month) - 1]; const key = `${nombreMes} ${year}`; if (!agrupado[key]) agrupado[key] = []; agrupado[key].push(asis); }); return agrupado; };
    const obtenerAlumnosPorEdad = () => { return alumnos.filter(a => { const edadStr = calcularEdadExacta(a.fechaNacimiento, a.edad as number); const edadNum = typeof edadStr === 'number' ? edadStr : parseInt(edadStr as string); if (isNaN(edadNum)) return false; if (edadMin !== '' && edadNum < edadMin) return false; if (edadMax !== '' && edadNum > edadMax) return false; return true; }); };
    const actualizarAsistencia = (id: string, estado: string) => { setAsistencia(prev => ({ ...prev, [id]: estado })); };
    const alumnosParaAsistencia = alumnos.filter(alumno => { if (asistenciaDocId) return asistencia.hasOwnProperty(alumno.id!); return true; });
    const resumenAsistencia = { total: alumnosParaAsistencia.length, presentes: alumnosParaAsistencia.filter(a => (asistencia[a.id!] || 'Presente') === 'Presente').length, ausentes: alumnosParaAsistencia.filter(a => (asistencia[a.id!] || 'Presente') === 'Ausente').length, permisos: alumnosParaAsistencia.filter(a => (asistencia[a.id!] || 'Presente') === 'Permiso').length, };

    const enviarAsistencia = async () => { 
        if (!userData?.campo || !userData?.nombre) return; 

        if (!asistenciaDocId && seDioLeccion && numeroLeccion <= maxLeccionImpartida) {
            alert(`🛑 ALERTA: La lección ${numeroLeccion} ya fue impartida anteriormente.\n\nEl sistema es auto-incremental. Como ya diste hasta la lección ${maxLeccionImpartida}, la lección de hoy debería ser la ${maxLeccionImpartida + 1}.`);
            setNumeroLeccion(maxLeccionImpartida + 1); 
            return; 
        }

        try { 
            const fechaHoy = new Date().toISOString().split('T')[0]; 
            const registrosFinales: Record<string, string> = {}; 
            alumnosParaAsistencia.forEach(a => { registrosFinales[a.id!] = asistencia[a.id!] || 'Presente'; }); 
            const ofrendaNumerica = parseFloat(ofrendaDia || "0") || 0;

            const payload: any = { 
                campo: userData.campo, 
                fecha: fechaHoy, 
                registros: registrosFinales, 
                resumen: { ...resumenAsistencia, ofrendaTotal: ofrendaNumerica }, 
                registradoPor: userData.nombre, 
                numeroLeccion: numeroLeccion, 
                leccionDada: seDioLeccion 
            }; 

            if (asistenciaDocId) { payload.id = asistenciaDocId; }

            const docId = await StudentUseCases.registrarAsistenciaDiaria(payload); 
            setAsistenciaDocId(docId); setAsistenciaRegistradaPor(userData.nombre); setIsSubmitted(true); 
            StudentUseCases.obtenerHistorialCompleto(userData.campo).then(historial => setHistorialAsistencias(historial)); 
            window.scrollTo({ top: 0, behavior: 'smooth' }); 
        } catch (error: any) { console.error("Detalle técnico del error:", error); alert(`Error de Firebase: ${error.message}`); } 
    };

    const editarAsistencia = () => { setIsSubmitted(false); };
    const obtenerCumpleanerosPorMes = () => { const agrupados: Record<number, Alumno[]> = {}; for (let i = 1; i <= 12; i++) agrupados[i] = []; alumnos.forEach(alumno => { if (alumno.fechaNacimiento) { const mes = parseInt(alumno.fechaNacimiento.split('-')[1], 10); if (!isNaN(mes)) agrupados[mes].push(alumno); } }); Object.keys(agrupados).forEach(mes => { agrupados[mes as any].sort((a, b) => { const diaA = parseInt(a.fechaNacimiento.split('-')[2], 10); const diaB = parseInt(b.fechaNacimiento.split('-')[2], 10); return diaA - diaB; }); }); return agrupados; };
    const abrirModalNuevo = () => { setForm(estadoInicial); setEditandoId(null); setIsModalOpen(true); };
    const abrirModalEditar = (alumno: Alumno) => { if (!alumno.fechaNacimiento) return; const [year, month, day] = alumno.fechaNacimiento.split('-'); setForm({ nombre: alumno.nombre, birthDay: parseInt(day, 10).toString(), birthMonth: parseInt(month, 10).toString(), birthYear: year, genero: alumno.genero || '' }); setEditandoId(alumno.id || null); setIsModalOpen(true); };
    const guardarAlumno = async (e: FormEvent) => { e.preventDefault(); if (!userData?.campo || !userData?.nombre) return; const d = form.birthDay.padStart(2, '0'); const m = form.birthMonth.padStart(2, '0'); const fechaNacimiento = `${form.birthYear}-${m}-${d}`; const edad = calcularEdadExacta(fechaNacimiento); const datosAlumno = { nombre: form.nombre, fechaNacimiento, edad, genero: form.genero, campo: userData.campo }; try { if (editandoId) await StudentUseCases.editarAlumno(editandoId, { ...datosAlumno, actualizadoPor: userData.nombre }); else await StudentUseCases.registrarAlumno({ ...datosAlumno, registradoPor: userData.nombre }); setIsModalOpen(false); setForm(estadoInicial); setEditandoId(null); } catch (error) { alert("Hubo un error."); } };
    const eliminarAlumno = async (id: string | undefined, nombre: string) => { if (!id) return; if (window.confirm(`¿Seguro que deseas eliminar a ${nombre}?`)) { await StudentUseCases.borrarAlumno(id); if (isSubmitted && asistenciaDocId && userData?.campo) { const nuevasAsistencias = { ...asistencia }; delete nuevasAsistencias[id]; const nuevoResumen = { total: alumnosParaAsistencia.length - 1, presentes: Object.values(nuevasAsistencias).filter(est => est === 'Presente').length, ausentes: Object.values(nuevasAsistencias).filter(est => est === 'Ausente').length, permisos: Object.values(nuevasAsistencias).filter(est => est === 'Permiso').length, ofrendaTotal: parseFloat(ofrendaDia) || 0 }; await StudentUseCases.registrarAsistenciaDiaria({ id: asistenciaDocId, campo: userData.campo, fecha: new Date().toISOString().split('T')[0], registros: nuevasAsistencias as any, resumen: nuevoResumen, registradoPor: asistenciaRegistradaPor || userData.nombre!, numeroLeccion, leccionDada: seDioLeccion }); setAsistencia(nuevasAsistencias); } } };

    return {
        alumnos, alumnosParaAsistencia, cargando, form, setForm, isModalOpen, setIsModalOpen, abrirModalNuevo, abrirModalEditar, guardarAlumno, eliminarAlumno,
        days, months, years, editandoId, userData, activeTab, setActiveTab, mainTab, setMainTab, obtenerCumpleanerosPorMes,
        asistencia, actualizarAsistencia, resumenAsistencia, enviarAsistencia, ofrendaDia, manejarCambioOfrenda,
        numeroLeccion, setNumeroLeccion, seDioLeccion, setSeDioLeccion, isSubmitted, editarAsistencia, asistenciaRegistradaPor,
        reportTab, setReportTab, obtenerRanking, obtenerHistorialPorMes, edadMin, setEdadMin, edadMax, setEdadMax, obtenerAlumnosPorEdad,
        desdeD, setDesdeD, desdeM, setDesdeM, desdeY, setDesdeY, hastaD, setHastaD, hastaM, setHastaM, hastaY, setHastaY, limpiarFiltrosRanking,
        notificaciones, marcarNotificacion, isProfileOpen, setIsProfileOpen, appTheme, setAppTheme, cerrarSesionApp,
        maxLeccionImpartida, porcentajeLecciones, metaLeccionesAdmin, showBirthdayOverlay,
        reaccionesBD, manejarReaccion 
    };
};
