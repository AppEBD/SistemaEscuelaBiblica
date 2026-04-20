import { useState, useEffect, FormEvent } from 'react';
import { collection, onSnapshot, doc, updateDoc, deleteDoc, query, addDoc } from 'firebase/firestore';
import { db } from '../../../core/firebase/firebase.config'; 
import { AuthService } from '../../auth/infrastructure/auth.service';
import { calcularEdadExacta } from '../../../core/utils/date.utils';

export const useAdminLogic = () => {
    const [usuarios, setUsuarios] = useState<any[]>([]);
    const [cargando, setCargando] = useState(true);
    const [editandoUser, setEditandoUser] = useState<any | null>(null);

    // === NUEVO: BUSCADOR UNIVERSAL ===
    const [searchTerm, setSearchTerm] = useState('');

    // === NUEVO: MODAL DE AGREGAR USUARIO EXACTO AL LOGIN ===
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const estadoAddInicial = { rol: '', nombre: '', clave: '', campo: '', birthDay: '', birthMonth: '', birthYear: '', genero: '' };
    const [addForm, setAddForm] = useState(estadoAddInicial);

    // Arrays para las fechas de nacimiento
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
                const nuevosDeEsteRol = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                
                setUsuarios(prev => {
                    const filtrados = prev.filter(u => u.rol !== rol);
                    const todos = [...filtrados, ...nuevosDeEsteRol];
                    return todos.sort((a, b) => {
                        if (a.estado === 'Pendiente' && b.estado !== 'Pendiente') return -1;
                        if (a.estado !== 'Pendiente' && b.estado === 'Pendiente') return 1;
                        return 0;
                    });
                });
                setCargando(false);
            });
            unsubscribes.push(unsub);
        });

        return () => unsubscribes.forEach(unsub => unsub());
    }, []);

    // Lógica del buscador reactivo
    const usuariosFiltrados = usuarios.filter(u => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        return (
            (u.nombre && u.nombre.toLowerCase().includes(term)) ||
            (u.campo && u.campo.toLowerCase().includes(term))
        );
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
            if (typeof edadCalculada === 'number') {
                nuevaEdad = edadCalculada;
            }
        }

        const datosActualizados: any = {
            nombre: editandoUser.nombre,
            nombreNormalizado: editandoUser.nombre.trim().toLowerCase(),
            fechaNacimiento: editandoUser.fechaNacimiento,
            edad: nuevaEdad,
            genero: editandoUser.genero 
        };

        if (editandoUser.rol === 'MAESTRO' || editandoUser.rol === 'AUXILIAR') {
            datosActualizados.campo = editandoUser.campo;
        }

        await updateDoc(doc(db, coleccion, editandoUser.id), datosActualizados);
        setEditandoUser(null);
        alert("Usuario actualizado correctamente");
    };

    // === NUEVO: REGISTRO DIRECTO DESDE ADMIN ===
    const guardarNuevoUsuario = async (e: FormEvent) => {
        e.preventDefault();
        try {
            if (!addForm.rol) {
                alert("Debes seleccionar un rol para el usuario.");
                return;
            }

            const coleccion = AuthService.obtenerColeccion(addForm.rol);
            const fechaNacimiento = `${addForm.birthYear}-${addForm.birthMonth.padStart(2, '0')}-${addForm.birthDay.padStart(2, '0')}`;
            const edad = calcularEdadExacta(fechaNacimiento);

            const nuevoUsuario = {
                nombre: addForm.nombre,
                nombreNormalizado: addForm.nombre.trim().toLowerCase(),
                rol: addForm.rol,
                campo: addForm.campo || '',
                fechaNacimiento,
                edad,
                genero: addForm.genero,
                clase: addForm.rol,
                estado: 'Activo', // Se aprueba automáticamente por ser Director
                createdAt: Date.now()
            };

            // Se guarda en la BD respetando tu estructura
            await addDoc(collection(db, coleccion), nuevoUsuario);
            
            setIsAddModalOpen(false);
            setAddForm(estadoAddInicial);
            alert(`✅ Usuario ${addForm.nombre} registrado y activado exitosamente.`);
        } catch (error) {
            alert("❌ Error al crear el usuario.");
        }
    };

    return {
        usuarios, cargando, editandoUser, setEditandoUser,
        aprobarUsuario, eliminarUsuario, guardarEdicion,
        searchTerm, setSearchTerm, usuariosFiltrados,
        isAddModalOpen, setIsAddModalOpen, addForm, setAddForm, guardarNuevoUsuario,
        days, months, years
    };
};
