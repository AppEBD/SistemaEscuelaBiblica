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
    const [insigniasGlobales, setInsigniasGlobales] = useState<any[]>([]);
    const [cargando, setCargando] = useState(true);
    
    const [adminTab, setAdminTab] = useState<'home' | 'directorio' | 'campos' | 'avisos' | 'monitor' | 'insignias'>('home');

    const [editandoUser, setEditandoUser] = useState<any | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const estadoAddInicial = { rol: '', nombre: '', clave: '', campo: '', birthDay: '', birthMonth: '', birthYear: '', genero: '', servicioDay: '', servicioMonth: '', servicioYear: '' };
    const [addForm, setAddForm] = useState(estadoAddInicial);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const [isAvisoModalOpen, setIsAvisoModalOpen] = useState(false);
    const estadoAvisoInicial = { id: '', titulo: '', mensaje: '', targetRole: 'TODOS' };
    const [avisoForm, setAvisoForm] = useState(estadoAvisoInicial);
    const [guardandoAviso, setGuardandoAviso] = useState(false);

    const [isInsigniaModalOpen, setIsInsigniaModalOpen] = useState(false);
    const estadoInsigniaInicial = { id: '', icono: '🏆', titulo: '', descripcion: '' };
    const [insigniaForm, setInsigniaForm] = useState(estadoInsigniaInicial);
    
    const [isAsignarModalOpen, setIsAsignarModalOpen] = useState(false);
    const [insigniaActivaParaAsignar, setInsigniaActivaParaAsignar] = useState<any>(null);
    const [usuariosConInsignia, setUsuariosConInsignia] = useState<string[]>([]);
    const [filtroRolInsignia, setFiltroRolInsignia] = useState<string>('TODOS');

    const [confirmState, setConfirmState] = useState({
        isOpen: false, title: '', message: '', confirmText: '', type: 'danger' as 'danger' | 'warning' | 'success', requireInput: '', onConfirm: async () => {}
    });
    const [confirmInputText, setConfirmInputText] = useState('');

    const mostrarExito = (mensaje: string) => { setConfirmState({ isOpen: true, title: '✅ Operación Exitosa', message: mensaje, type: 'success', confirmText: 'Aceptar', requireInput: '', onConfirm: async () => setConfirmState(prev => ({...prev, isOpen: false})) }); };
    const mostrarError = (mensaje: string) => { setConfirmState({ isOpen: true, title: '❌ Error', message: mensaje, type: 'danger', confirmText: 'Entendido', requireInput: '', onConfirm: async () => setConfirmState(prev => ({...prev, isOpen: false})) }); };

    const days = Array.from({ length: 31 }, (_, i) => i + 1);
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 91 }, (_, i) => currentYear - 10 - i);
    const serviceYears = Array.from({ length: 30 }, (_, i) => currentYear - i);

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
        const unsubInsignias = onSnapshot(collection(db, 'insignias_creadas'), (snap) => setInsigniasGlobales(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a: any, b: any) => b.createdAt - a.createdAt)));

        return () => { unsubscribes.forEach(u => u()); unsubAlumnos(); unsubAsistencias(); unsubAvisos(); unsubInsignias(); };
    }, []);

    const fechaHoy = new Date().toISOString().split('T')[0];
    const asistenciasHoy = asistenciasGlobal.filter(a => a.fecha === fechaHoy);
    
    const metricasHoy = useMemo(() => {
        return asistenciasHoy.reduce((acc, asis) => {
            acc.presentes += (asis.resumen?.presentes || 0);
            acc.ausentes += (asis.resumen?.ausentes || 0);
            acc.permisos += (asis.resumen?.permisos || 0);
            acc.ofrenda += (asis.resumen?.ofrendaTotal || 0);
            acc.sedesEnviadas++;

            if (asis.registros) {
                Object.entries(asis.registros).forEach(([alumnoId, estado]) => {
                    const alumnoInfo = alumnosGlobal.find(a => a.id === alumnoId);
                    if (alumnoInfo) {
                        if (estado === 'Presente') {
                            if (alumnoInfo.genero === 'Masculino') acc.ninosPresentes++;
                            else if (alumnoInfo.genero === 'Femenino') acc.ninasPresentes++;
                        } else if (estado === 'Ausente') {
                            if (alumnoInfo.genero === 'Masculino') acc.ninosAusentes++;
                            else if (alumnoInfo.genero === 'Femenino') acc.ninasAusentes++;
                        } else if (estado === 'Permiso') {
                            if (alumnoInfo.genero === 'Masculino') acc.ninosPermisos++;
                            else if (alumnoInfo.genero === 'Femenino') acc.ninasPermisos++;
                        }
                    }
                });
            }
            return acc;
        }, { 
            presentes: 0, ninosPresentes: 0, ninasPresentes: 0,
            ausentes: 0, ninosAusentes: 0, ninasAusentes: 0,
            permisos: 0, ninosPermisos: 0, ninasPermisos: 0,
            ofrenda: 0, sedesEnviadas: 0 
        });
    }, [asistenciasHoy, alumnosGlobal]);

    const agruparMonitorGlobal = () => {
        const grupos: Record<string, { totalPresentes: number, semanas: Record<string, any> }> = {};
        const asistenciasValidas = asistenciasGlobal.filter(a => a.fecha).sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

        asistenciasValidas.forEach(asis => {
            const dateObj = new Date(asis.fecha + 'T12:00:00');
            const mesStr = `${months[dateObj.getMonth()]} ${dateObj.getFullYear()}`;
            const semanaNum = Math.ceil(dateObj.getDate() / 7);
            const semanaStr = `Semana ${semanaNum}`;

            if (!grupos[mesStr]) grupos[mesStr] = { totalPresentes: 0, semanas: {} };
            if (!grupos[mesStr].semanas[semanaStr]) {
                grupos[mesStr].semanas[semanaStr] = {
                    presentes: 0, ninosPresentes: 0, ninasPresentes: 0,
                    ausentes: 0, ninosAusentes: 0, ninasAusentes: 0,
                    permisos: 0, ninosPermisos: 0, ninasPermisos: 0,
                    ofrenda: 0, reportes: 0
                };
            }

            const sem = grupos[mesStr].semanas[semanaStr];
            sem.presentes += (asis.resumen?.presentes || 0);
            sem.ausentes += (asis.resumen?.ausentes || 0);
            sem.permisos += (asis.resumen?.permisos || 0);
            sem.ofrenda += (asis.resumen?.ofrendaTotal || 0);
            sem.reportes++;
            
            grupos[mesStr].totalPresentes += (asis.resumen?.presentes || 0);

            if (asis.registros) {
                Object.entries(asis.registros).forEach(([alumnoId, estado]) => {
                    const alumnoInfo = alumnosGlobal.find(a => a.id === alumnoId);
                    if (alumnoInfo) {
                        if (estado === 'Presente') {
                            if (alumnoInfo.genero === 'Masculino') sem.ninosPresentes++;
                            else if (alumnoInfo.genero === 'Femenino') sem.ninasPresentes++;
                        } else if (estado === 'Ausente') {
                            if (alumnoInfo.genero === 'Masculino') sem.ninosAusentes++;
                            else if (alumnoInfo.genero === 'Femenino') sem.ninasAusentes++;
                        } else if (estado === 'Permiso') {
                            if (alumnoInfo.genero === 'Masculino') sem.ninosPermisos++;
                            else if (alumnoInfo.genero === 'Femenino') sem.ninasPermisos++;
                        }
                    }
                });
            }
        });
        return grupos;
    };

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
            
            const requiereSede = editandoUser.rol === 'MAESTRO' || editandoUser.rol === 'AUXILIAR';

            const datosActualizados: any = { 
                nombre: editandoUser.nombre, nombreNormalizado: editandoUser.nombre.trim().toLowerCase(), 
                fechaNacimiento: editandoUser.fechaNacimiento, edad: nuevaEdad, genero: editandoUser.genero,
                fechaInicioServicio: editandoUser.fechaInicioServicio || '',
                campo: requiereSede ? editandoUser.campo : '' 
            };

            await updateDoc(doc(db, coleccion, editandoUser.id), datosActualizados);
            setEditandoUser(null);
            mostrarExito("Perfil del usuario actualizado correctamente.");
        } catch (error) { mostrarError("No se pudieron guardar los cambios."); }
    };

    const guardarNuevoUsuario = async (e: FormEvent) => {
        e.preventDefault();
        try {
            if (!addForm.rol) { mostrarError("Debes seleccionar un rol para el usuario."); return; }
            const requiereSede = addForm.rol === 'MAESTRO' || addForm.rol === 'AUXILIAR';
            
            const coleccion = AuthService.obtenerColeccion(addForm.rol);
            const fechaNacimiento = `${addForm.birthYear}-${addForm.birthMonth.padStart(2, '0')}-${addForm.birthDay.padStart(2, '0')}`;
            const edad = calcularEdadExacta(fechaNacimiento);
            const fechaInicioServicio = `${addForm.servicioYear}-${addForm.servicioMonth.padStart(2, '0')}-${addForm.servicioDay.padStart(2, '0')}`;

            await addDoc(collection(db, coleccion), { 
                nombre: addForm.nombre, nombreNormalizado: addForm.nombre.trim().toLowerCase(), 
                rol: addForm.rol, campo: requiereSede ? addForm.campo : '', 
                fechaNacimiento, edad, genero: addForm.genero, 
                fechaInicioServicio, insignias: [], 
                clase: addForm.rol, estado: 'Activo', createdAt: Date.now() 
            });
            
            setIsAddModalOpen(false); setAddForm(estadoAddInicial);
            mostrarExito(`Usuario ${addForm.nombre} registrado con éxito.`);
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
            setIsAvisoModalOpen(false); setAvisoForm(estadoAvisoInicial);
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
                    setIsAvisoModalOpen(false); setConfirmState(prev => ({...prev, isOpen: false}));
                    setTimeout(() => mostrarExito("El aviso fue eliminado."), 300);
                } catch (error) { mostrarError("No se pudo eliminar el aviso."); }
            }
        });
    };

    const abrirModalNuevaInsignia = () => { setInsigniaForm(estadoInsigniaInicial); setIsInsigniaModalOpen(true); };
    const abrirModalEditarInsignia = (insignia: any) => { setInsigniaForm({ id: insignia.id, icono: insignia.icono, titulo: insignia.titulo, descripcion: insignia.descripcion }); setIsInsigniaModalOpen(true); };

    const guardarInsignia = async (e: FormEvent) => {
        e.preventDefault();
        try {
            if (insigniaForm.id) {
                await updateDoc(doc(db, 'insignias_creadas', insigniaForm.id), { icono: insigniaForm.icono, titulo: insigniaForm.titulo, descripcion: insigniaForm.descripcion });
            } else {
                await addDoc(collection(db, 'insignias_creadas'), { icono: insigniaForm.icono || '🏆', titulo: insigniaForm.titulo, descripcion: insigniaForm.descripcion, createdAt: Date.now() });
            }
            setIsInsigniaModalOpen(false);
            mostrarExito(insigniaForm.id ? "Insignia actualizada correctamente." : "Nueva insignia creada. Ya puedes asignarla.");
        } catch(e) { mostrarError("Error guardando la insignia."); }
    };

    const solicitarEliminarInsignia = (id: string) => {
        setConfirmState({
            isOpen: true, title: 'Eliminar Insignia', message: '¿Estás seguro de que deseas destruir esta insignia?\n\nDesaparecerá permanentemente del perfil de todos los usuarios que la tengan.', type: 'danger', confirmText: 'Sí, Destruir Insignia', requireInput: '',
            onConfirm: async () => {
                await deleteDoc(doc(db, 'insignias_creadas', id));
                setConfirmState(prev => ({...prev, isOpen: false}));
                mostrarExito("Insignia eliminada con éxito.");
            }
        });
    };

    // === ESTA ERA LA FUNCIÓN QUE FALTABA EXPORTAR ===
    const abrirModalAsignarInsignia = (insignia: any) => {
        setInsigniaActivaParaAsignar(insignia);
        setFiltroRolInsignia('TODOS');
        const conInsignia = usuarios.filter(u => u.insignias && u.insignias.includes(insignia.id)).map(u => u.id);
        setUsuariosConInsignia(conInsignia);
        setIsAsignarModalOpen(true);
    };

    const toggleUsuarioInsignia = (userId: string) => {
        setUsuariosConInsignia(prev => prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]);
    };

    const usuariosParaAsignar = usuarios.filter(u => filtroRolInsignia === 'TODOS' || u.rol === filtroRolInsignia);
    
    const toggleTodosDelFiltro = () => {
        const idsDelFiltro = usuariosParaAsignar.map(u => u.id);
        const todosSeleccionados = idsDelFiltro.every(id => usuariosConInsignia.includes(id));
        
        if (todosSeleccionados) {
            setUsuariosConInsignia(prev => prev.filter(id => !idsDelFiltro.includes(id)));
        } else {
            setUsuariosConInsignia(prev => Array.from(new Set([...prev, ...idsDelFiltro])));
        }
    };

    const guardarAsignacionInsignias = async () => {
        setCargando(true);
        try {
            const promesas = [];
            for (const u of usuarios) {
                const tieneInsigniaActualmente = u.insignias && u.insignias.includes(insigniaActivaParaAsignar.id);
                const deberiaTenerla = usuariosConInsignia.includes(u.id);

                if (tieneInsigniaActualmente !== deberiaTenerla) {
                    const coleccion = AuthService.obtenerColeccion(u.rol);
                    let nuevasInsignias = u.insignias || [];
                    if (deberiaTenerla) nuevasInsignias = [...nuevasInsignias, insigniaActivaParaAsignar.id];
                    else nuevasInsignias = nuevasInsignias.filter((id: string) => id !== insigniaActivaParaAsignar.id);

                    promesas.push(updateDoc(doc(db, coleccion, u.id), { insignias: nuevasInsignias }));
                }
            }
            await Promise.all(promesas);
            setIsAsignarModalOpen(false);
            mostrarExito("Las insignias han sido distribuidas correctamente al personal seleccionado.");
        } catch (error) { mostrarError("Error al asignar las insignias."); }
        finally { setCargando(false); }
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
        days, months, years, serviceYears, adminTab, setAdminTab, alumnosGlobal, asistenciasGlobal, agruparHistorialPorCampo,
        avisosGlobales, isAvisoModalOpen, setIsAvisoModalOpen, avisoForm, setAvisoForm, 
        guardandoAviso, abrirModalNuevoAviso, abrirModalEditarAviso, guardarAviso, solicitarEliminarAviso, solicitarLimpiarSede,
        confirmState, setConfirmState, confirmInputText, setConfirmInputText,
        asistenciasHoy, metricasHoy, agruparMonitorGlobal,
        insigniasGlobales, isInsigniaModalOpen, setIsInsigniaModalOpen, insigniaForm, setInsigniaForm, abrirModalNuevaInsignia, abrirModalEditarInsignia, guardarInsignia, solicitarEliminarInsignia,
        isAsignarModalOpen, setIsAsignarModalOpen, insigniaActivaParaAsignar, usuariosConInsignia, toggleUsuarioInsignia, guardarAsignacionInsignias, filtroRolInsignia, setFiltroRolInsignia, usuariosParaAsignar, toggleTodosDelFiltro,
        abrirModalAsignarInsignia // <--- ¡AQUÍ ESTÁ LA EXPORTACIÓN QUE FALTABA!
    };
};
