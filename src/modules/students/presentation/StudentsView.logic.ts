import { useState, useEffect, FormEvent } from 'react';
import { useAuth } from '../../auth/application/useAuth';
import { calcularEdadExacta } from '../../../core/utils/date.utils';
import { StudentUseCases } from '../application/student.usecases';
import { Alumno } from '../domain/student.model';

export const useStudentsLogic = () => {
    const { userData } = useAuth(); 
    const [alumnos, setAlumnos] = useState<Alumno[]>([]);
    const [cargando, setCargando] = useState(true);

    const [mainTab, setMainTab] = useState<'home' | 'alumnos' | 'asistencia' | 'reportes'>('home');
    const [activeTab, setActiveTab] = useState<'directorio' | 'cumpleanos'>('directorio');

    const estadoInicial = { nombre: '', birthDay: '', birthMonth: '', birthYear: '', genero: '' };
    const [form, setForm] = useState(estadoInicial);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editandoId, setEditandoId] = useState<string | null>(null);

    // ESTADOS DE ASISTENCIA
    const [asistencia, setAsistencia] = useState<Record<string, string>>({});
    const [ofrendaDia, setOfrendaDia] = useState<string>('');
    
    // NUEVOS ESTADOS: Lección y Bloqueo de Pantalla Gris
    const [numeroLeccion, setNumeroLeccion] = useState<number>(1);
    const [seDioLeccion, setSeDioLeccion] = useState<boolean>(true);
    const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
    const [asistenciaDocId, setAsistenciaDocId] = useState<string | null>(null);

    const days = Array.from({ length: 31 }, (_, i) => i + 1);
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 20 }, (_, i) => currentYear - i);

    useEffect(() => {
        if (!userData?.campo) return;

        // 1. Cargar alumnos
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

        // 2. Cargar historial inteligente de la lección
        StudentUseCases.obtenerUltimaAsistencia(userData.campo).then(ultima => {
            if (ultima) {
                const fechaHoy = new Date().toISOString().split('T')[0];
                if (ultima.fecha === fechaHoy) {
                    // Si ya se pasó lista hoy, cargarla y BLOQUEAR (Gris)
                    setAsistenciaDocId(ultima.id || null);
                    if (ultima.registros) setAsistencia(ultima.registros as any);
                    setOfrendaDia(ultima.resumen?.ofrendaTotal?.toString() || '');
                    setNumeroLeccion(ultima.numeroLeccion || 1);
                    setSeDioLeccion(ultima.leccionDada);
                    setIsSubmitted(true);
                } else {
                    // Si es un día nuevo, calcular la lección (+1 si se dio la anterior)
                    const proxLeccion = ultima.leccionDada ? (ultima.numeroLeccion || 0) + 1 : (ultima.numeroLeccion || 1);
                    setNumeroLeccion(proxLeccion);
                    setSeDioLeccion(true);
                    setIsSubmitted(false);
                    setAsistenciaDocId(null);
                }
            }
        });

        return () => unsub();
    }, [userData]);

    const actualizarAsistencia = (id: string, estado: string) => {
        setAsistencia(prev => ({ ...prev, [id]: estado }));
    };

    const resumenAsistencia = {
        total: alumnos.length,
        presentes: Object.values(asistencia).filter(est => est === 'Presente').length,
        ausentes: Object.values(asistencia).filter(est => est === 'Ausente').length,
        permisos: Object.values(asistencia).filter(est => est === 'Permiso').length,
    };

    const enviarAsistencia = async () => {
        if (!userData?.campo || !userData?.nombre) return;
        
        try {
            const fechaHoy = new Date().toISOString().split('T')[0]; 
            const payload = {
                id: asistenciaDocId || undefined,
                campo: userData.campo,
                fecha: fechaHoy,
                registros: asistencia as any,
                resumen: { ...resumenAsistencia, ofrendaTotal: parseFloat(ofrendaDia) || 0 },
                registradoPor: userData.nombre,
                numeroLeccion: numeroLeccion,
                leccionDada: seDioLeccion
            };
            
            const docId = await StudentUseCases.registrarAsistenciaDiaria(payload);
            setAsistenciaDocId(docId);
            setIsSubmitted(true); // Bloquear pantalla en gris
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (error) {
            alert("Error al guardar la asistencia.");
        }
    };

    const editarAsistencia = () => {
        setIsSubmitted(false); // Desbloquea la pantalla para corregir
    };

    // (El resto se mantiene igual)
    const obtenerCumpleanerosPorMes = () => { /* ... */ const agrupados: Record<number, Alumno[]> = {}; for (let i = 1; i <= 12; i++) agrupados[i] = []; alumnos.forEach(alumno => { if (alumno.fechaNacimiento) { const mes = parseInt(alumno.fechaNacimiento.split('-')[1], 10); if (!isNaN(mes)) agrupados[mes].push(alumno); } }); Object.keys(agrupados).forEach(mes => { agrupados[mes as any].sort((a, b) => { const diaA = parseInt(a.fechaNacimiento.split('-')[2], 10); const diaB = parseInt(b.fechaNacimiento.split('-')[2], 10); return diaA - diaB; }); }); return agrupados; };
    const abrirModalNuevo = () => { setForm(estadoInicial); setEditandoId(null); setIsModalOpen(true); };
    const abrirModalEditar = (alumno: Alumno) => { if (!alumno.fechaNacimiento) return; const [year, month, day] = alumno.fechaNacimiento.split('-'); setForm({ nombre: alumno.nombre, birthDay: parseInt(day, 10).toString(), birthMonth: parseInt(month, 10).toString(), birthYear: year, genero: alumno.genero || '' }); setEditandoId(alumno.id || null); setIsModalOpen(true); };
    const guardarAlumno = async (e: FormEvent) => { e.preventDefault(); if (!userData?.campo || !userData?.nombre) return; const d = form.birthDay.padStart(2, '0'); const m = form.birthMonth.padStart(2, '0'); const fechaNacimiento = `${form.birthYear}-${m}-${d}`; const edad = calcularEdadExacta(fechaNacimiento); const datosAlumno = { nombre: form.nombre, fechaNacimiento, edad, genero: form.genero, campo: userData.campo }; try { if (editandoId) await StudentUseCases.editarAlumno(editandoId, { ...datosAlumno, actualizadoPor: userData.nombre }); else await StudentUseCases.registrarAlumno({ ...datosAlumno, registradoPor: userData.nombre }); setIsModalOpen(false); setForm(estadoInicial); setEditandoId(null); } catch (error) { alert("Hubo un error."); } };
    const eliminarAlumno = async (id: string | undefined, nombre: string) => { if (!id) return; if (window.confirm(`¿Seguro que deseas eliminar a ${nombre}?`)) await StudentUseCases.borrarAlumno(id); };

    return {
        alumnos, cargando, form, setForm, isModalOpen, setIsModalOpen, abrirModalNuevo, abrirModalEditar, guardarAlumno, eliminarAlumno,
        days, months, years, editandoId, userData, activeTab, setActiveTab, mainTab, setMainTab, obtenerCumpleanerosPorMes,
        asistencia, actualizarAsistencia, resumenAsistencia, enviarAsistencia, ofrendaDia, setOfrendaDia,
        numeroLeccion, setNumeroLeccion, seDioLeccion, setSeDioLeccion, isSubmitted, editarAsistencia
    };
};
