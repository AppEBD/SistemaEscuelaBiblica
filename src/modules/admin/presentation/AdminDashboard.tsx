import React, { useEffect, useState } from 'react';
// IMPORTANTE: Agregamos onSnapshot y deleteDoc
import { collection, onSnapshot, doc, updateDoc, deleteDoc, query } from 'firebase/firestore';
import { db } from '../../../core/firebase/firebase.config';
import './AdminDashboard.css';

export const AdminDashboard = () => {
    const [usuarios, setUsuarios] = useState<any[]>([]);
    const [cargando, setCargando] = useState(true);

    // Efecto en tiempo real (Escucha los cambios sin recargar la página)
    useEffect(() => {
        const q = query(collection(db, "maestros"));
        const desuscribir = onSnapshot(q, (querySnapshot) => {
            const lista = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            // Ordenamos: Pendientes primero
            lista.sort((a, b) => {
                if (a.estado === 'Pendiente' && b.estado !== 'Pendiente') return -1;
                if (a.estado !== 'Pendiente' && b.estado === 'Pendiente') return 1;
                return 0;
            });

            setUsuarios(lista);
            setCargando(false);
        });

        // Limpieza cuando el admin sale de la pantalla
        return () => desuscribir();
    }, []);

    const aprobarUsuario = async (id: string) => {
        if(window.confirm("¿Seguro que deseas APROBAR a este usuario para que pueda ingresar?")) {
            try {
                await updateDoc(doc(db, "maestros", id), { estado: 'Activo' });
                // Ya no hace falta recargar, onSnapshot actualiza la pantalla solo
            } catch (error) {
                alert("Hubo un error al aprobar. Intenta de nuevo.");
            }
        }
    };

    const denegarUsuario = async (id: string) => {
        if(window.confirm("¿Seguro que deseas DENEGAR a este usuario? Sus datos serán eliminados permanentemente.")) {
            try {
                // Borra por completo el documento de Firebase
                await deleteDoc(doc(db, "maestros", id));
            } catch (error) {
                alert("Hubo un error al denegar.");
            }
        }
    };

    return (
        <div className="admin-dashboard">
            <div className="admin-header">
                <h2>Directorio de Usuarios</h2>
                <p>Gestiona los accesos de tu equipo a la plataforma en tiempo real.</p>
            </div>

            {cargando ? (
                <p><i className="fa-solid fa-spinner fa-spin"></i> Cargando directorio...</p>
            ) : (
                <div className="users-grid">
                    {usuarios.length === 0 ? (
                        <p>No hay usuarios registrados aún.</p>
                    ) : (
                        usuarios.map(user => (
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
                                    <div style={{ marginBottom: '8px' }}>
                                        <i className="fa-solid fa-church"></i> <strong>Iglesia:</strong> {user.campo}
                                    </div>
                                    <div style={{ marginBottom: '8px' }}>
                                        <i className="fa-solid fa-cake-candles"></i> <strong>Nacimiento:</strong> {user.fechaNacimiento} ({user.edad} años)
                                    </div>
                                    <div>
                                        <i className="fa-solid fa-calendar-check"></i> <strong>Registrado el:</strong> {user.createdAt ? new Date(user.createdAt).toLocaleDateString('es-SV') : 'Desconocido'}
                                    </div>
                                </div>

                                {user.estado === 'Pendiente' && (
                                    <div className="admin-actions">
                                        <button className="btn-aprobar" onClick={() => aprobarUsuario(user.id)}>
                                            <i className="fa-solid fa-check"></i> Aprobar
                                        </button>
                                        <button className="btn-denegar" onClick={() => denegarUsuario(user.id)}>
                                            <i className="fa-solid fa-xmark"></i> Denegar
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};
