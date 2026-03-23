import { useState, useEffect, FormEvent } from 'react';
import { collection, onSnapshot, doc, addDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { db } from '../../../core/firebase/firebase.config';
import { useAuth } from '../../auth/application/useAuth';
import { calcularEdadExacta } from '../../../core/utils/date.utils';

export const useStudentsLogic = () => {
    const { userData } = useAuth(); 
    const [alumnos, setAlumnos] = useState<any[]>([]);
    const [cargando, setCargando] = useState(true);

    const [activeTab, setActiveTab] = useState<'directorio' | 'cumpleanos'>('directorio');

    const estadoInicial = { nombre: '', birthDay: '', birthMonth: '', birthYear: '', genero: '' };
    const [form, setForm] = useState(estadoInicial);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editandoId, setEditandoId] = useState<string | null>(null);

    const days = Array.from({ length: 31 }, (_, i) => i + 1);
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 20 }, (_, i) => currentYear - i);

    useEffect(() => {
        if (!userData?.campo) return;

        const q = query(collection(db, 'alumnos'), where('campo', '==', userData.campo));
        
        const unsub = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            data.sort((a: any, b: any) => a.nombre.localeCompare(b.nombre));
            setAlumnos(data);
            setCargando(false);
        });

        return () => unsub();
    }, [userData]);

    const obtenerCumpleanerosPorMes = () => {
        const agrupados: Record<number, any[]> = {};
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

    const abrirModalNuevo = () => {
        setForm(estadoInicial);
        setEditandoId(null);
        setIsModalOpen(true);
    };

    const abrirModalEditar = (alumno: any) => {
        if (!alumno.fechaNacimiento) return;
        const [year, month, day] = alumno.fechaNacimiento.split('-');
        setForm({
            nombre: alumno.nombre,
            birthDay: parseInt(day, 10).toString(),
            birthMonth: parseInt(month, 10).toString(),
            birthYear: year,
            genero: alumno.genero || ''
        });
        setEditandoId(alumno.id);
        setIsModalOpen(true);
    };

    const guardarAlumno = async (e: FormEvent) => {
        e.preventDefault();
        if (!userData?.campo) return;

        const d = form.birthDay.padStart(2, '0');
        const m = form.birthMonth.padStart(2, '0');
        const fechaNacimiento = `${form.birthYear}-${m}-${d}`;
        const edad = calcularEdadExacta(fechaNacimiento);

        const datosAlumno = {
            nombre: form.nombre,
            fechaNacimiento,
            edad,
            genero: form.genero,
            campo: userData.campo,
            actualizadoPor: userData.nombre,
            updatedAt: Date.now()
        };

        try {
            if (editandoId) {
                await updateDoc(doc(db, 'alumnos', editandoId), datosAlumno);
            } else {
                await addDoc(collection(db, 'alumnos'), {
                    ...datosAlumno,
                    createdAt: Date.now(),
                    registradoPor: userData.nombre
                });
            }
            setIsModalOpen(false);
            setForm(estadoInicial);
            setEditandoId(null);
        } catch (error) {
            alert("Hubo un error al guardar el registro.");
        }
    };

    const eliminarAlumno = async (id: string, nombre: string) => {
        if (window.confirm(`¿Estás seguro de que deseas eliminar a ${nombre}?`)) {
            await deleteDoc(doc(db, 'alumnos', id));
        }
    };

    return {
        alumnos, cargando, form, setForm, isModalOpen, setIsModalOpen,
        abrirModalNuevo, abrirModalEditar, guardarAlumno, eliminarAlumno,
        days, months, years, editandoId, userData,
        activeTab, setActiveTab, obtenerCumpleanerosPorMes
    };
};
