import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../core/firebase/firebase.config';
import './AdminDashboard.css';

export const AdminDashboard = () => {
    const [usuarios, setUsuarios] = useState<any[]>([]);
    const [cargando, setCargando] = useState(true);

    // Función para buscar a los usuarios en Firebase
    const obtenerUsuarios = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, "maestros"));
            const lista = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setUsuarios(lista);
        } catch (error) {
            console.error("Error al obtener usuarios:", error);
        } finally {
            setCargando(false);
        }
    };

    // Función para aprobar a un usuario
    const aprobarUsuario = async (id: string) => {
        if(window.confirm("¿Seguro que deseas aprobar a este usuario para que pueda ingresar?")) {
            try {
                await updateDoc(doc(db, "maestros", id), { estado: 'Activo' });
                obtenerUsuarios(); // Recargar la lista
            } catch (error) {
                alert("Hubo un error al aprobar.");
            }
        }
    };

    // Ejecutar al abrir la pantalla
    useEffect(() => {
        obtenerUsuarios();
    }, []);

    return (
        <div className="admin-dashboard">
            <div className="admin-header">
                <h2>Directorio de Usuarios</h2>
                <p>Gestiona los accesos de tu equipo a la plataforma.</p>
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
                                    <div><i className="fa-solid fa-church"></i> {user.campo}</div>
                                    <div><i className="fa-solid fa-cake-candles"></i> {user.edad} años</div>
                                </div>

                                {user.estado === 'Pendiente' && (
                                    <button 
                                        className="btn-aprobar"
                                        onClick={() => aprobarUsuario(user.id)}
                                    >
                                        <i className="fa-solid fa-check"></i> Aprobar Acceso
                                    </button>
                                )}
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};
