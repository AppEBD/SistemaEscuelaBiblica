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
        aprobarUsuario, eliminarUsuario, guardarEdicion,
        searchTerm, setSearchTerm, usuariosFiltrados,
        isAddModalOpen, setIsAddModalOpen, addForm, setAddForm, guardarNuevoUsuario,
        days, months, years
    } = useAdminLogic();

    const rolesParaDirectorio = ROLES_CONFIG.filter(rol => rol.id !== 'ADMIN');

    // Extraemos la tarjeta a una constante para no repetir código y que se vea igual siempre
    const renderUserCard = (user: any) => (
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
                {user.campo && <div><i className="fa-solid fa-map-location-dot"></i> <strong>Campo:</strong> {user.campo}</div>}
                <div><i className="fa-solid fa-venus-mars"></i> <strong>Género:</strong> {user.genero || 'No especificado'}</div>
                <div>
                    <i className="fa-solid fa-cake-candles"></i> <strong>Nacimiento:</strong> {user.fechaNacimiento || 'Desconocida'} 
                    <span style={{ color: '#4f46e5', fontWeight: 'bold' }}> ({calcularEdadExacta(user.fechaNacimiento, user.edad)} años)</span>
                </div>
                <div><i className="fa-solid fa-calendar-check"></i> <strong>Registrado:</strong> {formatearFechaLocal(user.createdAt)}</div>
            </div>

            <div className="admin-actions">
                {user.estado === 'Pendiente' ? (
                    <>
                        <Button className="btn-aprobar" onClick={() => aprobarUsuario(user)}><i className="fa-solid fa-check"></i> Aprobar</Button>
                        <Button className="btn-denegar" onClick={() => eliminarUsuario(user, true)}><i className="fa-solid fa-xmark"></i> Denegar</Button>
                    </>
                ) : (
                    <>
                        <Button className="btn-editar" onClick={() => setEditandoUser(user)}><i className="fa-solid fa-pen"></i> Editar</Button>
                        <Button className="btn-denegar" onClick={() => eliminarUsuario(user, false)}><i className="fa-solid fa-trash"></i> Eliminar</Button>
                    </>
                )}
            </div>
        </div>
    );

    return (
        <div className="admin-dashboard animate-fade-in">
            <div className="admin-header">
                <h2>Directorio de Usuarios</h2>
                <p>Gestiona y edita los accesos de tu equipo en tiempo real.</p>
                
                <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginTop: '5px' }}>
                    {!cargando && (
                        <div style={{ 
                            display: 'inline-flex', alignItems: 'center', backgroundColor: '#eef2ff', 
                            color: '#4f46e5', padding: '8px 15px', borderRadius: '10px', 
                            fontWeight: 'bold', fontSize: '14px', border: '1px solid #c7d2fe'
                        }}>
                            <i className="fa-solid fa-users" style={{ marginRight: '8px' }}></i> 
                            Total en la plataforma: {usuarios.length}
                        </div>
                    )}
                    
                    <button className="btn-add-new-user animate-fade-in" onClick={() => setIsAddModalOpen(true)}>
                        <i className="fa-solid fa-user-plus"></i> Agregar Personal
                    </button>
                </div>
            </div>

            <div className="admin-search-bar animate-fade-in">
                <i className="fa-solid fa-magnifying-glass"></i>
                <input 
                    type="text" 
                    placeholder="Buscar usuario por nombre o por campo..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {cargando ? (
                <p style={{ textAlign: 'center', color: '#64748b', marginTop: '20px' }}>
                    <i className="fa-solid fa-spinner fa-spin"></i> Cargando base de datos...
                </p>
            ) : (
                <div className="directory-container">
                    {/* SI ESTÁ BUSCANDO, MUESTRA LOS RESULTADOS DIRECTOS Y ROMPE LOS ACORDEONES */}
                    {searchTerm ? (
                        <div className="users-grid animate-fade-in" style={{ paddingTop: '10px' }}>
                            {usuariosFiltrados.length === 0 ? (
                                <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#64748b', padding: '30px', fontWeight: 'bold' }}>
                                    <i className="fa-solid fa-folder-open fa-2x" style={{ opacity: 0.5, marginBottom: '10px', display: 'block' }}></i>
                                    No se encontró nadie con ese nombre o sede.
                                </p>
                            ) : (
                                usuariosFiltrados.map(user => renderUserCard(user))
                            )}
                        </div>
                    ) : (
                        /* SI NO ESTÁ BUSCANDO, MUESTRA EL DIRECTORIO ORDENADO NORMALMENTE */
                        rolesParaDirectorio.map(rolDef => {
                            const usuariosDeEsteRol = usuarios.filter(u => u.rol === rolDef.id);
                            
                            return (
                                <Accordion key={rolDef.id} title={`${rolDef.name}s (${usuariosDeEsteRol.length})`}>
                                    {usuariosDeEsteRol.length === 0 ? (
                                        <p style={{ padding: '15px', color: '#64748b', fontStyle: 'italic' }}>
                                            No hay {rolDef.name.toLowerCase()}s registrados aún.
                                        </p>
                                    ) : (
                                        <div className="users-grid" style={{ padding: '15px 0' }}>
                                            {usuariosDeEsteRol.map(user => renderUserCard(user))}
                                        </div>
                                    )}
                                </Accordion>
                            );
                        })
                    )}
                </div>
            )}

            {/* MODAL EXISTENTE: EDITAR USUARIO */}
            <Modal isOpen={editandoUser !== null} onClose={() => setEditandoUser(null)} title={`Editar ${editandoUser?.rol}`}>
                {editandoUser && (
                    <form onSubmit={guardarEdicion}>
                        <div className="admin-form-group">
                            <label className="admin-label">Nombre Completo</label>
                            <input className="admin-input" type="text" value={editandoUser.nombre} onChange={e => setEditandoUser({...editandoUser, nombre: e.target.value})} required />
                        </div>

                        <div className="admin-form-group">
                            <label className="admin-label">Género</label>
                            <select className="admin-input" value={editandoUser.genero || ''} onChange={e => setEditandoUser({...editandoUser, genero: e.target.value})} required>
                                <option value="" disabled>Seleccione...</option>
                                <option value="Masculino">Masculino</option>
                                <option value="Femenino">Femenino</option>
                            </select>
                        </div>

                        <div className="admin-form-group">
                            <label className="admin-label">Fecha de Nacimiento</label>
                            <input className="admin-input" type="date" value={editandoUser.fechaNacimiento || ''} onChange={e => setEditandoUser({...editandoUser, fechaNacimiento: e.target.value})} required />
                        </div>

                        {(editandoUser.rol === 'MAESTRO' || editandoUser.rol === 'AUXILIAR') && (
                            <div className="admin-form-group">
                                <label className="admin-label">Campo</label>
                                <select className="admin-input" value={editandoUser.campo || ''} onChange={e => setEditandoUser({...editandoUser, campo: e.target.value})} required>
                                    <option value="" disabled>Seleccione un campo...</option>
                                    {IGLESIAS_CAMPOS.map(iglesia => <option key={iglesia} value={iglesia}>{iglesia}</option>)}
                                </select>
                            </div>
                        )}

                        <div className="admin-actions">
                            <Button type="button" className="btn-denegar" onClick={() => setEditandoUser(null)}>Cancelar</Button>
                            <Button type="submit" className="btn-aprobar">Guardar Cambios</Button>
                        </div>
                    </form>
                )}
            </Modal>

            {/* NUEVO MODAL: AGREGAR USUARIO EXACTO AL LOGIN */}
            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Registrar Nuevo Personal">
                <form onSubmit={guardarNuevoUsuario}>
                    
                    <div className="admin-form-group">
                        <label className="admin-label">Rol en el Sistema</label>
                        <select className="admin-input" value={addForm.rol} onChange={e => setAddForm({...addForm, rol: e.target.value})} required>
                            <option value="" disabled>Seleccione un rol...</option>
                            {rolesParaDirectorio.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                        </select>
                    </div>

                    <div className="admin-form-group">
                        <label className="admin-label">Nombre Completo</label>
                        <input type="text" placeholder="Ej: Juan Pérez" className="admin-input" value={addForm.nombre} onChange={(e) => setAddForm({...addForm, nombre: e.target.value})} required />
                    </div>

                    <div className="admin-form-group">
                        <label className="admin-label">Fecha de Nacimiento</label>
                        <div className="admin-date-grid">
                            <select className="admin-input" value={addForm.birthDay} onChange={(e) => setAddForm({...addForm, birthDay: e.target.value})} required>
                                <option value="" disabled>Día</option>{days.map(d => <option key={d} value={d < 10 ? `0${d}` : d}>{d}</option>)}
                            </select>
                            <select className="admin-input" value={addForm.birthMonth} onChange={(e) => setAddForm({...addForm, birthMonth: e.target.value})} required>
                                <option value="" disabled>Mes</option>{months.map((m, i) => <option key={m} value={i + 1 < 10 ? `0${i + 1}` : i + 1}>{m}</option>)}
                            </select>
                            <select className="admin-input" value={addForm.birthYear} onChange={(e) => setAddForm({...addForm, birthYear: e.target.value})} required>
                                <option value="" disabled>Año</option>{years.map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="admin-form-group">
                        <label className="admin-label">Género</label>
                        <select className="admin-input" value={addForm.genero} onChange={(e) => setAddForm({...addForm, genero: e.target.value})} required>
                            <option value="" disabled>Selecciona género...</option>
                            <option value="Masculino">Masculino</option>
                            <option value="Femenino">Femenino</option>
                        </select>
                    </div>

                    {(addForm.rol === 'MAESTRO' || addForm.rol === 'AUXILIAR') && (
                        <div className="admin-form-group animate-fade-in">
                            <label className="admin-label">Campo</label>
                            <select className="admin-input" value={addForm.campo} onChange={(e) => setAddForm({...addForm, campo: e.target.value})} required>
                                <option value="" disabled>Selecciona el campo...</option>
                                {IGLESIAS_CAMPOS.map(iglesia => <option key={iglesia} value={iglesia}>{iglesia}</option>)}
                            </select>
                        </div>
                    )}

                    <div className="admin-form-group">
                        <label className="admin-label">Contraseña de Acceso</label>
                        <input type="password" placeholder="••••••" className="admin-input" value={addForm.clave} onChange={(e) => setAddForm({...addForm, clave: e.target.value})} required />
                    </div>

                    <div className="admin-actions" style={{ marginTop: '20px' }}>
                        <Button type="button" className="btn-denegar" onClick={() => setIsAddModalOpen(false)}>Cancelar</Button>
                        <Button type="submit" className="btn-aprobar">Crear Usuario</Button>
                    </div>
                </form>
            </Modal>

        </div>
    );
};
