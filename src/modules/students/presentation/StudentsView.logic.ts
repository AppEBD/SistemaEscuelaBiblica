import { useState, useEffect, FormEvent } from 'react';
import { useAuth } from '../../auth/application/useAuth';
import { calcularEdadExacta } from '../../../core/utils/date.utils';
import { StudentUseCases } from '../application/student.usecases';
import { Alumno, AsistenciaRegistro } from '../domain/student.model';

export const useStudentsLogic = () => {
    const { userData } = useAuth(); 
    const [alumnos, setAlumnos] = useState<Alumno[]>([]);
    const [cargando, setCargando] = useState(true);

    const [mainTab, setMainTab] = useState<'alumnos' | 'asistencia' | 'reportes'>('alumnos');
    const [activeTab, setActiveTab] = useState<'directorio' | 'cumpleanos'>('directorio');

    const estadoInicial = { nombre: '', birthDay: '', birthMonth: '', birthYear: '', genero: '' };
    const [form, setForm] = useState(estadoInicial);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editandoId, setEditandoId] = useState<string | null>(null);

    const [asistencia, setAsistencia] = useState<Record<string, AsistenciaRegistro>>({});

    const days = Array.from({ length: 31 }, (_, i) => i + 1);
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 20 }, (_, i) => currentYear - i);

    useEffect(() => {
        if (!userData?.campo) return;

        // Llamamos al Caso de Uso en lugar de Firebase
        const unsub = StudentUseCases.obtenerAlumnosActivos(userData.campo, (data) => {
            setAlumnos(data);
            setCargando(false);

            setAsistencia(prev => {
                if (Object.keys(prev).length === 0 && data.length > 0) {
                    const inicial: Record<string, AsistenciaRegistro> = {};
                    data.forEach(nino => {
                        if(nino.id) inicial[nino.id] = { estado: 'Presente', ofrenda: '' };
                    });
                    return inicial;
                }
                return prev;
            });
        });

        return () => unsub();
    }, [userData]);

    const actualizarAsistencia = (id: string, campo: 'estado' | 'ofrenda', valor: string) => {
        setAsistencia(prev => ({ ...prev, [id]: { ...prev[id], [campo]: valor } }));
    };

    const resumenAsistencia = {
        total: alumnos.length,
        presentes: Object.values(asistencia).filter(a => a.estado === 'Presente').length,
        ausentes: Object.values(asistencia).filter(a => a.estado === 'Ausente').length,
        permisos: Object.values(asistencia).filter(a => a.estado === 'Permiso').length,
        ofrendaTotal: Object.values(asistencia).reduce((sum, a) => sum + (parseFloat(a.ofrenda) || 0), 0)
    };

    const enviarAsistencia = async () => {
        if (!userData?.campo || !userData?.nombre) return;
        if (!window.confirm("¿Estás seguro de enviar la asistencia de hoy? Verifica que los datos sean correctos.")) return;
        
        try {
            const fechaHoy = new Date().toISOString().split('T')[0]; 
            await StudentUseCases.registrarAsistenciaDiaria({
                campo: userData.campo,
                fecha: fechaHoy,
                registros: asistencia,
                resumen: resumenAsistencia,
                registradoPor: userData.nombre
            });
            alert("¡Asistencia y ofrendas guardadas exitosamente!");
            
            const limpio: Record<string, AsistenciaRegistro> = {};
            alumnos.forEach(nino => { if(nino.id) limpio[nino.id] = { estado: 'Presente', ofrenda: '' } });
            setAsistencia(limpio);
        } catch (error) {
            alert("Error al guardar la asistencia.");
        }
    };

    const obtenerCumpleanerosPorMes = () => {
        const agrupados: Record<number, Alumno[]> = {};
        for (let i = 1; i <= 12; i++) agrupados[i] = []; 
        alumnos.forEach(alumno => {
            if (alumno.fechaNacimiento) {
                const mes = parseInt(alumno.fechaNacimiento.split('-')[1], 10);
                if (!isNaN(mes)) agrupados[mes].push(alumno);
            }
        });
        Object.keys(agrupados).forEach(mes => {
            agrupados[mes as any].sort((a, b) => {
                const diaA = parseInt(a.fechaNacimiento.split('-')[2], 10);
                const diaB = parseInt(b.fechaNacimiento.split('-')[2], 10);
                return diaA - diaB;
            });
        });
        return agrupados;
    };

    const abrirModalNuevo = () => { setForm(estadoInicial); setEditandoId(null); setIsModalOpen(true); };
    
    const abrirModalEditar = (alumno: Alumno) => {
        if (!alumno.fechaNacimiento) return;
        const [year, month, day] = alumno.fechaNacimiento.split('-');
        setForm({ nombre: alumno.nombre, birthDay: parseInt(day, 10).toString(), birthMonth: parseInt(month, 10).toString(), birthYear: year, genero: alumno.genero || '' });
        setEditandoId(alumno.id || null); setIsModalOpen(true);
    };

    const guardarAlumno = async (e: FormEvent) => {
        e.preventDefault();
        if (!userData?.campo || !userData?.nombre) return;
        const d = form.birthDay.padStart(2, '0'); const m = form.birthMonth.padStart(2, '0');
        const fechaNacimiento = `${form.birthYear}-${m}-${d}`; const edad = calcularEdadExacta(fechaNacimiento);
        const datosAlumno = { nombre: form.nombre, fechaNacimiento, edad, genero: form.genero, campo: userData.campo };
        try {
            if (editandoId) {
                await StudentUseCases.editarAlumno(editandoId, { ...datosAlumno, actualizadoPor: userData.nombre });
            } else {
                await StudentUseCases.registrarAlumno({ ...datosAlumno, registradoPor: userData.nombre });
            }
            setIsModalOpen(false); setForm(estadoInicial); setEditandoId(null);
        } catch (error) { alert("Hubo un error al guardar el registro."); }
    };

    const eliminarAlumno = async (id: string | undefined, nombre: string) => {
        if (!id) return;
        if (window.confirm(`¿Estás seguro de que deseas eliminar a ${nombre}?`)) {
            await StudentUseCases.borrarAlumno(id);
        }
    };

    return {
        alumnos, cargando, form, setForm, isModalOpen, setIsModalOpen,
        abrirModalNuevo, abrirModalEditar, guardarAlumno, eliminarAlumno,
        days, months, years, editandoId, userData,
        activeTab, setActiveTab, mainTab, setMainTab, obtenerCumpleanerosPorMes,
        asistencia, actualizarAsistencia, resumenAsistencia, enviarAsistencia
    };
};
