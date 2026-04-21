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

    // ==========================================
    // SISTEMA DE ALERTAS PREMIUM (REEMPLAZA A WINDOW.CONFIRM Y ALERT)
    // ==========================================
    const [confirmState, setConfirmState] = useState({
        isOpen: false,
        title: '',
        message: '',
        confirmText: '',
        type: 'danger' as 'danger' | 'warning' | 'success',
        requireInput: '',
        onConfirm: async () => {}
    });
    const [confirmInputText, setConfirmInputText] = useState('');

    const mostrarExito = (mensaje: string) => {
        setConfirmState({
            isOpen: true, title: '✅ Operación Exitosa', message: mensaje,
            type: 'success', confirmText: 'Aceptar', requireInput: '',
            onConfirm: async () => setConfirmState(prev => ({...prev, isOpen: false}))
        });
    };

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

        const unsubAlumnos = onSnapshot(collection(db, 'alumnos'), (snap) => setAlumnosGlobal(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
        const unsubAsistencias = onSnapshot(collection(db, 'asistencias'), (snap) => setAsistenciasGlobal(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
        const unsubAvisos = onSnapshot(collection(db, 'interacciones_avisos'), (snap) => setAvisosGlobales(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a: any, b: any) => b.createdAt - a.createdAt)));

        return () => { unsubscribes.forEach(u => u()); unsubAlumnos(); unsubAsistencias(); unsubAvisos(); };
    }, []);

    const usuariosFiltrados = usuarios.filter(u => {
        if (!searchTerm) return true;
        return (u.nombre && u.nombre.toLowerCase().includes(searchTerm.toLowerCase())) || (u.campo && u.campo.toLowerCase().includes(searchTerm.toLowerCase()));
    });

    const solicitarAprobacion = (user: any) => {
        setConfirmState({
            isOpen: true, title: 'Aprobar Acceso',
            message: `¿Estás seguro de que deseas dar acceso al sistema a ${user.nombre}?`,
            type: 'success', confirmText: 'Sí, Aprobar Usuario', requireInput: '',
            onConfirm: async () => {
                const coleccion = AuthService.obtenerColeccion(user.rol);
                await updateDoc(doc(db, coleccion, user.id), { estado: 'Activo' });
                setConfirmState(prev => ({...prev, isOpen: false}));
            }
        });
    };

    const solicitarEliminacion = (user: any, esDenegado: boolean) => {
        const accion = esDenegado ? "Denegar" : "Eliminar";
        setConfirmState({
            isOpen: true, title: `¿${accion} Usuario?`,
            message: `Vas a ${accion.toLowerCase()} a ${user.nombre}.\n\nTranquilo: Solo se borrará su acceso. Los niños, ofrendas y registros que este usuario ingresó seguirán INTACTOS en la sede.`,
            type: 'danger', confirmText: `Sí, ${accion}`, requireInput: '',
            onConfirm: async () => {
                const coleccion = AuthService.obtenerColeccion(user.rol);
                await deleteDoc(doc(db, coleccion, user.id));
                setConfirmState(prev => ({...prev, isOpen: false}));
            }
        });
    };

    // ==========================================
    // DESTRUCCIÓN BLINDADA DE SEDE (For...of Loop)
    // ==========================================
    const solicitarLimpiarSede = (campoNombre: string) => {
        setConfirmState({
            isOpen: true, title: `⚠️ Vaciar Registros de Sede`,
            message: `Estás a punto de VACIAR LA SEDE: "${campoNombre}".\n\nEl nombre de la sede y su personal seguirán INTACTOS, pero se borrarán para siempre:\n- Todos los niños inscritos\n- Todo el historial de clases, ofrendas y asistencias\n\n¿Deseas dejar la sede como nueva?`,
            type: 'danger', confirmText: 'Destruir Registros Permanentemente', requireInput: campoNombre,
            onConfirm: async () => {
                try {
                    setCargando(true);
                    
                    // BLINDAJE 1: Borrar Alumnos 1 por 1 garantizando su destrucción
                    const qAlumnos = query(collection(db, 'alumnos'), where('campo', '==', campoNombre));
                    const snapAlumnos = await getDocs(qAlumnos);
                    for (const d of snapAlumnos.docs) { await deleteDoc(doc(db, 'alumnos', d.id)); }

                    // BLINDAJE 2: Borrar Asistencias/Ofrendas 1 por 1 garantizando su destrucción
                    const qAsistencias = query(collection(db, 'asistencias'), where('campo', '==', campoNombre));
                    const snapAsistencias = await getDocs(qAsistencias);
                    for (const d of snapAsistencias.docs) { await deleteDoc(doc(db, 'asistencias', d.id)); }

                    setConfirmState(prev => ({...prev, isOpen: false}));
                    mostrarExito(`Los datos de "${campoNombre}" han sido vaciados exitosamente.\n\nLa sede está completamente limpia y lista para nuevos registros.`);
                } catch (error) {
                    alert("❌ Ocurrió un error al intentar vaciar la sede.");
                } finally {
                    setCargando(false);
                }
            }
        });
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
        mostrarExito("Perfil del usuario actualizado correctamente.");
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
            mostrarExito(`Usuario ${addForm.nombre} registrado y activado con éxito.`);
        } catch (error) { alert("❌ Error al crear el usuario."); }
    };

    const abrirModalNuevoAviso = () => { setAvisoForm(estadoAvisoInicial); setIsAvisoModalOpen(true); };
    const abrirModalEditarAviso = (aviso: any) => { setAvisoForm({ id: aviso.id, titulo: aviso.titulo, mensaje: aviso.mensaje, targetRole: aviso.targetRole || 'TODOS' }); setIsAvisoModalOpen(true); };

    const guardarAviso = async (e: FormEvent) => {
        e.preventDefault();
        setGuardandoAviso(true);
        try {
            if (avisoForm.id) {
                await updateDoc(doc(db, 'interacciones_avisos', avisoForm.id), { titulo: avisoForm.titulo, mensaje: avisoForm.mensaje, targetRole: avisoForm.targetRole });
            } else {
                const ahora = new Date();
                await addDoc(collection(db, 'interacciones_avisos'), {
                    titulo: avisoForm.titulo, mensaje: avisoForm.mensaje, targetRole: avisoForm.targetRole,
                    fecha: ahora.toLocaleDateString('es-SV'), hora: ahora.toLocaleTimeString('es-SV', { hour: '2-digit', minute: '2-digit', hour12: true }),
                    up: 0, down: 0, cake: 0, usuarios: {}, leida: false, isCumplePersonal: false, isCumpleEquipo: false, createdAt: ahora.getTime()
                });
            }
            setIsAvisoModalOpen(false);
            mostrarExito(avisoForm.id ? "Aviso modificado exitosamente." : "Aviso oficial publicado y enviado.");
        } catch (error) {
            alert("Error al procesar el aviso.");
        } finally {
            setGuardandoAviso(false);
        }
    };

    const solicitarEliminarAviso = () => {
        if (!avisoForm.id) return;
        setConfirmState({
            isOpen: true, title: 'Eliminar Aviso Oficial',
            message: '¿Estás seguro de que deseas ELIMINAR este aviso permanentemente?\n\nDesaparecerá de las pantallas de todos los usuarios inmediatamente.',
            type: 'danger', confirmText: 'Sí, Eliminar Aviso', requireInput: '',
            onConfirm: async () => {
                await deleteDoc(doc(db, 'interacciones_avisos', avisoForm.id));
                setIsAvisoModalOpen(false);
                setConfirmState(prev => ({...prev, isOpen: false}));
            }
        });
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
        usuarios, cargando, editandoUser, setEditandoUser, solicitarAprobacion, solicitarEliminacion, guardarEdicion,
        searchTerm, setSearchTerm, usuariosFiltrados, isAddModalOpen, setIsAddModalOpen, addForm, setAddForm, guardarNuevoUsuario,
        days, months, years, adminTab, setAdminTab, alumnosGlobal, asistenciasGlobal, agruparHistorialPorCampo,
        avisosGlobales, isAvisoModalOpen, setIsAvisoModalOpen, avisoForm, setAvisoForm, 
        guardandoAviso, abrirModalNuevoAviso, abrirModalEditarAviso, guardarAviso, solicitarEliminarAviso, solicitarLimpiarSede,
        confirmState, setConfirmState, confirmInputText, setConfirmInputText
    };
};
