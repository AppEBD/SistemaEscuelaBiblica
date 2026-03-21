import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, doc, updateDoc, deleteDoc, query } from 'firebase/firestore';
import { db } from '../../../core/firebase/firebase.config';
import { AuthService } from '../../auth/infrastructure/auth.service';
import Modal from '../../../shared/components/Modal'; 
import './AdminDashboard.css';

export const AdminDashboard = () => {
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

    const guardarEdicion = async (e: React.FormEvent) => {
        e.preventDefault();
        const coleccion = AuthService.obtenerColeccion(editandoUser.rol);
        await updateDoc(doc(db, coleccion, editandoUser.id), {
            nombre: editandoUser.nombre,
            nombreNormalizado: editandoUser.nombre.trim().toLowerCase(), // Mantiene el anti-duplicados actualizado
            campo: editandoUser.campo
        });
        setEditandoUser(null);
        alert("Usuario actualizado correctamente");
    };

    return (
        <div className="admin-dashboard">
            <div className="admin-header">
                <h2>Directorio de Usuarios</h2>
                <p>Gestiona y edita los accesos de tu equipo en tiempo real.</p>
            </div>

            {cargando ? (
                <p><i className="fa-solid fa-spinner fa-spin"></i> Cargando base de datos...</p>
            ) : (
                <div className="users-grid">
                    {usuarios.length === 0 ? <p>No hay usuarios registrados aún.</p> : null}
                    {usuarios.map(user => (
                        <div className="user-card" key={user.id}>
                            <div className="user-card-header">
                                <div>
                                    <h3 className="user-name">{user.nombre}</h3>
                                    <span className="user-role">{user.rol}</span>
                                </div>
                                <span className={`user-status ${user.estado === 'Activo' ? 'status-activo' : 'status-pendiente'}`}>
                                    {user.estado === 'Activo' ? 'Activo' : 'Pendiente'}
                                </span>
                            </div>
                            
                            <div className="user-details">
                                <div><i className="fa-solid fa-church"></i> <strong>Iglesia:</strong> {user.campo}</div>
                                <div><i className="fa-solid fa-cake-candles"></i> <strong>Nacimiento:</strong> {user.fechaNacimiento}</div>
                                <div><i className="fa-solid fa-calendar-check"></i> <strong>Registrado:</strong> {user.createdAt ? new Date(user.createdAt).toLocaleDateString('es-SV') : 'N/A'}</div>
                            </div>

                            <div className="admin-actions">
                                {user.estado === 'Pendiente' ? (
                                    <>
                                        <button className="btn-aprobar" onClick={() => aprobarUsuario(user)}>
                                            <i className="fa-solid fa-check"></i> Aprobar
                                        </button>
                                        <button className="btn-denegar" onClick={() => eliminarUsuario(user, true)}>
                                            <i className="fa-solid fa-xmark"></i> Denegar
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button className="btn-editar" onClick={() => setEditandoUser(user)}>
                                            <i className="fa-solid fa-pen"></i> Editar
                                        </button>
                                        <button className="btn-denegar" onClick={() => eliminarUsuario(user, false)}>
                                            <i className="fa-solid fa-trash"></i> Eliminar
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <Modal isOpen={editandoUser !== null} onClose={() => setEditandoUser(null)} title="Editar Usuario">
                {editandoUser && (
                    <form onSubmit={guardarEdicion}>
                        <div className="ebd-form-group" style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Nombre Completo</label>
                            <input className="ebd-input" type="text" value={editandoUser.nombre} onChange={e => setEditandoUser({...editandoUser, nombre: e.target.value})} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }} />
                        </div>
                        <div className="ebd-form-group" style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Campo / Iglesia</label>
                            <select className="ebd-input" value={editandoUser.campo} onChange={e => setEditandoUser({...editandoUser, campo: e.target.value})} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}>
                                <option value="La Isla">La Isla</option><option value="Las Delicias">Las Delicias</option><option value="El Amatal">El Amatal</option><option value="El Manguito">El Manguito</option><option value="Buenos Aires">Buenos Aires</option><option value="Corozal #1">Corozal #1</option><option value="El Porvenir">El Porvenir</option><option value="El Caulote">El Caulote</option><option value="Corozal #2">Corozal #2</option><option value="Valle Encantado">Valle Encantado</option><option value="La Playa">La Playa</option>
                            </select>
                        </div>
                        <div className="admin-actions" style={{ display: 'flex', gap: '10px' }}>
                            <button type="button" className="btn-denegar" onClick={() => setEditandoUser(null)}>Cancelar</button>
                            <button type="submit" className="btn-aprobar">Guardar Cambios</button>
                        </div>
                    </form>
                )}
            </Modal>
        </div>
    );
};
