import { useState, useEffect, FormEvent, useMemo } from 'react';
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
    
    // NUEVO: Agregamos 'monitor' a las pestañas disponibles
    const [adminTab, setAdminTab] = useState<'home' | 'directorio' | 'campos' | 'avisos' | 'monitor'>('home');

    const [editandoUser, setEditandoUser] = useState<any | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const estadoAddInicial = { rol: '', nombre: '', clave: '', campo: '', birthDay: '', birthMonth: '', birthYear: '', genero: '' };
    const [addForm, setAddForm] = useState(estadoAddInicial);

    const [isAvisoModalOpen, setIsAvisoModalOpen] = useState(false);
    const estadoAvisoInicial = { id: '', titulo: '', mensaje: '', targetRole: 'TODOS' };
    const [avisoForm, setAvisoForm] = useState(estadoAvisoInicial);
    const [guardandoAviso, setGuardandoAviso] = useState(false);

    const [confirmState, setConfirmState] = useState({
        isOpen: false, title: '', message: '', confirmText: '',
        type: 'danger' as 'danger' | 'warning' | 'success',
        requireInput: '', onConfirm: async () => {}
    });
    const [confirmInputText, setConfirmInputText] = useState('');

    const mostrarExito = (mensaje: string) => {
        setConfirmState({ isOpen: true, title: '✅ Operación Exitosa', message: mensaje, type: 'success', confirmText: 'Aceptar', requireInput: '', onConfirm: async () => setConfirmState(prev => ({...prev, isOpen: false})) });
    };

    const mostrarError = (mensaje: string) => {
        setConfirmState({ isOpen: true, title: '❌ Error en la Operación', message: mensaje, type: 'danger', confirmText: 'Entendido', requireInput: '', onConfirm: async () => setConfirmState(prev => ({...prev, isOpen: false})) });
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

    // ==========================================
    // MOTOR INTELIGENTE DEL MONITOR EN VIVO
    // ==========================================
    const fechaHoy = new Date().toISOString().split('T')[0];
    const asistenciasHoy = asistenciasGlobal.filter(a => a.fecha === fechaHoy);
    
    // Calculamos las métricas en vivo cruzando datos con los perfiles de los niños
    const metricasHoy = useMemo(() => {
        return asistenciasHoy.reduce((acc, asis) => {
            acc.presentes += (asis.resumen?.presentes || 0);
            acc.ausentes += (asis.resumen?.ausentes || 0);
            acc.permisos += (asis.resumen?.permisos || 0);
            acc.ofrenda += (asis.resumen?.ofrendaTotal || 0);
            acc.sedesEnviadas++;

            // Extraemos género de los presentes
            if (asis.registros) {
                Object.entries(asis.registros).forEach(([alumnoId, estado]) => {
                    if (estado === 'Presente') {
                        const alumnoInfo = alumnosGlobal.find(a => a.id === alumnoId);
                        if (alumnoInfo) {
                            if (alumnoInfo.genero === 'Masculino') acc.ninosPresentes++;
                            else if (alumnoInfo.genero === 'Femenino') acc.ninasPresentes++;
                        }
                    }
                });
            }
            return acc;
        }, { presentes: 0, ausentes: 0, permisos: 0, ofrenda: 0, sedesEnviadas: 0, ninosPresentes: 0, ninasPresentes: 0 });
    }, [asistenciasHoy, alumnosGlobal]);

    const usuariosFiltrados = usuarios.filter(u => {
        if (!searchTerm) return true;
        return (u.nombre && u.nombre.toLowerCase().includes(searchTerm.toLowerCase())) || (u.campo && u.campo.toLowerCase().includes(searchTerm.toLowerCase()));
    });

    const solicitarAprobacion = (user: any) => {
        setConfirmState({
            isOpen: true, title: 'Aprobar Acceso', message: `¿Estás seguro de que deseas dar acceso al sistema a ${user.nombre}?`, type: 'success', confirmText: 'Sí, Aprobar Usuario', requireInput: '',
            onConfirm: async () => {
                try {
                    const coleccion = AuthService.obtenerColeccion(user.rol);
                    await updateDoc(doc(db, coleccion, user.id), { estado: 'Activo' });
                    setConfirmState(prev => ({...prev, isOpen: false}));
                    setTimeout(() => mostrarExito(`Se ha concedido acceso a ${user.nombre}.`), 300);
                } catch (error) { mostrarError("No se pudo aprobar al usuario."); }
            }
        });
    };

    const solicitarEliminacion = (user: any, esDenegado: boolean) => {
        const accion = esDenegado ? "Denegar" : "Eliminar";
        setConfirmState({
            isOpen: true, title: `¿${accion} Usuario?`, message: `Vas a ${accion.toLowerCase()} a ${user.nombre}.\n\nTranquilo: Solo se borrará su acceso. Los niños, ofrendas y registros que este usuario ingresó seguirán INTACTOS en la sede.`, type: 'danger', confirmText: `Sí, ${accion}`, requireInput: '',
            onConfirm: async () => {
                try {
                    const coleccion = AuthService.obtenerColeccion(user.rol);
                    await deleteDoc(doc(db, coleccion, user.id));
                    setConfirmState(prev => ({...prev, isOpen: false}));
                    setTimeout(() => mostrarExito(`El usuario ${user.nombre} ha sido eliminado del sistema.`), 300);
                } catch (error) { mostrarError("No se pudo eliminar al usuario."); }
            }
        });
    };

    const solicitarLimpiarSede = (campoNombre: string) => {
        setConfirmState({
            isOpen: true, title: `⚠️ Vaciar Registros de Sede`, message: `Estás a punto de VACIAR LA SEDE: "${campoNombre}".\n\nEl nombre de la sede y su personal (Maestros) seguirán INTACTOS, pero se borrarán para siempre:\n- Todos los niños inscritos\n- Todo el historial de clases, ofrendas y asistencias\n\n¿Deseas dejar la sede como nueva?`, type: 'danger', confirmText: 'Destruir Registros Permanentemente', requireInput: campoNombre,
            onConfirm: async () => {
                try {
                    setCargando(true);
                    const alumnosDeSede = alumnosGlobal.filter(a => a.campo === campoNombre);
                    const promesasAlumnos = alumnosDeSede.map(a => deleteDoc(doc(db, 'alumnos', a.id)));
                    
                    const asistenciasDeSede = asistenciasGlobal.filter(a => a.campo === campoNombre);
                    const promesasAsistencias = asistenciasDeSede.map(a => deleteDoc(doc(db, 'asistencias', a.id)));
                    
                    await Promise.all([...promesasAlumnos, ...promesasAsistencias]);
                    setConfirmState(prev => ({...prev, isOpen: false}));
                    setTimeout(() => mostrarExito(`Los datos de "${campoNombre}" han sido vaciados exitosamente.\n\nLa sede está completamente limpia y lista para nuevos registros (Dile al maestro que recargue su pantalla).`), 300);
                } catch (error) {
                    setConfirmState(prev => ({...prev, isOpen: false}));
                    setTimeout(() => mostrarError("Ocurrió un error al intentar vaciar la sede."), 300);
                } finally { setCargando(false); }
            }
        });
    };

    const guardarEdicion = async (e: FormEvent) => {
        e.preventDefault();
        if (!editandoUser) return;
        try {
            const coleccion = AuthService.obtenerColeccion(editandoUser.rol);
            let nuevaEdad = editandoUser.edad;
            if (editandoUser.fechaNacimiento) {
                const edadCalculada = calcularEdadExacta(editandoUser.fechaNacimiento);
                if (typeof edadCalculada === 'number') nuevaEdad = edadCalculada;
            }

            const datosActualizados: any = { nombre: editandoUser.nombre, nombreNormalizado: editandoUser.nombre.trim().toLowerCase(), fechaNacimiento: editandoUser.fechaNacimiento, edad: nuevaEdad, genero: editandoUser.genero };
            if (editandoUser.rol === 'MAESTRO' || editandoUser.rol === 'AUXILIAR') datosActualizados.campo = editandoUser.campo;

            await updateDoc(doc(db, coleccion, editandoUser.id), datosActualizados);
            setEditandoUser(null);
            mostrarExito("Perfil del usuario actualizado correctamente.");
        } catch (error) { mostrarError("No se pudieron guardar los cambios."); }
    };

    const guardarNuevoUsuario = async (e: FormEvent) => {
        e.preventDefault();
        try {
            if (!addForm.rol) { mostrarError("Debes seleccionar un rol para el usuario."); return; }
            const coleccion = AuthService.obtenerColeccion(addForm.rol);
            const fechaNacimiento = `${addForm.birthYear}-${addForm.birthMonth.padStart(2, '0')}-${addForm.birthDay.padStart(2, '0')}`;
            const edad = calcularEdadExacta(fechaNacimiento);

            await addDoc(collection(db, coleccion), { nombre: addForm.nombre, nombreNormalizado: addForm.nombre.trim().toLowerCase(), rol: addForm.rol, campo: addForm.campo || '', fechaNacimiento, edad, genero: addForm.genero, clase: addForm.rol, estado: 'Activo', createdAt: Date.now() });
            
            setIsAddModalOpen(false); setAddForm(estadoAddInicial);
            mostrarExito(`Usuario ${addForm.nombre} registrado y activado con éxito.`);
        } catch (error) { mostrarError("Error al crear el usuario. Verifica tu conexión."); }
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
        } catch (error) { mostrarError("Error al procesar el aviso."); } 
        finally { setGuardandoAviso(false); }
    };

    const solicitarEliminarAviso = () => {
        if (!avisoForm.id) return;
        setConfirmState({
            isOpen: true, title: 'Eliminar Aviso Oficial', message: '¿Estás seguro de que deseas ELIMINAR este aviso permanentemente?\n\nDesaparecerá de las pantallas de todos los usuarios inmediatamente.', type: 'danger', confirmText: 'Sí, Eliminar Aviso', requireInput: '',
            onConfirm: async () => {
                try {
                    await deleteDoc(doc(db, 'interacciones_avisos', avisoForm.id!));
                    setIsAvisoModalOpen(false);
                    setConfirmState(prev => ({...prev, isOpen: false}));
                    setTimeout(() => mostrarExito("El aviso fue eliminado."), 300);
                } catch (error) { mostrarError("No se pudo eliminar el aviso."); }
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
        confirmState, setConfirmState, confirmInputText, setConfirmInputText,
        asistenciasHoy, metricasHoy
    };
};
