import { useState, useEffect, FormEvent } from 'react';
import { collection, onSnapshot, doc, updateDoc, deleteDoc, query, addDoc } from 'firebase/firestore';
import { db } from '../../../core/firebase/firebase.config'; 
import { AuthService } from '../../auth/infrastructure/auth.service';
import { calcularEdadExacta } from '../../../core/utils/date.utils';

export const useAdminLogic = () => {
    const [usuarios, setUsuarios] = useState<any[]>([]);
    const [alumnosGlobal, setAlumnosGlobal] = useState<any[]>([]);
    const [asistenciasGlobal, setAsistenciasGlobal] = useState<any[]>([]);
    const [cargando, setCargando] = useState(true);
    
    // Navegación interna del Admin
    const [adminTab, setAdminTab] = useState<'directorio' | 'campos' | 'avisos'>('directorio');

    // Directorio de Usuarios
    const [editandoUser, setEditandoUser] = useState<any | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const estadoAddInicial = { rol: '', nombre: '', clave: '', campo: '', birthDay: '', birthMonth: '', birthYear: '', genero: '' };
    const [addForm, setAddForm] = useState(estadoAddInicial);

    // Avisos
    const [avisoForm, setAvisoForm] = useState({ titulo: '', mensaje: '' });
    const [publicandoAviso, setPublicandoAviso] = useState(false);

    const days = Array.from({ length: 31 }, (_, i) => i + 1);
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 91 }, (_, i) => currentYear - 10 - i);

    // ==========================================
    // CARGA DE DATOS GLOBALES (DIRECTORIO, ALUMNOS Y ASISTENCIAS)
    // ==========================================
    useEffect(() => {
        const roles = ['MAESTRO', 'AUXILIAR', 'LOGISTICA', 'SECRETARIA', 'TESORERO'];
        const unsubscribes: any[] = [];

        roles.forEach(rol => {
            const coleccion = AuthService.obtenerColeccion(rol);
            const q = query(collection(db, coleccion));
            const unsub = onSnapshot(q, (snapshot) => {
                const nuevos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setUsuarios(prev => {
                    const filtrados = prev.filter(u => u.rol !== rol);
                    return [...filtrados, ...nuevos].sort((a, b) => {
                        if (a.estado === 'Pendiente' && b.estado !== 'Pendiente') return -1;
                        if (a.estado !== 'Pendiente' && b.estado === 'Pendiente') return 1;
                        return 0;
                    });
                });
                setCargando(false);
            });
            unsubscribes.push(unsub);
        });

        const unsubAlumnos = onSnapshot(collection(db, 'alumnos'), (snap) => {
            setAlumnosGlobal(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });

        const unsubAsistencias = onSnapshot(collection(db, 'asistencias'), (snap) => {
            setAsistenciasGlobal(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });

        return () => {
            unsubscribes.forEach(unsub => unsub());
            unsubAlumnos();
            unsubAsistencias();
        };
    }, []);

    const usuariosFiltrados = usuarios.filter(u => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        return (u.nombre && u.nombre.toLowerCase().includes(term)) || (u.campo && u.campo.toLowerCase().includes(term));
    });

    const aprobarUsuario = async (user: any) => {
        if(window.confirm(`¿Aprobar a ${user.nombre}?`)) {
            const coleccion = AuthService.obtenerColeccion(user.rol);
            await updateDoc(doc(db, coleccion, user.id), { estado: 'Activo' });
        }
    };

    const eliminarUsuario = async (user: any, esDenegado: boolean) => {
        const accion = esDenegado ? "DENEGAR" : "ELIMINAR";
        if(window.confirm(`¿Seguro que deseas ${accion} a ${user.nombre}? Se borrará de la base de datos.`)) {
            const coleccion = AuthService.obtenerColeccion(user.rol);
            await deleteDoc(doc(db, coleccion, user.id));
        }
    };

    const guardarEdicion = async (e: FormEvent) => {
        e.preventDefault();
        if (!editandoUser) return;
        const coleccion = AuthService.obtenerColeccion(editandoUser.rol);
        let nuevaEdad = editandoUser.edad;
        if (editandoUser.fechaNacimiento) {
            const edadCalculada = calcularEdadExacta(editandoUser.fechaNacimiento);
            if (typeof edadCalculada === 'number') nuevaEdad = edadCalculada;
        }

        const datosActualizados: any = {
            nombre: editandoUser.nombre, nombreNormalizado: editandoUser.nombre.trim().toLowerCase(),
            fechaNacimiento: editandoUser.fechaNacimiento, edad: nuevaEdad, genero: editandoUser.genero 
        };
        if (editandoUser.rol === 'MAESTRO' || editandoUser.rol === 'AUXILIAR') datosActualizados.campo = editandoUser.campo;

        await updateDoc(doc(db, coleccion, editandoUser.id), datosActualizados);
        setEditandoUser(null);
    };

    const guardarNuevoUsuario = async (e: FormEvent) => {
        e.preventDefault();
        try {
            if (!addForm.rol) return alert("Selecciona un rol.");
            const coleccion = AuthService.obtenerColeccion(addForm.rol);
            const fechaNacimiento = `${addForm.birthYear}-${addForm.birthMonth.padStart(2, '0')}-${addForm.birthDay.padStart(2, '0')}`;
            const edad = calcularEdadExacta(fechaNacimiento);

            await addDoc(collection(db, coleccion), {
                nombre: addForm.nombre, nombreNormalizado: addForm.nombre.trim().toLowerCase(),
                rol: addForm.rol, campo: addForm.campo || '', fechaNacimiento, edad, genero: addForm.genero,
                clase: addForm.rol, estado: 'Activo', createdAt: Date.now()
            });
            
            setIsAddModalOpen(false); setAddForm(estadoAddInicial);
            alert(`✅ Usuario ${addForm.nombre} registrado.`);
        } catch (error) { alert("❌ Error al crear el usuario."); }
    };

    // ==========================================
    // PUBLICAR AVISOS GLOBALES
    // ==========================================
    const publicarAviso = async (e: FormEvent) => {
        e.preventDefault();
        setPublicandoAviso(true);
        try {
            await addDoc(collection(db, 'interacciones_avisos'), {
                titulo: avisoForm.titulo,
                mensaje: avisoForm.mensaje,
                fecha: 'Hoy',
                up: 0, down: 0, cake: 0,
                usuarios: {},
                leida: false,
                isCumplePersonal: false,
                isCumpleEquipo: false,
                createdAt: Date.now()
            });
            setAvisoForm({ titulo: '', mensaje: '' });
            alert("Aviso publicado en todas las sedes.");
        } catch (error) {
            alert("Error al publicar el aviso.");
        } finally {
            setPublicandoAviso(false);
        }
    };

    // ==========================================
    // MOTOR DE AGRUPACIÓN DE HISTORIAL (Mes > Semana)
    // ==========================================
    const agruparHistorialPorCampo = (campo: string) => {
        const asistenciasCampo = asistenciasGlobal.filter(a => a.campo === campo).sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
        const grupos: Record<string, { totalPresentes: number, semanas: Record<string, any[]> }> = {};

        asistenciasCampo.forEach(asis => {
            // Se usa T12:00:00 para evitar desajustes de zona horaria al convertir la fecha
            const dateObj = new Date(asis.fecha + 'T12:00:00');
            const mesStr = `${months[dateObj.getMonth()]} ${dateObj.getFullYear()}`;
            const semanaNum = Math.ceil(dateObj.getDate() / 7);
            const semanaStr = `Semana ${semanaNum}`;

            if (!grupos[mesStr]) grupos[mesStr] = { totalPresentes: 0, semanas: {} };
            if (!grupos[mesStr].semanas[semanaStr]) grupos[mesStr].semanas[semanaStr] = [];

            grupos[mesStr].semanas[semanaStr].push(asis);
            grupos[mesStr].totalPresentes += (asis.resumen?.presentes || 0);
        });

        return grupos;
    };

    return {
        usuarios, cargando, editandoUser, setEditandoUser,
        aprobarUsuario, eliminarUsuario, guardarEdicion,
        searchTerm, setSearchTerm, usuariosFiltrados,
        isAddModalOpen, setIsAddModalOpen, addForm, setAddForm, guardarNuevoUsuario,
        days, months, years,
        adminTab, setAdminTab,
        avisoForm, setAvisoForm, publicarAviso, publicandoAviso,
        alumnosGlobal, asistenciasGlobal, agruparHistorialPorCampo
    };
};
