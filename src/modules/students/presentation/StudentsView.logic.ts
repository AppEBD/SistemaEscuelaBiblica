import { useState, useEffect, FormEvent } from 'react';
import { collection, onSnapshot, doc, addDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { db } from '../../../core/firebase/firebase.config';
import { useAuth } from '../../auth/application/useAuth';
import { calcularEdadExacta } from '../../../core/utils/date.utils';

export const useStudentsLogic = () => {
    const { userData } = useAuth(); 
    const [alumnos, setAlumnos] = useState<any[]>([]);
    const [cargando, setCargando] = useState(true);

    const estadoInicial = { nombre: '', birthDay: '', birthMonth: '', birthYear: '', genero: '' };
    const [form, setForm] = useState(estadoInicial);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editandoId, setEditandoId] = useState<string | null>(null);

    // Listas para las fechas
    const days = Array.from({ length: 31 }, (_, i) => i + 1);
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 20 }, (_, i) => currentYear - i); // Últimos 20 años para niños

    useEffect(() => {
        if (!userData?.campo) return;

        // Magia: Solo traemos los niños que pertenecen al "Campo" del maestro actual
        const q = query(collection(db, 'alumnos'), where('campo', '==', userData.campo));
        
        const unsub = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            // Los ordenamos alfabéticamente
            data.sort((a: any, b: any) => a.nombre.localeCompare(b.nombre));
            setAlumnos(data);
            setCargando(false);
        });

        return () => unsub();
    }, [userData]);

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

        // Unimos el día, mes y año en un formato YYYY-MM-DD
        const d = form.birthDay.padStart(2, '0');
        const m = form.birthMonth.padStart(2, '0');
        const fechaNacimiento = `${form.birthYear}-${m}-${d}`;
        const edad = calcularEdadExacta(fechaNacimiento);

        const datosAlumno = {
            nombre: form.nombre,
            fechaNacimiento,
            edad,
            genero: form.genero,
            campo: userData.campo, // El niño se asigna automáticamente al campo del maestro
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
        if (window.confirm(`¿Estás seguro de que deseas eliminar a ${nombre}? Los datos se perderán para siempre.`)) {
            await deleteDoc(doc(db, 'alumnos', id));
        }
    };

    return {
        alumnos, cargando, form, setForm, isModalOpen, setIsModalOpen,
        abrirModalNuevo, abrirModalEditar, guardarAlumno, eliminarAlumno,
        days, months, years, editandoId, userData
    };
};
