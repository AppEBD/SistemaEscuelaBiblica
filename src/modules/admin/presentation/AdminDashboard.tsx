import React from 'react';
import { useAdminLogic } from './AdminDashboard.logic';
import Modal from '../../../shared/components/Modal'; 
import { Button } from '../../../shared/components/Button';
import { IGLESIAS_CAMPOS, ROLES_CONFIG } from '../../../core/constants/roles';
import Accordion from '../../../shared/components/Accordion'; 
import { calcularEdadExacta, formatearFechaLocal } from '../../../core/utils/date.utils'; 
import './AdminDashboard.css';

export const AdminDashboard = () => {
    const { 
        usuarios, cargando, editandoUser, setEditandoUser, 
        aprobarUsuario, eliminarUsuario, guardarEdicion 
    } = useAdminLogic();

    const rolesParaDirectorio = ROLES_CONFIG.filter(rol => rol.id !== 'ADMIN');

    return (
        <div className="admin-dashboard">
            <div className="admin-header">
                <h2>Directorio de Usuarios</h2>
                <p>Gestiona y edita los accesos de tu equipo en tiempo real.</p>
                
                {/* NUEVO: Etiqueta elegante con el TOTAL de usuarios */}
                {!cargando && (
                    <div style={{ 
                        marginTop: '10px', display: 'inline-block', 
                        backgroundColor: '#eef2ff', color: '#4f46e5', 
                        padding: '8px 15px', borderRadius: '10px', 
                        fontWeight: 'bold', fontSize: '14px',
                        border: '1px solid #c7d2fe'
                    }}>
                        <i className="fa-solid fa-users" style={{ marginRight: '8px' }}></i> 
                        Total en la plataforma: {usuarios.length}
                    </div>
                )}
            </div>

            {cargando ? (
                <p><i className="fa-solid fa-spinner fa-spin"></i> Cargando base de datos...</p>
            ) : (
                <div className="directory-container">
                    {rolesParaDirectorio.map(rolDef => {
                        const usuariosDeEsteRol = usuarios.filter(u => u.rol === rolDef.id);
                        
                        return (
                            <Accordion 
                                key={rolDef.id} 
                                title={`${rolDef.name}s (${usuariosDeEsteRol.length})`}
                            >
                                {usuariosDeEsteRol.length === 0 ? (
                                    <p style={{ padding: '15px', color: '#64748b', fontStyle: 'italic' }}>
                                        No hay {rolDef.name.toLowerCase()}s registrados aún.
                                    </p>
                                ) : (
                                    <div className="users-grid" style={{ padding: '15px 0' }}>
                                        {usuariosDeEsteRol.map(user => (
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
                                                    {user.campo && (
                                                        <div><i className="fa-solid fa-church"></i> <strong>Iglesia:</strong> {user.campo}</div>
                                                    )}
                                                    <div>
                                                        <i className="fa-solid fa-cake-candles"></i> <strong>Nacimiento:</strong> {user.fechaNacimiento || 'Desconocida'} 
                                                        <span style={{ color: '#4f46e5', fontWeight: 'bold' }}> ({calcularEdadExacta(user.fechaNacimiento, user.edad)} años)</span>
                                                    </div>
                                                    <div><i className="fa-solid fa-calendar-check"></i> <strong>Registrado:</strong> {formatearFechaLocal(user.createdAt)}</div>
                                                </div>

                                                <div className="admin-actions">
                                                    {user.estado === 'Pendiente' ? (
                                                        <>
                                                            <Button className="btn-aprobar" onClick={() => aprobarUsuario(user)}>
                                                                <i className="fa-solid fa-check"></i> Aprobar
                                                            </Button>
                                                            <Button className="btn-denegar" onClick={() => eliminarUsuario(user, true)}>
                                                                <i className="fa-solid fa-xmark"></i> Denegar
                                                            </Button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Button className="btn-editar" onClick={() => setEditandoUser(user)}>
                                                                <i className="fa-solid fa-pen"></i> Editar
                                                            </Button>
                                                            <Button className="btn-denegar" onClick={() => eliminarUsuario(user, false)}>
                                                                <i className="fa-solid fa-trash"></i> Eliminar
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </Accordion>
                        );
                    })}
                </div>
            )}

            <Modal isOpen={editandoUser !== null} onClose={() => setEditandoUser(null)} title={`Editar ${editandoUser?.rol}`}>
                {editandoUser && (
                    <form onSubmit={guardarEdicion}>
                        <div className="ebd-form-group" style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Nombre Completo</label>
                            <input className="ebd-input" type="text" value={editandoUser.nombre} onChange={e => setEditandoUser({...editandoUser, nombre: e.target.value})} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }} />
                        </div>

                        <div className="ebd-form-group" style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Fecha de Nacimiento</label>
                            <input className="ebd-input" type="date" value={editandoUser.fechaNacimiento || ''} onChange={e => setEditandoUser({...editandoUser, fechaNacimiento: e.target.value})} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }} />
                        </div>

                        {(editandoUser.rol === 'MAESTRO' || editandoUser.rol === 'AUXILIAR') && (
                            <div className="ebd-form-group" style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Campo / Iglesia</label>
                                <select className="ebd-input" value={editandoUser.campo || ''} onChange={e => setEditandoUser({...editandoUser, campo: e.target.value})} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}>
                                    <option value="" disabled>Seleccione un campo...</option>
                                    {IGLESIAS_CAMPOS.map(iglesia => <option key={iglesia} value={iglesia}>{iglesia}</option>)}
                                </select>
                            </div>
                        )}

                        <div className="admin-actions" style={{ display: 'flex', gap: '10px' }}>
                            <Button type="button" className="btn-denegar" onClick={() => setEditandoUser(null)}>Cancelar</Button>
                            <Button type="submit" className="btn-aprobar">Guardar Cambios</Button>
                        </div>
                    </form>
                )}
            </Modal>
        </div>
    );
};
