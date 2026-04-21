import { useState, useEffect, FormEvent } from 'react';
import { collection, onSnapshot, doc, updateDoc, deleteDoc, query, addDoc, where, getDocs } from 'firebase/firestore';
import { db } from '../../../core/firebase/firebase.config'; 
import { AuthService } from '../../auth/infrastructure/auth.service';
import { calcularEdadExacta } from '../../../core/utils/date.utils';

export const useAdminLogic = () => {
    const [usuarios, setUsuarios] = useState<any[]>([]);
    const [alumnosGlobal, setAlumnosGlobal] = useState<any[]>([]);
    const [asistenciasGlobal, setAsistenciasGlobal] = useState<any[]>([]);
    const [avisosGlobales, setAvisosGlobales] = useState<any[]>([]);
    const [cargando, setCargando] = useState(true);
    
    const [adminTab, setAdminTab] = useState<'home' | 'directorio' | 'campos' | 'avisos'>('home');

    const [editandoUser, setEditandoUser] = useState<any | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const estadoAddInicial = { rol: '', nombre: '', clave: '', campo: '', birthDay: '', birthMonth: '', birthYear: '', genero: '' };
    const [addForm, setAddForm] = useState(estadoAddInicial);

    const [isAvisoModalOpen, setIsAvisoModalOpen] = useState(false);
    const estadoAvisoInicial = { id: '', titulo: '', mensaje: '', targetRole: 'TODOS' };
    const [avisoForm, setAvisoForm] = useState(estadoAvisoInicial);
    const [guardandoAviso, setGuardandoAviso] = useState(false);

    const days = Array.from({ length: 31 }, (_, i) => i + 1);
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 91 }, (_, i) => currentYear - 10 - i);

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

        const unsubAvisos = onSnapshot(collection(db, 'interacciones_avisos'), (snap) => {
            const avisos = snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a: any, b: any) => b.createdAt - a.createdAt);
            setAvisosGlobales(avisos);
        });

        return () => {
            unsubscribes.forEach(unsub => unsub());
            unsubAlumnos();
            unsubAsistencias();
            unsubAvisos();
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
        if(window.confirm(`¿Seguro que deseas ${accion} a ${user.nombre}?\n\nTranquilo: Se borrará su acceso, pero los niños y registros que ingresó seguirán intactos en la sede.`)) {
            const coleccion = AuthService.obtenerColeccion(user.rol);
            await deleteDoc(doc(db, coleccion, user.id));
        }
    };

    const limpiarSede = async (campoNombre: string) => {
        const confirmacion1 = window.confirm(`⚠️ ADVERTENCIA ⚠️\n\nEstás a punto de VACIAR LA SEDE: "${campoNombre}".\n\nEl nombre de la sede y su personal (Maestros/Auxiliares) seguirán INTACTOS, pero se borrarán para siempre:\n- Todos los niños inscritos\n- El historial de clases (asistencias y ofrendas)\n\n¿Deseas vaciar los datos de la sede para comenzar de nuevo?`);
        if (!confirmacion1) return;

        const confirmacion2 = window.prompt(`Para confirmar el vaciado de datos, escribe el nombre de la sede exactamente así: ${campoNombre}`);
        if (confirmacion2 !== campoNombre) {
            alert("El nombre no coincide. Vaciado cancelado por seguridad.");
            return;
        }

        try {
            setCargando(true);
            const qAlumnos = query(collection(db, 'alumnos'), where('campo', '==', campoNombre));
            const snapAlumnos = await getDocs(qAlumnos);
            snapAlumnos.forEach(async (d) => await deleteDoc(doc(db, 'alumnos', d.id)));

            const qAsistencias = query(collection(db, 'asistencias'), where('campo', '==', campoNombre));
            const snapAsistencias = await getDocs(qAsistencias);
            snapAsistencias.forEach(async (d) => await deleteDoc(doc(db, 'asistencias', d.id)));

            alert(`✅ Los datos de la sede "${campoNombre}" han sido vaciados exitosamente.\n\nLos maestros y auxiliares asignados siguen teniendo acceso.`);
        } catch (error) {
            alert("❌ Ocurrió un error al intentar vaciar la sede.");
        } finally {
            setCargando(false);
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

    const abrirModalNuevoAviso = () => {
        setAvisoForm(estadoAvisoInicial);
        setIsAvisoModalOpen(true);
    };

    const abrirModalEditarAviso = (aviso: any) => {
        setAvisoForm({
            id: aviso.id,
            titulo: aviso.titulo,
            mensaje: aviso.mensaje,
            targetRole: aviso.targetRole || 'TODOS'
        });
        setIsAvisoModalOpen(true);
    };

    // ==========================================
    // GUARDAR AVISO CON FECHA Y HORA ESTRICTA
    // ==========================================
    const guardarAviso = async (e: FormEvent) => {
        e.preventDefault();
        setGuardandoAviso(true);
        try {
            if (avisoForm.id) {
                await updateDoc(doc(db, 'interacciones_avisos', avisoForm.id), {
                    titulo: avisoForm.titulo,
                    mensaje: avisoForm.mensaje,
                    targetRole: avisoForm.targetRole
                });
            } else {
                const ahora = new Date();
                await addDoc(collection(db, 'interacciones_avisos'), {
                    titulo: avisoForm.titulo,
                    mensaje: avisoForm.mensaje,
                    targetRole: avisoForm.targetRole,
                    fecha: ahora.toLocaleDateString('es-SV'), 
                    hora: ahora.toLocaleTimeString('es-SV', { hour: '2-digit', minute: '2-digit', hour12: true }),
                    up: 0, down: 0, cake: 0,
                    usuarios: {},
                    leida: false,
                    isCumplePersonal: false,
                    isCumpleEquipo: false,
                    createdAt: ahora.getTime() // Milisegundos exactos para ordenar
                });
            }
            setIsAvisoModalOpen(false);
        } catch (error) {
            alert("Error al procesar el aviso.");
        } finally {
            setGuardandoAviso(false);
        }
    };

    const eliminarAvisoAdmin = async () => {
        if (!avisoForm.id) return;
        if (window.confirm("¿Estás seguro de que deseas ELIMINAR este aviso permanentemente?")) {
            try {
                await deleteDoc(doc(db, 'interacciones_avisos', avisoForm.id));
                setIsAvisoModalOpen(false);
            } catch (error) {
                alert("Error al eliminar el aviso.");
            }
        }
    };

    const agruparHistorialPorCampo = (campo: string) => {
        const asistenciasCampo = asistenciasGlobal.filter(a => a.campo === campo).sort((a, b) => {
            const dateA = a.fecha ? new Date(a.fecha).getTime() : 0;
            const dateB = b.fecha ? new Date(b.fecha).getTime() : 0;
            return dateB - dateA;
        });

        const grupos: Record<string, { totalPresentes: number, semanas: Record<string, any[]> }> = {};

        asistenciasCampo.forEach(asis => {
            if (!asis.fecha) return; 

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
        usuarios, cargando, editandoUser, setEditandoUser, aprobarUsuario, eliminarUsuario, guardarEdicion,
        searchTerm, setSearchTerm, usuariosFiltrados, isAddModalOpen, setIsAddModalOpen, addForm, setAddForm, guardarNuevoUsuario,
        days, months, years, adminTab, setAdminTab, alumnosGlobal, asistenciasGlobal, agruparHistorialPorCampo,
        avisosGlobales, isAvisoModalOpen, setIsAvisoModalOpen, avisoForm, setAvisoForm, 
        guardandoAviso, abrirModalNuevoAviso, abrirModalEditarAviso, guardarAviso, eliminarAvisoAdmin,
        limpiarSede
    };
};
