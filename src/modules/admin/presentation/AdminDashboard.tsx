import React from 'react';
import { useAdminLogic } from './AdminDashboard.logic';
import Modal from '../../../shared/components/Modal'; 
import { Button } from '../../../shared/components/Button';
import { IGLESIAS_CAMPOS, ROLES_CONFIG } from '../../../core/constants/roles';
import Accordion from '../../../shared/components/Accordion'; 
import { calcularEdadExacta, formatearFechaLocal } from '../../../core/utils/date.utils'; 
import { NotificationsWidget } from '../../../shared/components/notifications/NotificationsWidget';
import './AdminDashboard.css';

export const AdminDashboard = () => {
    const { 
        usuarios, cargando, editandoUser, setEditandoUser, aprobarUsuario, eliminarUsuario, guardarEdicion,
        searchTerm, setSearchTerm, usuariosFiltrados, isAddModalOpen, setIsAddModalOpen, addForm, setAddForm, guardarNuevoUsuario,
        days, months, years, adminTab, setAdminTab,
        avisoForm, setAvisoForm, publicarAviso, publicandoAviso,
        alumnosGlobal, asistenciasGlobal, agruparHistorialPorCampo
    } = useAdminLogic();

    const rolesParaDirectorio = ROLES_CONFIG.filter(rol => rol.id !== 'ADMIN');

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
                <div><i className="fa-solid fa-cake-candles"></i> <strong>Nacimiento:</strong> {user.fechaNacimiento || 'Desconocida'} <span style={{ color: '#4f46e5', fontWeight: 'bold' }}> ({calcularEdadExacta(user.fechaNacimiento, user.edad)} años)</span></div>
                <div><i className="fa-solid fa-calendar-check"></i> <strong>Registrado:</strong> {formatearFechaLocal(user.createdAt)}</div>
            </div>
            <div className="admin-actions">
                {user.estado === 'Pendiente' ? (
                    <>
                        <Button className="btn-aprobar" onClick={() => aprobarUsuario(user)}><i className="fa-solid fa-check"></i></Button>
                        <Button className="btn-denegar" onClick={() => eliminarUsuario(user, true)}><i className="fa-solid fa-xmark"></i></Button>
                    </>
                ) : (
                    <>
                        <Button className="btn-editar" onClick={() => setEditandoUser(user)}><i className="fa-solid fa-pen"></i></Button>
                        <Button className="btn-denegar" onClick={() => eliminarUsuario(user, false)}><i className="fa-solid fa-trash"></i></Button>
                    </>
                )}
            </div>
        </div>
    );

    return (
        <div className="admin-dashboard animate-fade-in">
            
            <div className="admin-header">
                <h2>Centro de Comando</h2>
                <p>Monitoreo global de sedes, personal y comunicación directa.</p>
            </div>

            {/* BOTÓN DE RETROCESO (Visible solo si no estamos en el Home) */}
            {adminTab !== 'home' && (
                <button className="btn-back-admin animate-fade-in" onClick={() => setAdminTab('home')}>
                    <i className="fa-solid fa-circle-arrow-left"></i> Volver al Menú Principal
                </button>
            )}

            {/* PESTAÑA 1: HOME MÁGICO */}
            {adminTab === 'home' && (
                <div className="admin-home-grid animate-fade-in">
                    <div className="admin-big-card card-blue" onClick={() => setAdminTab('directorio')}>
                        <div className="abc-content">
                            <h3>Gestión de Personal</h3>
                            <p>Administra accesos, aprueba solicitudes y edita perfiles.</p>
                            <span className="abc-stat">{usuarios.length} Usuarios</span>
                        </div>
                        <i className="fa-solid fa-users abc-icon"></i>
                    </div>

                    <div className="admin-big-card card-emerald" onClick={() => setAdminTab('campos')}>
                        <div className="abc-content">
                            <h3>Monitoreo de Sedes</h3>
                            <p>Verifica el progreso y asistencia semanal de cada campo.</p>
                            <span className="abc-stat">{IGLESIAS_CAMPOS.length} Campos Activos</span>
                        </div>
                        <i className="fa-solid fa-map-location-dot abc-icon"></i>
                    </div>

                    <div className="admin-big-card card-amber" onClick={() => setAdminTab('avisos')}>
                        <div className="abc-content">
                            <h3>Centro de Comunicaciones</h3>
                            <p>Envía mensajes y avisos oficiales a tu personal en vivo.</p>
                            <span className="abc-stat">Crear Nuevo Aviso</span>
                        </div>
                        <i className="fa-solid fa-tower-broadcast abc-icon"></i>
                    </div>

                    <div className="admin-quick-notif">
                        <NotificationsWidget />
                    </div>
                </div>
            )}

            {/* PESTAÑA 2: DIRECTORIO */}
            {adminTab === 'directorio' && (
                <div className="animate-fade-in">
                    <div className="admin-toolbar">
                        <div className="admin-search-bar">
                            <i className="fa-solid fa-magnifying-glass"></i>
                            <input type="text" placeholder="Buscar usuario por nombre o por campo..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        </div>
                        <button className="btn-add-new-user" onClick={() => setIsAddModalOpen(true)}>
                            <i className="fa-solid fa-user-plus"></i> Agregar Personal
                        </button>
                    </div>

                    {cargando ? <p style={{ textAlign: 'center', color: '#64748b' }}><i className="fa-solid fa-spinner fa-spin"></i> Cargando base de datos...</p> : (
                        <div className="directory-container">
                            {searchTerm ? (
                                <div className="users-grid animate-fade-in" style={{ paddingTop: '10px' }}>
                                    {usuariosFiltrados.length === 0 ? (
                                        <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#64748b', padding: '30px', fontWeight: 'bold' }}><i className="fa-solid fa-folder-open fa-2x" style={{ opacity: 0.5, marginBottom: '10px', display: 'block' }}></i> No se encontró nadie.</p>
                                    ) : ( usuariosFiltrados.map(user => renderUserCard(user)) )}
                                </div>
                            ) : (
                                rolesParaDirectorio.map(rolDef => {
                                    const usuariosDeEsteRol = usuarios.filter(u => u.rol === rolDef.id);
                                    return (
                                        <Accordion key={rolDef.id} title={`${rolDef.name}s (${usuariosDeEsteRol.length})`}>
                                            {usuariosDeEsteRol.length === 0 ? <p style={{ padding: '15px', color: '#64748b' }}>No hay registrados aún.</p> : (
                                                <div className="users-grid" style={{ padding: '15px 0' }}>{usuariosDeEsteRol.map(user => renderUserCard(user))}</div>
                                            )}
                                        </Accordion>
                                    );
                                })
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* PESTAÑA 3: CAMPOS ACTIVOS (Doble Acordeón Optimizado) */}
            {adminTab === 'campos' && (
                <div className="animate-fade-in">
                    <h3 style={{fontSize: '20px', color: '#1e293b', marginBottom: '20px'}}><i className="fa-solid fa-map-location-dot"></i> Resumen de Sedes</h3>
                    {IGLESIAS_CAMPOS.map(campo => {
                        const ninosSede = alumnosGlobal.filter(a => a.campo === campo).length;
                        const historialSede = asistenciasGlobal.filter(a => a.campo === campo);
                        const maxLeccion = historialSede.length > 0 ? Math.max(0, ...historialSede.filter(a => a.leccionDada).map(a => a.numeroLeccion || 0)) : 0;
                        const historialAgrupado = agruparHistorialPorCampo(campo);
                        
                        return (
                            <Accordion key={campo} title={`${campo} - ${ninosSede} Niños Registrados`}>
                                <div className="campo-details-container">
                                    <div className="campo-quick-stats">
                                        <div className="cqs-item"><i className="fa-solid fa-child-reaching" style={{color: '#38bdf8'}}></i> <span>{ninosSede} Niños</span></div>
                                        <div className="cqs-item"><i className="fa-solid fa-book-open" style={{color: '#10b981'}}></i> <span>Lección {maxLeccion}</span></div>
                                        <div className="cqs-item"><i className="fa-solid fa-layer-group" style={{color: '#f59e0b'}}></i> <span>Material Básico</span></div>
                                    </div>
                                    
                                    <div className="campo-progress-bar">
                                        <div className="cpb-fill" style={{width: `${Math.min(100, (maxLeccion / 52) * 100)}%`}}></div>
                                    </div>
                                    <p style={{fontSize: '11px', color: '#94a3b8', textAlign: 'right', margin: '5px 0 15px 0', fontWeight: 'bold'}}>Progreso Anual ({maxLeccion}/52)</p>

                                    <h4 style={{fontSize: '16px', color: '#334155', marginBottom: '10px', marginTop: '20px'}}><i className="fa-solid fa-clock-rotate-left"></i> Historial de Clases por Mes</h4>
                                    
                                    {Object.entries(historialAgrupado).length === 0 ? <p style={{ color: '#94a3b8', fontSize: '13px' }}>Sin historial aún.</p> : (
                                        Object.entries(historialAgrupado).map(([mes, datosMes]) => (
                                            // ACORDEÓN MES (Solo muestra el número de presentes: P: 25)
                                            <Accordion key={mes} title={`${mes} (P: ${datosMes.totalPresentes})`}>
                                                <div className="hmc-body" style={{paddingTop: '10px'}}>
                                                    {Object.entries(datosMes.semanas).map(([semana, asistencias]) => (
                                                        // ACORDEÓN SEMANA (Oculta las tarjetas hasta hacer clic)
                                                        <Accordion key={semana} title={semana}>
                                                            <div className="history-week-block">
                                                                {asistencias.map(asis => (
                                                                    <div className="hwb-class-card" key={asis.id}>
                                                                        <div className="hwb-header">
                                                                            <span className="hwb-date"><i className="fa-regular fa-calendar"></i> {asis.fecha.split('-').reverse().join('/')}</span>
                                                                            <span className="hwb-leccion">Lec. {asis.numeroLeccion} {asis.leccionDada && <i className="fa-solid fa-circle-check" style={{color:'#10b981'}}></i>}</span>
                                                                        </div>
                                                                        <div className="hwb-info">Registrado por: <strong>{asis.registradoPor}</strong></div>
                                                                        <div className="hwb-stats-row">
                                                                            <span className="pill-p">P: {asis.resumen?.presentes || 0}</span>
                                                                            <span className="pill-a">A: {asis.resumen?.ausentes || 0}</span>
                                                                            <span className="pill-pe">Pe: {asis.resumen?.permisos || 0}</span>
                                                                            <span className="pill-o">Ofrenda: ${parseFloat((asis.resumen?.ofrendaTotal || 0).toString()).toFixed(2)}</span>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </Accordion>
                                                    ))}
                                                </div>
                                            </Accordion>
                                        ))
                                    )}
                                </div>
                            </Accordion>
                        );
                    })}
                </div>
            )}

            {/* PESTAÑA 4: AVISOS GLOBALES */}
            {adminTab === 'avisos' && (
                <div className="animate-fade-in" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '25px'}}>
                    <div className="admin-aviso-form-card">
                        <h3 style={{fontSize: '18px', color: '#1e293b', marginBottom: '15px'}}><i className="fa-solid fa-paper-plane" style={{color: '#4f46e5'}}></i> Crear Aviso Oficial</h3>
                        <form onSubmit={publicarAviso}>
                            <div className="admin-form-group">
                                <label className="admin-label">Público Destinatario</label>
                                <select className="admin-input" value={avisoForm.targetRole} onChange={e => setAvisoForm({...avisoForm, targetRole: e.target.value})} required>
                                    <option value="TODOS">📢 Enviar a Todos los Usuarios</option>
                                    {rolesParaDirectorio.map(r => <option key={r.id} value={r.id}>Solo a {r.name}s</option>)}
                                </select>
                            </div>
                            <div className="admin-form-group">
                                <label className="admin-label">Título del Aviso</label>
                                <input type="text" className="admin-input" placeholder="Ej: Reunión Urgente" value={avisoForm.titulo} onChange={e => setAvisoForm({...avisoForm, titulo: e.target.value})} required />
                            </div>
                            <div className="admin-form-group">
                                <label className="admin-label">Mensaje Detallado</label>
                                <textarea className="admin-input" rows={4} placeholder="Escribe los detalles aquí..." value={avisoForm.mensaje} onChange={e => setAvisoForm({...avisoForm, mensaje: e.target.value})} required></textarea>
                            </div>
                            <Button type="submit" disabled={publicandoAviso} style={{ width: '100%', background: '#4f46e5', color: 'white' }}>
                                {publicandoAviso ? 'Publicando...' : 'Enviar Aviso'}
                            </Button>
                        </form>
                    </div>

                    <div className="admin-preview-widget">
                        <h3 style={{fontSize: '18px', color: '#1e293b', marginBottom: '15px'}}><i className="fa-solid fa-mobile-screen"></i> Previsualización y Control</h3>
                        <div style={{ pointerEvents: 'auto' }}>
                            <NotificationsWidget />
                        </div>
                    </div>
                </div>
            )}

            {/* MODALES REUTILIZADOS */}
            <Modal isOpen={editandoUser !== null} onClose={() => setEditandoUser(null)} title={`Editar ${editandoUser?.rol}`}>
                {editandoUser && (
                    <form onSubmit={guardarEdicion}>
                        <div className="admin-form-group"><label className="admin-label">Nombre</label><input className="admin-input" type="text" value={editandoUser.nombre} onChange={e => setEditandoUser({...editandoUser, nombre: e.target.value})} required /></div>
                        <div className="admin-form-group"><label className="admin-label">Género</label><select className="admin-input" value={editandoUser.genero || ''} onChange={e => setEditandoUser({...editandoUser, genero: e.target.value})} required><option value="" disabled>Seleccione...</option><option value="Masculino">Masculino</option><option value="Femenino">Femenino</option></select></div>
                        <div className="admin-form-group"><label className="admin-label">Nacimiento</label><input className="admin-input" type="date" value={editandoUser.fechaNacimiento || ''} onChange={e => setEditandoUser({...editandoUser, fechaNacimiento: e.target.value})} required /></div>
                        {(editandoUser.rol === 'MAESTRO' || editandoUser.rol === 'AUXILIAR') && (<div className="admin-form-group"><label className="admin-label">Campo</label><select className="admin-input" value={editandoUser.campo || ''} onChange={e => setEditandoUser({...editandoUser, campo: e.target.value})} required><option value="" disabled>Seleccione...</option>{IGLESIAS_CAMPOS.map(iglesia => <option key={iglesia} value={iglesia}>{iglesia}</option>)}</select></div>)}
                        <div className="admin-actions"><Button type="button" className="btn-denegar" onClick={() => setEditandoUser(null)}>Cancelar</Button><Button type="submit" className="btn-aprobar">Guardar</Button></div>
                    </form>
                )}
            </Modal>

            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Registrar Nuevo Personal">
                <form onSubmit={guardarNuevoUsuario}>
                    <div className="admin-form-group"><label className="admin-label">Rol</label><select className="admin-input" value={addForm.rol} onChange={e => setAddForm({...addForm, rol: e.target.value})} required><option value="" disabled>Seleccione un rol...</option>{rolesParaDirectorio.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}</select></div>
                    <div className="admin-form-group"><label className="admin-label">Nombre</label><input type="text" className="admin-input" value={addForm.nombre} onChange={(e) => setAddForm({...addForm, nombre: e.target.value})} required /></div>
                    <div className="admin-form-group"><label className="admin-label">Nacimiento</label><div className="admin-date-grid"><select className="admin-input" value={addForm.birthDay} onChange={(e) => setAddForm({...addForm, birthDay: e.target.value})} required><option value="" disabled>Día</option>{days.map(d => <option key={d} value={d < 10 ? `0${d}` : d}>{d}</option>)}</select><select className="admin-input" value={addForm.birthMonth} onChange={(e) => setAddForm({...addForm, birthMonth: e.target.value})} required><option value="" disabled>Mes</option>{months.map((m, i) => <option key={m} value={i + 1 < 10 ? `0${i + 1}` : i + 1}>{m}</option>)}</select><select className="admin-input" value={addForm.birthYear} onChange={(e) => setAddForm({...addForm, birthYear: e.target.value})} required><option value="" disabled>Año</option>{years.map(y => <option key={y} value={y}>{y}</option>)}</select></div></div>
                    <div className="admin-form-group"><label className="admin-label">Género</label><select className="admin-input" value={addForm.genero} onChange={(e) => setAddForm({...addForm, genero: e.target.value})} required><option value="" disabled>Selecciona...</option><option value="Masculino">Masculino</option><option value="Femenino">Femenino</option></select></div>
                    {(addForm.rol === 'MAESTRO' || addForm.rol === 'AUXILIAR') && (<div className="admin-form-group animate-fade-in"><label className="admin-label">Campo</label><select className="admin-input" value={addForm.campo} onChange={(e) => setAddForm({...addForm, campo: e.target.value})} required><option value="" disabled>Selecciona...</option>{IGLESIAS_CAMPOS.map(iglesia => <option key={iglesia} value={iglesia}>{iglesia}</option>)}</select></div>)}
                    <div className="admin-form-group"><label className="admin-label">Contraseña</label><input type="password" placeholder="••••••" className="admin-input" value={addForm.clave} onChange={(e) => setAddForm({...addForm, clave: e.target.value})} required /></div>
                    <div className="admin-actions" style={{ marginTop: '20px' }}><Button type="button" className="btn-denegar" onClick={() => setIsAddModalOpen(false)}>Cancelar</Button><Button type="submit" className="btn-aprobar">Crear Usuario</Button></div>
                </form>
            </Modal>
        </div>
    );
};
