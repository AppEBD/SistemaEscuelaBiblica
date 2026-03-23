import { useState, useEffect, FormEvent } from 'react';
import { collection, onSnapshot, doc, updateDoc, deleteDoc, query } from 'firebase/firestore';
import { db } from '../../../../core/firebase/firebase.config';
import { AuthService } from '../../auth/infrastructure/auth.service';
import { calcularEdadExacta } from '../../../core/utils/date.utils';

export const useAdminLogic = () => {
    const [usuarios, setUsuarios] = useState<any[]>([]);
    const [cargando, setCargando] = useState(true);
    const [editandoUser, setEditandoUser] = useState<any | null>(null);

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
            // NUEVO: Agregamos el género al actualizar
            genero: editandoUser.genero 
        };

        if (editandoUser.rol === 'MAESTRO' || editandoUser.rol === 'AUXILIAR') {
            datosActualizados.campo = editandoUser.campo;
        }

        await updateDoc(doc(db, coleccion, editandoUser.id), datosActualizados);
        setEditandoUser(null);
        alert("Usuario actualizado correctamente");
    };

    return {
        usuarios, cargando, editandoUser, setEditandoUser,
        aprobarUsuario, eliminarUsuario, guardarEdicion
    };
};
