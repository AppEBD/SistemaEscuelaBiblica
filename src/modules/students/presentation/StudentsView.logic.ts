import { useState, useEffect, FormEvent, useMemo } from 'react';
import { getAuth, signOut } from 'firebase/auth'; 
import { doc, updateDoc } from 'firebase/firestore'; 
import { db } from '../../../core/firebase/firebase.config'; 
import { useAuth } from '../../auth/application/useAuth';
import { calcularEdadExacta } from '../../../core/utils/date.utils';
import { StudentUseCases } from '../application/student.usecases';
import { Alumno, AsistenciaDia } from '../domain/student.model';

export const useStudentsLogic = () => {
    const { userData, logout } = useAuth(); 
    const [alumnos, setAlumnos] = useState<Alumno[]>([]);
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

    // ==========================================
    // SISTEMA DE NOTIFICACIONES LIMPIO
    // ==========================================
    // 1. Notificaciones oficiales del Admin (Vacío por ahora)
    const [notificacionesAdmin, setNotificacionesAdmin] = useState<any[]>([]);

    // 2. Cálculo en vivo de los cumpleañeros de ESTA semana (Domingo a Sábado)
    const notificacionCumpleanos = useMemo(() => {
        if (alumnos.length === 0) return null;
        
        const hoy = new Date();
        const diaSemana = hoy.getDay(); // 0 es Domingo
        
        // Calculamos las fechas extremas de esta semana
        const inicioSemana = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - diaSemana);
        const finSemana = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + (6 - diaSemana), 23, 59, 59);

        // Filtramos quién cumple años en este rango de días
        const cumpleaneros = alumnos.filter(a => {
            if (!a.fechaNacimiento) return false;
            const partes = a.fechaNacimiento.split('-');
            if (partes.length !== 3) return false;
            
            const mes = parseInt(partes[1], 10) - 1; // Enero es 0
            const dia = parseInt(partes[2], 10);
            
            const fechaCumple = new Date(hoy.getFullYear(), mes, dia);
            return fechaCumple >= inicioSemana && fechaCumple <= finSemana;
        }).sort((a, b) => parseInt(a.fechaNacimiento.split('-')[2], 10) - parseInt(b.fechaNacimiento.split('-')[2], 10));

        if (cumpleaneros.length > 0) {
            const lineas = cumpleaneros.map(c => {
                const dia = c.fechaNacimiento.split('-')[2];
                const rol = c.genero === 'Femenino' ? 'Alumna' : 'Alumno';
                return `• ${c.nombre} (${rol}) - Día ${dia}`;
            });

            return {
                id: 999, // ID reservado para cumpleaños automáticos
                titulo: "🎂 Cumpleañeros de la Semana",
                mensaje: `¡Es semana de celebración! No olvides felicitar a:\n\n${lineas.join('\n')}`,
                fecha: "Esta semana",
                leida: true, // No tiene sentido "marcar como leída" una lista que debe estar visible
                isCumple: true
            };
        }
        return null;
    }, [alumnos]);

    // 3. Juntamos las notificaciones del Admin con los cumpleaños
    const notificaciones = useMemo(() => {
        const todas = [...notificacionesAdmin];
        if (notificacionCumpleanos) {
            todas.unshift(notificacionCumpleanos); // Ponemos los cumpleaños arriba
        }
        return todas;
    }, [notificacionesAdmin, notificacionCumpleanos]);

    const reproducirSonido = () => { try { const audio = new Audio('https://actions.google.com/sounds/v1/water/droplet_reverb.ogg'); audio.volume = 0.5; audio.play(); } catch (e) {} };
    
    const marcarNotificacion = (id: number) => { 
        if (id === 999) return; // Las de cumple no cambian de estado
        setNotificacionesAdmin(prev => prev.map(n => { 
            if (n.id === id && !n.leida) { reproducirSonido(); return { ...n, leida: true }; } 
            return n; 
        })); 
    };

    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [appTheme, setAppTheme] = useState<'indigo' | 'emerald' | 'rose' | 'amber'>('indigo');
    const [isEditingName, setIsEditingName] = useState(false);
    const [userNameDisplay, setUserNameDisplay] = useState(userData?.nombre || 'Maestro');

    useEffect(() => { if (userData?.nombre) setUserNameDisplay(userData.nombre); }, [userData]);

    const guardarNombrePerfil = async () => {
        if (!userNameDisplay.trim()) return;
        const userId = userData?.uid || userData?.id; 
        if (!userId) { alert("Error del sistema: No se detectó un ID de usuario válido."); setIsEditingName(false); return; }

        try {
            let nombreColeccion = 'usuarios_maestro'; 
            if (userData?.rol === 'AUXILIAR') { nombreColeccion = 'usuarios_auxiliar'; } 
            else if (userData?.rol === 'MAESTRO') { nombreColeccion = 'usuarios_maestro'; }

            const userRef = doc(db, nombreColeccion, userId);
            await updateDoc(userRef, { nombre: userNameDisplay });
            setIsEditingName(false); alert("¡Tu nombre ha sido actualizado correctamente!");
        } catch (error: any) { console.error("Detalle técnico del error:", error); alert(`Error de Firebase: ${error.message}`); }
    };

    const cerrarSesionApp = () => {
        if (window.confirm("¿Estás seguro de que deseas cerrar sesión?")) {
            if (logout) { logout(); } else { const auth = getAuth(); signOut(auth).then(() => window.location.reload()); }
        }
    };

    const days = Array.from({ length: 31 }, (_, i) => i + 1);
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const currentYear = new Date().getFullYear();
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

    const manejarCambioOfrenda = (valor: string) => {
        if (valor === '' || /^\d{0,2}(\.\d{0,2})?$/.test(valor)) {
            setOfrendaDia(valor);
        }
    };

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

            if (asistenciaDocId) {
                payload.id = asistenciaDocId; 
            }

            const docId = await StudentUseCases.registrarAsistenciaDiaria(payload); 
            setAsistenciaDocId(docId); 
            setAsistenciaRegistradaPor(userData.nombre); 
            setIsSubmitted(true); 
            
            StudentUseCases.obtenerHistorialCompleto(userData.campo).then(historial => setHistorialAsistencias(historial)); 
            window.scrollTo({ top: 0, behavior: 'smooth' }); 
        } catch (error: any) { 
            console.error("Detalle técnico del error al guardar asistencia:", error);
            alert(`Error de Firebase: ${error.message}`); 
        } 
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
        notificaciones, marcarNotificacion, isProfileOpen, setIsProfileOpen, appTheme, setAppTheme, isEditingName, setIsEditingName, userNameDisplay, setUserNameDisplay, guardarNombrePerfil, cerrarSesionApp,
        maxLeccionImpartida, porcentajeLecciones, metaLeccionesAdmin
    };
};
