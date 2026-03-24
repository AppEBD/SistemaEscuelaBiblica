import { useState, useEffect, FormEvent } from 'react';
import { useAuth } from '../../auth/application/useAuth';
import { calcularEdadExacta } from '../../../core/utils/date.utils';
import { StudentUseCases } from '../application/student.usecases';
import { Alumno, AsistenciaDia } from '../domain/student.model';

export const useStudentsLogic = () => {
    const { userData } = useAuth(); 
    const [alumnos, setAlumnos] = useState<Alumno[]>([]);
    const [cargando, setCargando] = useState(true);

    const [mainTab, setMainTab] = useState<'home' | 'alumnos' | 'asistencia' | 'reportes'>('home');
    const [activeTab, setActiveTab] = useState<'directorio' | 'cumpleanos'>('directorio');
    
    // NUEVO: Pestañas de Reportes
    const [reportTab, setReportTab] = useState<'ranking' | 'clases' | 'edades'>('ranking');
    const [historialAsistencias, setHistorialAsistencias] = useState<AsistenciaDia[]>([]);
    
    // Filtros de Reportes
    const [rankingDesde, setRankingDesde] = useState<string>('');
    const [rankingHasta, setRankingHasta] = useState<string>('');
    const [edadMin, setEdadMin] = useState<number | ''>('');
    const [edadMax, setEdadMax] = useState<number | ''>('');

    const estadoInicial = { nombre: '', birthDay: '', birthMonth: '', birthYear: '', genero: '' };
    const [form, setForm] = useState(estadoInicial);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editandoId, setEditandoId] = useState<string | null>(null);

    const [asistencia, setAsistencia] = useState<Record<string, string>>({});
    const [ofrendaDia, setOfrendaDia] = useState<string>('');
    const [numeroLeccion, setNumeroLeccion] = useState<number>(1);
    const [seDioLeccion, setSeDioLeccion] = useState<boolean>(true);
    const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
    const [asistenciaDocId, setAsistenciaDocId] = useState<string | null>(null);
    const [asistenciaRegistradaPor, setAsistenciaRegistradaPor] = useState<string | null>(null);

    const days = Array.from({ length: 31 }, (_, i) => i + 1);
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 20 }, (_, i) => currentYear - i);

    useEffect(() => {
        if (!userData?.campo) return;

        const unsub = StudentUseCases.obtenerAlumnosActivos(userData.campo, (data) => {
            setAlumnos(data);
            setCargando(false);
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
                    setAsistenciaDocId(ultima.id || null);
                    if (ultima.registros) setAsistencia(ultima.registros as any);
                    setOfrendaDia(ultima.resumen?.ofrendaTotal?.toString() || '');
                    setNumeroLeccion(ultima.numeroLeccion || 1);
                    setSeDioLeccion(ultima.leccionDada);
                    setAsistenciaRegistradaPor(ultima.registradoPor || null); 
                    setIsSubmitted(true);
                } else {
                    const proxLeccion = ultima.leccionDada ? (ultima.numeroLeccion || 0) + 1 : (ultima.numeroLeccion || 1);
                    setNumeroLeccion(proxLeccion);
                    setSeDioLeccion(true);
                    setIsSubmitted(false);
                    setAsistenciaDocId(null);
                    setAsistenciaRegistradaPor(null);
                }
            }
        });

        // Cargar historial de reportes
        StudentUseCases.obtenerHistorialCompleto(userData.campo).then(historial => setHistorialAsistencias(historial));

        return () => unsub();
    }, [userData]);

    // ==========================================
    // LÓGICAS DE REPORTES
    // ==========================================
    
    // 1. Ranking de Asistencia (Con filtro de fechas)
    const obtenerRanking = () => {
        let validas = historialAsistencias;
        if (rankingDesde) validas = validas.filter(a => a.fecha >= rankingDesde);
        if (rankingHasta) validas = validas.filter(a => a.fecha <= rankingHasta);

        const conteo: Record<string, number> = {};
        alumnos.forEach(a => conteo[a.id!] = 0);

        validas.forEach(asis => {
            if (asis.registros) {
                Object.entries(asis.registros).forEach(([id, estado]) => {
                    if (estado === 'Presente') conteo[id] = (conteo[id] || 0) + 1;
                });
            }
        });

        return alumnos.map(a => ({
            ...a, totalAsistencias: conteo[a.id!] || 0
        })).sort((a, b) => b.totalAsistencias - a.totalAsistencias);
    };

    // 2. Historial Agrupado por Mes
    const obtenerHistorialPorMes = () => {
        const agrupado: Record<string, AsistenciaDia[]> = {};
        historialAsistencias.forEach(asis => {
            const [year, month] = asis.fecha.split('-');
            const nombreMes = months[parseInt(month) - 1];
            const key = `${nombreMes} ${year}`;
            if (!agrupado[key]) agrupado[key] = [];
            agrupado[key].push(asis);
        });
        return agrupado;
    };

    // 3. Filtrado por Edades
    const obtenerAlumnosPorEdad = () => {
        return alumnos.filter(a => {
            const edadStr = calcularEdadExacta(a.fechaNacimiento, a.edad as number);
            const edadNum = typeof edadStr === 'number' ? edadStr : parseInt(edadStr as string);
            if (isNaN(edadNum)) return false;
            
            if (edadMin !== '' && edadNum < edadMin) return false;
            if (edadMax !== '' && edadNum > edadMax) return false;
            return true;
        });
    };


    const actualizarAsistencia = (id: string, estado: string) => { setAsistencia(prev => ({ ...prev, [id]: estado })); };

    const alumnosParaAsistencia = alumnos.filter(alumno => {
        if (asistenciaDocId) return asistencia.hasOwnProperty(alumno.id!);
        return true;
    });

    const resumenAsistencia = {
        total: alumnosParaAsistencia.length,
        presentes: alumnosParaAsistencia.filter(a => (asistencia[a.id!] || 'Presente') === 'Presente').length,
        ausentes: alumnosParaAsistencia.filter(a => (asistencia[a.id!] || 'Presente') === 'Ausente').length,
        permisos: alumnosParaAsistencia.filter(a => (asistencia[a.id!] || 'Presente') === 'Permiso').length,
    };

    const enviarAsistencia = async () => {
        if (!userData?.campo || !userData?.nombre) return;
        try {
            const fechaHoy = new Date().toISOString().split('T')[0]; 
            const registrosFinales: Record<string, string> = {};
            alumnosParaAsistencia.forEach(a => { registrosFinales[a.id!] = asistencia[a.id!] || 'Presente'; });

            const payload = {
                id: asistenciaDocId || undefined, campo: userData.campo, fecha: fechaHoy,
                registros: registrosFinales as any, resumen: { ...resumenAsistencia, ofrendaTotal: parseFloat(ofrendaDia) || 0 },
                registradoPor: userData.nombre, numeroLeccion: numeroLeccion, leccionDada: seDioLeccion
            };
            
            const docId = await StudentUseCases.registrarAsistenciaDiaria(payload);
            setAsistenciaDocId(docId); setAsistenciaRegistradaPor(userData.nombre); setIsSubmitted(true); 
            
            // Actualizar historial localmente para reportes
            StudentUseCases.obtenerHistorialCompleto(userData.campo).then(historial => setHistorialAsistencias(historial));
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (error) { alert("Error al guardar la asistencia."); }
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
        asistencia, actualizarAsistencia, resumenAsistencia, enviarAsistencia, ofrendaDia, setOfrendaDia,
        numeroLeccion, setNumeroLeccion, seDioLeccion, setSeDioLeccion, isSubmitted, editarAsistencia, asistenciaRegistradaPor,
        reportTab, setReportTab, historialAsistencias, rankingDesde, setRankingDesde, rankingHasta, setRankingHasta, obtenerRanking, obtenerHistorialPorMes,
        edadMin, setEdadMin, edadMax, setEdadMax, obtenerAlumnosPorEdad
    };
};
