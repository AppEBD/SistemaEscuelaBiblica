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
        usuarios, cargando, editandoUser, setEditandoUser, solicitarAprobacion, solicitarEliminacion, guardarEdicion,
        searchTerm, setSearchTerm, usuariosFiltrados, isAddModalOpen, setIsAddModalOpen, addForm, setAddForm, guardarNuevoUsuario,
        days, months, years, serviceYears, adminTab, setAdminTab, alumnosGlobal, asistenciasGlobal, agruparHistorialPorCampo,
        avisosGlobales, isAvisoModalOpen, setIsAvisoModalOpen, avisoForm, setAvisoForm, 
        guardandoAviso, abrirModalNuevoAviso, abrirModalEditarAviso, guardarAviso, solicitarEliminarAviso, solicitarLimpiarSede,
        confirmState, setConfirmState, confirmInputText, setConfirmInputText,
        asistenciasHoy, metricasHoy, agruparMonitorGlobal,
        insigniasGlobales, isInsigniaModalOpen, setIsInsigniaModalOpen, insigniaForm, setInsigniaForm, abrirModalNuevaInsignia, abrirModalEditarInsignia, guardarInsignia, solicitarEliminarInsignia,
        isAsignarModalOpen, setIsAsignarModalOpen, insigniaActivaParaAsignar, usuariosConInsignia, toggleUsuarioInsignia, guardarAsignacionInsignias, filtroRolInsignia, setFiltroRolInsignia, usuariosParaAsignar, toggleTodosDelFiltro,
        abrirModalAsignarInsignia // <--- ¡AQUÍ ESTÁ IMPORTADA LISTA PARA USARSE!
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
                {user.campo && <div><i className="fa-solid fa-map-location-dot"></i> <strong>Sede:</strong> {user.campo}</div>}
                <div><i className="fa-solid fa-venus-mars"></i> <strong>Género:</strong> {user.genero || 'No especificado'}</div>
                <div><i className="fa-solid fa-calendar-check"></i> <strong>Inicio Servicio:</strong> {user.fechaInicioServicio ? user.fechaInicioServicio.split('-').reverse().join('/') : 'Sin definir'}</div>
                <div><i className="fa-solid fa-medal"></i> <strong>Insignias:</strong> {user.insignias?.length || 0} asignadas</div>
            </div>
            <div className="admin-actions">
                {user.estado === 'Pendiente' ? (
                    <>
                        <Button className="btn-aprobar" onClick={() => solicitarAprobacion(user)}><i className="fa-solid fa-check"></i></Button>
                        <Button className="btn-denegar" onClick={() => solicitarEliminacion(user, true)}><i className="fa-solid fa-xmark"></i></Button>
                    </>
                ) : (
                    <>
                        <Button className="btn-editar" onClick={() => setEditandoUser(user)}><i className="fa-solid fa-pen"></i></Button>
                        <Button className="btn-denegar" onClick={() => solicitarEliminacion(user, false)}><i className="fa-solid fa-trash"></i></Button>
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

            {adminTab === 'home' && (
                <div className="admin-home-grid animate-fade-in">
                    
                    <div className="admin-big-card card-emerald" onClick={() => setAdminTab('monitor')}>
                        <div className="abc-content">
                            <h3>Monitor en Vivo</h3>
                            <p>Asistencia consolidada de hoy e historial global.</p>
                            <span className="abc-stat">{metricasHoy.sedesEnviadas} Sedes Reportadas Hoy</span>
                        </div>
                        <i className="fa-solid fa-satellite-dish abc-icon"></i>
                    </div>

                    <div className="admin-big-card card-cyan" onClick={() => setAdminTab('insignias')}>
                        <div className="abc-content">
                            <h3>Insignias y Logros</h3>
                            <p>Crea medallas y premia a tu equipo por su trabajo.</p>
                            <span className="abc-stat">{insigniasGlobales.length} Insignias Creadas</span>
                        </div>
                        <i className="fa-solid fa-medal abc-icon"></i>
                    </div>

                    <div className="admin-big-card card-blue" onClick={() => setAdminTab('directorio')}>
                        <div className="abc-content">
                            <h3>Gestión de Personal</h3>
                            <p>Administra accesos, aprueba solicitudes y edita perfiles.</p>
                            <span className="abc-stat">{usuarios.length} Usuarios</span>
                        </div>
                        <i className="fa-solid fa-users abc-icon"></i>
                    </div>

                    <div className="admin-big-card card-purple" onClick={() => setAdminTab('campos')}>
                        <div className="abc-content">
                            <h3>Historial de Sedes</h3>
                            <p>Verifica el progreso y asistencia de cada campo individual.</p>
                            <span className="abc-stat">{IGLESIAS_CAMPOS.length} Sedes Registradas</span>
                        </div>
                        <i className="fa-solid fa-map-location-dot abc-icon"></i>
                    </div>

                    <div className="admin-big-card card-amber" onClick={() => setAdminTab('avisos')}>
                        <div className="abc-content">
                            <h3>Centro de Comunicaciones</h3>
                            <p>Envía mensajes oficiales a tu personal.</p>
                            <span className="abc-stat">{avisosGlobales.length} Avisos Activos</span>
                        </div>
                        <i className="fa-solid fa-tower-broadcast abc-icon"></i>
                    </div>
                </div>
            )}

            {adminTab !== 'home' && (
                <button className="btn-back-admin animate-fade-in" onClick={() => setAdminTab('home')}>
                    <i className="fa-solid fa-arrow-left"></i> Volver al Menú Principal
                </button>
            )}

            {adminTab === 'insignias' && (
                <div className="animate-fade-in">
                    <div className="admin-toolbar">
                        <button className="btn-add-new-user" onClick={abrirModalNuevaInsignia} style={{ background: '#06b6d4', width: '100%', justifyContent: 'center' }}>
                            <i className="fa-solid fa-award"></i> Crear Nueva Insignia
                        </button>
                    </div>

                    <div style={{ background: '#e0f2fe', padding: '15px 20px', borderRadius: '16px', marginBottom: '25px', display: 'flex', gap: '15px', alignItems: 'center' }}>
                        <i className="fa-solid fa-circle-info" style={{ color: '#0284c7', fontSize: '24px' }}></i>
                        <div>
                            <h4 style={{ margin: '0 0 5px 0', color: '#0f172a', fontSize: '15px', fontWeight: '900' }}>Insignia Automática (Tiempo de Servicio)</h4>
                            <p style={{ margin: 0, color: '#475569', fontSize: '13px', lineHeight: '1.4' }}>
                                El sistema calcula automáticamente el tiempo que un usuario lleva sirviendo basándose en la <strong>"Fecha de Inicio de Servicio"</strong> que tú le asignas al registrarlo. Esa insignia de años/meses le aparecerá por defecto a todos y no necesitas crearla aquí.
                            </p>
                        </div>
                    </div>

                    <div className="avisos-grid">
                        {insigniasGlobales.length === 0 ? (
                            <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#64748b', padding: '30px' }}><i className="fa-solid fa-medal fa-2x" style={{ opacity: 0.5, marginBottom: '10px', display: 'block' }}></i> No has creado ninguna insignia personalizada aún.</p>
                        ) : (
                            insigniasGlobales.map(insignia => (
                                <div className="insignia-card" key={insignia.id}>
                                    <div className="insignia-icon">{insignia.icono}</div>
                                    <h4 className="insignia-title">{insignia.titulo}</h4>
                                    <p className="insignia-desc">{insignia.descripcion}</p>
                                    
                                    <button className="btn-add-new-user" style={{ background: '#10b981', width: '100%', justifyContent: 'center', marginBottom: '10px', minHeight: '45px', fontSize: '13px' }} onClick={() => abrirModalAsignarInsignia(insignia)}>
                                        <i className="fa-solid fa-users"></i> Asignar a Usuarios
                                    </button>

                                    <div className="insignia-actions">
                                        <button className="btn-editar" style={{ flex: 1 }} onClick={() => abrirModalEditarInsignia(insignia)}><i className="fa-solid fa-pen"></i> Editar</button>
                                        <button className="btn-denegar" style={{ flex: 1 }} onClick={() => solicitarEliminarInsignia(insignia.id)}><i className="fa-solid fa-trash"></i> Eliminar</button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {adminTab === 'monitor' && (
                <div className="live-monitor-section animate-fade-in">
                    
                    <div className="live-monitor-header">
                        <h3><i className="fa-solid fa-satellite-dish fa-beat" style={{color: '#ef4444'}}></i> Monitor Global de Hoy</h3>
                        <span className="live-date">{new Date().toLocaleDateString('es-ES', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                    </div>

                    <div className="premium-summary-card">
                        <div className="psc-header">
                            <div className="psc-title"><i className="fa-solid fa-chart-line"></i> Resumen de Hoy</div>
                            <div className="psc-date">{new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}</div>
                        </div>
                        <div className="psc-body">
                            <div className="psc-col">
                                <div className="psc-num text-white">{metricasHoy.presentes}</div>
                                <div className="psc-label">PRESENTES</div>
                                <div className="psc-breakdown">
                                    <span><i className="fa-solid fa-child"></i> {metricasHoy.ninosPresentes}</span>
                                    <span><i className="fa-solid fa-child-dress"></i> {metricasHoy.ninasPresentes}</span>
                                </div>
                            </div>
                            <div className="psc-divider"></div>
                            <div className="psc-col">
                                <div className="psc-num text-pink">{metricasHoy.ausentes}</div>
                                <div className="psc-label">AUSENTES</div>
                                <div className="psc-breakdown">
                                    <span><i className="fa-solid fa-child"></i> {metricasHoy.ninosAusentes}</span>
                                    <span><i className="fa-solid fa-child-dress"></i> {metricasHoy.ninasAusentes}</span>
                                </div>
                            </div>
                            <div className="psc-divider"></div>
                            <div className="psc-col">
                                <div className="psc-num text-yellow">{metricasHoy.permisos}</div>
                                <div className="psc-label">PERMISOS</div>
                                <div className="psc-breakdown">
                                    <span><i className="fa-solid fa-child"></i> {metricasHoy.ninosPermisos}</span>
                                    <span><i className="fa-solid fa-child-dress"></i> {metricasHoy.ninasPermisos}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="secondary-stats-grid">
                        <div className="ssc-card">
                            <i className="fa-solid fa-sack-dollar text-blue"></i>
                            <div>
                                <h4>${metricasHoy.ofrenda.toFixed(2)}</h4>
                                <span>Ofrenda Global</span>
                            </div>
                        </div>
                        <div className="ssc-card">
                            <i className="fa-solid fa-church text-purple"></i>
                            <div>
                                <h4>{metricasHoy.sedesEnviadas} / {IGLESIAS_CAMPOS.length}</h4>
                                <span>Sedes Reportadas</span>
                            </div>
                        </div>
                    </div>

                    <Accordion title={`Estado de Sedes Hoy (${metricasHoy.sedesEnviadas} Recibidas / ${IGLESIAS_CAMPOS.length - metricasHoy.sedesEnviadas} Esperando)`}>
                        <div className="live-fields-grid" style={{ paddingTop: '10px' }}>
                            {IGLESIAS_CAMPOS.map(campo => {
                                const reporte = asistenciasHoy.find(a => a.campo === campo);
                                if (reporte) {
                                    return (
                                        <div className="live-field-card reported" key={campo}>
                                            <div className="lfc-header">
                                                <h4>{campo}</h4>
                                                <span className="lfc-badge success"><i className="fa-solid fa-check"></i> Recibido</span>
                                            </div>
                                            <div className="lfc-body">
                                                <span title="Presentes"><i className="fa-solid fa-user-check" style={{color: '#10b981'}}></i> {reporte.resumen?.presentes || 0}</span>
                                                <span title="Ausentes"><i className="fa-solid fa-user-xmark" style={{color: '#ef4444'}}></i> {reporte.resumen?.ausentes || 0}</span>
                                                <span title="Permisos"><i className="fa-solid fa-user-clock" style={{color: '#f59e0b'}}></i> {reporte.resumen?.permisos || 0}</span>
                                                <span style={{fontWeight: 900, color: '#0f172a'}} title="Ofrenda"><i className="fa-solid fa-coins" style={{color: '#3b82f6'}}></i> ${parseFloat((reporte.resumen?.ofrendaTotal || 0).toString()).toFixed(2)}</span>
                                            </div>
                                        </div>
                                    );
                                } else {
                                    return (
                                        <div className="live-field-card pending" key={campo}>
                                            <div className="lfc-header">
                                                <h4>{campo}</h4>
                                                <span className="lfc-badge warning"><i className="fa-solid fa-clock"></i> Esperando</span>
                                            </div>
                                            <div className="lfc-body empty">Sin reporte enviado hoy.</div>
                                        </div>
                                    );
                                }
                            })}
                        </div>
                    </Accordion>

                    <div style={{ marginTop: '35px', borderTop: '2px dashed #f1f5f9', paddingTop: '25px' }}>
                        <h3 style={{fontSize: '18px', color: '#1e293b', marginBottom: '20px'}}>
                            <i className="fa-solid fa-chart-column" style={{color: '#8b5cf6'}}></i> Reportes Globales Anteriores
                        </h3>
                        {(() => {
                            const historial = agruparMonitorGlobal();
                            if (Object.keys(historial).length === 0) return <p style={{color: '#64748b'}}>No hay datos históricos almacenados.</p>;

                            return Object.entries(historial).map(([mes, datosMes]) => (
                                <Accordion key={mes} title={`${mes} (Total: ${datosMes.totalPresentes} Presentes)`}>
                                    <div style={{paddingTop: '10px'}}>
                                        {Object.entries(datosMes.semanas).map(([semana, datosSemana]) => (
                                            <Accordion key={semana} title={semana}>
                                                
                                                <div className="premium-summary-card" style={{ marginBottom: '15px' }}>
                                                    <div className="psc-header">
                                                        <div className="psc-title"><i className="fa-solid fa-calendar-week"></i> Resumen de la {semana}</div>
                                                    </div>
                                                    <div className="psc-body">
                                                        <div className="psc-col">
                                                            <div className="psc-num text-white">{datosSemana.presentes}</div>
                                                            <div className="psc-label">PRESENTES</div>
                                                            <div className="psc-breakdown">
                                                                <span><i className="fa-solid fa-child"></i> {datosSemana.ninosPresentes}</span>
                                                                <span><i className="fa-solid fa-child-dress"></i> {datosSemana.ninasPresentes}</span>
                                                            </div>
                                                        </div>
                                                        <div className="psc-divider"></div>
                                                        <div className="psc-col">
                                                            <div className="psc-num text-pink">{datosSemana.ausentes}</div>
                                                            <div className="psc-label">AUSENTES</div>
                                                            <div className="psc-breakdown">
                                                                <span><i className="fa-solid fa-child"></i> {datosSemana.ninosAusentes}</span>
                                                                <span><i className="fa-solid fa-child-dress"></i> {datosSemana.ninasAusentes}</span>
                                                            </div>
                                                        </div>
                                                        <div className="psc-divider"></div>
                                                        <div className="psc-col">
                                                            <div className="psc-num text-yellow">{datosSemana.permisos}</div>
                                                            <div className="psc-label">PERMISOS</div>
                                                            <div className="psc-breakdown">
                                                                <span><i className="fa-solid fa-child"></i> {datosSemana.ninosPermisos}</span>
                                                                <span><i className="fa-solid fa-child-dress"></i> {datosSemana.ninasPermisos}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="secondary-stats-grid">
                                                    <div className="ssc-card">
                                                        <i className="fa-solid fa-sack-dollar text-blue"></i>
                                                        <div>
                                                            <h4>${datosSemana.ofrenda.toFixed(2)}</h4>
                                                            <span>Ofrenda Semanal</span>
                                                        </div>
                                                    </div>
                                                    <div className="ssc-card">
                                                        <i className="fa-solid fa-file-contract text-purple"></i>
                                                        <div>
                                                            <h4>{datosSemana.reportes}</h4>
                                                            <span>Reportes Recibidos</span>
                                                        </div>
                                                    </div>
                                                </div>

                                            </Accordion>
                                        ))}
                                    </div>
                                </Accordion>
                            ));
                        })()}
                    </div>
                </div>
            )}

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

            {adminTab === 'campos' && (
                <div className="animate-fade-in">
                    <h3 style={{fontSize: '20px', color: '#1e293b', marginBottom: '20px'}}><i className="fa-solid fa-map-location-dot"></i> Resumen de Sedes</h3>
                    {IGLESIAS_CAMPOS.map(campo => {
                        const alumnosSede = alumnosGlobal.filter(a => a.campo === campo);
                        const totalSede = alumnosSede.length;
                        const totalNinos = alumnosSede.filter(a => a.genero === 'Masculino').length;
                        const totalNinas = alumnosSede.filter(a => a.genero === 'Femenino').length;

                        const historialSede = asistenciasGlobal.filter(a => a.campo === campo);
                        const maxLeccion = historialSede.length > 0 ? Math.max(0, ...historialSede.filter(a => a.leccionDada).map(a => a.numeroLeccion || 0)) : 0;
                        const historialAgrupado = agruparHistorialPorCampo(campo);
                        
                        return (
                            <Accordion key={campo} title={`${campo} - ${totalSede} registros`}>
                                <div className="campo-details-container">
                                    <div className="campo-quick-stats">
                                        <div className="cqs-item"><i className="fa-solid fa-child" style={{color: '#38bdf8'}}></i> <span>{totalNinos} Niños</span></div>
                                        <div className="cqs-item"><i className="fa-solid fa-child-dress" style={{color: '#f472b6'}}></i> <span>{totalNinas} Niñas</span></div>
                                        <div className="cqs-item"><i className="fa-solid fa-book-open" style={{color: '#10b981'}}></i> <span>Lección {maxLeccion}</span></div>
                                    </div>
                                    
                                    <div className="campo-progress-bar">
                                        <div className="cpb-fill" style={{width: `${Math.min(100, (maxLeccion / 52) * 100)}%`}}></div>
                                    </div>
                                    <p style={{fontSize: '11px', color: '#94a3b8', textAlign: 'right', margin: '5px 0 15px 0', fontWeight: 'bold'}}>Progreso Anual ({maxLeccion}/52)</p>

                                    <h4 style={{fontSize: '16px', color: '#334155', marginBottom: '10px', marginTop: '20px'}}><i className="fa-solid fa-clock-rotate-left"></i> Historial de Clases por Mes</h4>
                                    
                                    {Object.entries(historialAgrupado).length === 0 ? <p style={{ color: '#94a3b8', fontSize: '13px' }}>Sin historial aún.</p> : (
                                        Object.entries(historialAgrupado).map(([mes, datosMes]) => (
                                            <Accordion key={mes} title={`${mes} (P: ${datosMes.totalPresentes})`}>
                                                <div className="hmc-body" style={{paddingTop: '10px'}}>
                                                    {Object.entries(datosMes.semanas).map(([semana, asistencias]) => (
                                                        <Accordion key={semana} title={semana}>
                                                            <div className="history-week-block">
                                                                {asistencias.map(asis => (
                                                                    <div className="hwb-class-card" key={asis.id}>
                                                                        <div className="hwb-header">
                                                                            <span className="hwb-date"><i className="fa-regular fa-calendar"></i> {asis.fecha ? asis.fecha.split('-').reverse().join('/') : 'Sin Fecha'}</span>
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

                                    <div className="danger-zone">
                                        <button className="btn-reset-sede" onClick={() => solicitarLimpiarSede(campo)}>
                                            <i className="fa-solid fa-rotate-left"></i> Vaciar Registros (Restaurar Sede)
                                        </button>
                                    </div>
                                </div>
                            </Accordion>
                        );
                    })}
                </div>
            )}

            {adminTab === 'avisos' && (
                <div className="animate-fade-in" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '25px'}}>
                    <div className="admin-aviso-form-card">
                        <h3 style={{fontSize: '18px', color: '#1e293b', marginBottom: '15px'}}><i className="fa-solid fa-paper-plane" style={{color: '#4f46e5'}}></i> Crear Aviso Oficial</h3>
                        <form onSubmit={guardarAviso}>
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
                            <Button type="submit" disabled={guardandoAviso} style={{ width: '100%', background: '#4f46e5', color: 'white' }}>
                                {guardandoAviso ? 'Publicando...' : 'Enviar Aviso'}
                            </Button>
                        </form>
                    </div>
                    
                    <div className="avisos-grid" style={{ alignContent: 'start' }}>
                        <h3 style={{fontSize: '18px', color: '#1e293b', marginBottom: '5px'}}><i className="fa-solid fa-tower-broadcast"></i> Avisos Publicados</h3>
                        <p style={{fontSize: '13px', color: '#64748b', marginBottom: '15px'}}>Clic en una tarjeta para editar o eliminar.</p>
                        
                        {avisosGlobales.length === 0 ? (
                            <p style={{ textAlign: 'center', color: '#64748b', padding: '20px' }}>No hay avisos.</p>
                        ) : (
                            avisosGlobales.map(aviso => (
                                <div className="aviso-admin-card" key={aviso.id} onClick={() => abrirModalEditarAviso(aviso)} title="Clic para editar o eliminar">
                                    <div className="aac-header">
                                        <h4>{aviso.titulo}</h4>
                                        <span className="aac-target">{aviso.targetRole === 'TODOS' ? 'Todos' : aviso.targetRole}</span>
                                    </div>
                                    <p className="aac-mensaje">{aviso.mensaje}</p>
                                    <div className="aac-footer">
                                        <span><i className="fa-regular fa-calendar-days"></i> {aviso.fecha} {aviso.hora}</span>
                                        <div className="aac-stats">
                                            <span>👍 {aviso.up || 0}</span>
                                            <span>👎 {aviso.down || 0}</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* MODALES DE CONFIGURACIÓN UNIVERSAL */}
            <Modal isOpen={confirmState.isOpen} onClose={() => { setConfirmState(prev => ({...prev, isOpen: false})); setConfirmInputText(''); }} title={confirmState.title}>
                <div style={{ fontSize: '15px', color: '#475569', marginBottom: '20px', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
                    {confirmState.message}
                </div>
                {confirmState.requireInput && (
                    <div className="admin-form-group">
                        <label className="admin-label">
                            Escribe <strong style={{color: '#ef4444'}}>{confirmState.requireInput}</strong> para confirmar:
                        </label>
                        <input type="text" className="admin-input" value={confirmInputText} onChange={e => setConfirmInputText(e.target.value)} placeholder={`Escribe ${confirmState.requireInput} aquí`} style={{borderColor: confirmInputText === confirmState.requireInput ? '#10b981' : '#e2e8f0'}} />
                    </div>
                )}
                <div className="admin-actions">
                    {confirmState.type !== 'success' || confirmState.title.includes('Aprobar') ? (
                        <Button type="button" style={{ background: '#f1f5f9', color: '#475569', flex: 1, padding: '12px', borderRadius: '12px', fontWeight: '800', border: 'none', cursor: 'pointer' }} onClick={() => { setConfirmState(prev => ({...prev, isOpen: false})); setConfirmInputText(''); }}>
                            Cancelar
                        </Button>
                    ) : null}
                    
                    <Button type="button" className={confirmState.type === 'danger' ? 'btn-denegar' : 'btn-aprobar'} disabled={confirmState.requireInput ? confirmInputText !== confirmState.requireInput : false} onClick={() => { confirmState.onConfirm(); setConfirmInputText(''); }}>
                        {confirmState.confirmText}
                    </Button>
                </div>
            </Modal>

            {/* MODALES DE EDICIÓN DE USUARIOS CON FECHA DE SERVICIO */}
            <Modal isOpen={editandoUser !== null} onClose={() => setEditandoUser(null)} title={`Editar ${editandoUser?.rol}`}>
                {editandoUser && (
                    <form onSubmit={guardarEdicion}>
                        <div className="admin-form-group"><label className="admin-label">Nombre</label><input className="admin-input" type="text" value={editandoUser.nombre} onChange={e => setEditandoUser({...editandoUser, nombre: e.target.value})} required /></div>
                        <div className="admin-form-group"><label className="admin-label">Género</label><select className="admin-input" value={editandoUser.genero || ''} onChange={e => setEditandoUser({...editandoUser, genero: e.target.value})} required><option value="" disabled>Seleccione...</option><option value="Masculino">Masculino</option><option value="Femenino">Femenino</option></select></div>
                        <div className="admin-form-group"><label className="admin-label">Nacimiento</label><input className="admin-input" type="date" value={editandoUser.fechaNacimiento || ''} onChange={e => setEditandoUser({...editandoUser, fechaNacimiento: e.target.value})} required /></div>
                        
                        <div className="admin-form-group" style={{ background: '#f0fdf4', padding: '10px', borderRadius: '12px', border: '1px solid #bbf7d0' }}>
                            <label className="admin-label" style={{ color: '#166534' }}>Inicio de Servicio <span style={{fontSize: '10px'}}>(Para insignia)</span></label>
                            <input className="admin-input" type="date" value={editandoUser.fechaInicioServicio || ''} onChange={e => setEditandoUser({...editandoUser, fechaInicioServicio: e.target.value})} required style={{ borderColor: '#86efac' }} />
                        </div>

                        {(editandoUser.rol === 'MAESTRO' || editandoUser.rol === 'AUXILIAR') && (
                            <div className="admin-form-group animate-fade-in">
                                <label className="admin-label">Sede / Campo Asignado <span style={{color: '#10b981', fontSize: '10px'}}>(Obligatorio)</span></label>
                                <select className="admin-input" value={editandoUser.campo || ''} onChange={e => setEditandoUser({...editandoUser, campo: e.target.value})} required>
                                    <option value="" disabled>Seleccione una Sede...</option>
                                    {IGLESIAS_CAMPOS.map(iglesia => <option key={iglesia} value={iglesia}>{iglesia}</option>)}
                                </select>
                            </div>
                        )}
                        <div className="admin-actions"><Button type="button" className="btn-denegar" onClick={() => setEditandoUser(null)}>Cancelar</Button><Button type="submit" className="btn-aprobar">Guardar</Button></div>
                    </form>
                )}
            </Modal>

            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Registrar Nuevo Personal">
                <form onSubmit={guardarNuevoUsuario}>
                    <div className="admin-form-group">
                        <label className="admin-label">Rol del Sistema</label>
                        <select className="admin-input" value={addForm.rol} onChange={e => setAddForm({...addForm, rol: e.target.value})} required>
                            <option value="" disabled>Seleccione un rol primero...</option>
                            {rolesParaDirectorio.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                        </select>
                    </div>
                    
                    {(addForm.rol === 'MAESTRO' || addForm.rol === 'AUXILIAR') && (
                        <div className="admin-form-group animate-fade-in">
                            <label className="admin-label">Sede / Campo Asignado <span style={{color: '#10b981', fontSize: '10px'}}>(Obligatorio)</span></label>
                            <select className="admin-input" value={addForm.campo} onChange={(e) => setAddForm({...addForm, campo: e.target.value})} required>
                                <option value="" disabled>Debe Seleccionar una Sede...</option>
                                {IGLESIAS_CAMPOS.map(iglesia => <option key={iglesia} value={iglesia}>{iglesia}</option>)}
                            </select>
                        </div>
                    )}

                    <div className="admin-form-group"><label className="admin-label">Nombre Completo</label><input type="text" className="admin-input" value={addForm.nombre} onChange={(e) => setAddForm({...addForm, nombre: e.target.value})} required /></div>
                    
                    <div className="admin-form-group">
                        <label className="admin-label">Fecha de Nacimiento</label>
                        <div className="admin-date-grid">
                            <select className="admin-input" value={addForm.birthDay} onChange={(e) => setAddForm({...addForm, birthDay: e.target.value})} required><option value="" disabled>Día</option>{days.map(d => <option key={d} value={d < 10 ? `0${d}` : d}>{d}</option>)}</select>
                            <select className="admin-input" value={addForm.birthMonth} onChange={(e) => setAddForm({...addForm, birthMonth: e.target.value})} required><option value="" disabled>Mes</option>{months.map((m, i) => <option key={m} value={i + 1 < 10 ? `0${i + 1}` : i + 1}>{m}</option>)}</select>
                            <select className="admin-input" value={addForm.birthYear} onChange={(e) => setAddForm({...addForm, birthYear: e.target.value})} required><option value="" disabled>Año</option>{years.map(y => <option key={y} value={y}>{y}</option>)}</select>
                        </div>
                    </div>

                    <div className="admin-form-group"><label className="admin-label">Género</label><select className="admin-input" value={addForm.genero} onChange={(e) => setAddForm({...addForm, genero: e.target.value})} required><option value="" disabled>Selecciona...</option><option value="Masculino">Masculino</option><option value="Femenino">Femenino</option></select></div>
                    
                    <div className="admin-form-group" style={{ background: '#f0fdf4', padding: '15px', borderRadius: '16px', border: '1px solid #bbf7d0', marginTop: '20px' }}>
                        <label className="admin-label" style={{ color: '#166534' }}>¿Desde cuándo sirve en EBD? <span style={{fontSize: '10px'}}>(Para insignia)</span></label>
                        <div className="admin-date-grid">
                            <select className="admin-input" value={addForm.servicioDay} onChange={(e) => setAddForm({...addForm, servicioDay: e.target.value})} required style={{ borderColor: '#86efac' }}><option value="" disabled>Día</option>{days.map(d => <option key={d} value={d < 10 ? `0${d}` : d}>{d}</option>)}</select>
                            <select className="admin-input" value={addForm.servicioMonth} onChange={(e) => setAddForm({...addForm, servicioMonth: e.target.value})} required style={{ borderColor: '#86efac' }}><option value="" disabled>Mes</option>{months.map((m, i) => <option key={m} value={i + 1 < 10 ? `0${i + 1}` : i + 1}>{m}</option>)}</select>
                            <select className="admin-input" value={addForm.servicioYear} onChange={(e) => setAddForm({...addForm, servicioYear: e.target.value})} required style={{ borderColor: '#86efac' }}><option value="" disabled>Año</option>{serviceYears.map(y => <option key={y} value={y}>{y}</option>)}</select>
                        </div>
                    </div>

                    <div className="admin-form-group"><label className="admin-label">Contraseña</label><input type="password" placeholder="••••••" className="admin-input" value={addForm.clave} onChange={(e) => setAddForm({...addForm, clave: e.target.value})} required /></div>
                    <div className="admin-actions" style={{ marginTop: '20px' }}><Button type="button" className="btn-denegar" onClick={() => setIsAddModalOpen(false)}>Cancelar</Button><Button type="submit" className="btn-aprobar">Crear Usuario</Button></div>
                </form>
            </Modal>

            {/* MODAL DE INSIGNIAS PERSONALIZADAS */}
            <Modal isOpen={isInsigniaModalOpen} onClose={() => setIsInsigniaModalOpen(false)} title={insigniaForm.id ? "Modificar Insignia" : "Crear Nueva Insignia"}>
                <form onSubmit={guardarInsignia}>
                    <div className="admin-form-group">
                        <label className="admin-label">Icono (Emoji)</label>
                        <input type="text" className="admin-input" placeholder="Ej: 🌟" maxLength={2} value={insigniaForm.icono} onChange={e => setInsigniaForm({...insigniaForm, icono: e.target.value})} required style={{ fontSize: '30px', textAlign: 'center', height: '60px' }} />
                    </div>
                    <div className="admin-form-group">
                        <label className="admin-label">Título de la Insignia</label>
                        <input type="text" className="admin-input" placeholder="Ej: Maestro Destacado" value={insigniaForm.titulo} onChange={e => setInsigniaForm({...insigniaForm, titulo: e.target.value})} required />
                    </div>
                    <div className="admin-form-group">
                        <label className="admin-label">Descripción o Motivo</label>
                        <textarea className="admin-input" rows={3} placeholder="Ej: Por mantener asistencia perfecta..." value={insigniaForm.descripcion} onChange={e => setInsigniaForm({...insigniaForm, descripcion: e.target.value})} required></textarea>
                    </div>
                    <div className="admin-actions" style={{ marginTop: '25px' }}>
                        <Button type="button" className="btn-denegar" onClick={() => setIsInsigniaModalOpen(false)}>Cancelar</Button>
                        <Button type="submit" className="btn-aprobar">Guardar Insignia</Button>
                    </div>
                </form>
            </Modal>

            {/* MODAL PARA ASIGNAR INSIGNIAS A USUARIOS (CON FILTRO DE ROL Y SELECCIÓN MASIVA) */}
            <Modal isOpen={isAsignarModalOpen} onClose={() => setIsAsignarModalOpen(false)} title="Asignar Insignia">
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                    <div style={{ fontSize: '45px', marginBottom: '10px' }}>{insigniaActivaParaAsignar?.icono}</div>
                    <h3 style={{ margin: '0 0 5px 0', color: '#1e293b' }}>{insigniaActivaParaAsignar?.titulo}</h3>
                    <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>Selecciona a los usuarios que merecen portar esta insignia en su perfil.</p>
                </div>

                <div className="admin-form-group">
                    <label className="admin-label">Filtrar lista por Rol</label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <select className="admin-input" value={filtroRolInsignia} onChange={e => setFiltroRolInsignia(e.target.value)} style={{ padding: '10px', fontSize: '14px', flex: 1 }}>
                            <option value="TODOS">Mostrar todos los usuarios</option>
                            {rolesParaDirectorio.map(r => <option key={r.id} value={r.id}>Solo {r.name}s</option>)}
                        </select>
                        <button type="button" onClick={toggleTodosDelFiltro} style={{ background: '#10b981', color: 'white', border: 'none', borderRadius: '12px', padding: '0 15px', fontWeight: '800', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                            <i className="fa-solid fa-check-double"></i> Marcar Todos
                        </button>
                    </div>
                </div>
                
                <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '20px', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
                    {usuariosParaAsignar.length === 0 ? <p style={{textAlign: 'center', color: '#94a3b8', padding: '20px'}}>No hay usuarios en esta categoría.</p> : null}
                    {usuariosParaAsignar.map(u => (
                        <div key={u.id} className="user-assign-row" onClick={() => toggleUsuarioInsignia(u.id)}>
                            <div className="user-assign-info">
                                <strong style={{ fontSize: '14px', color: '#1e293b' }}>{u.nombre}</strong>
                                <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '800' }}>{u.rol} {u.campo ? `• ${u.campo}` : ''}</span>
                            </div>
                            <input type="checkbox" checked={usuariosConInsignia.includes(u.id)} readOnly style={{ width: '20px', height: '20px', accentColor: '#10b981', pointerEvents: 'none' }} />
                        </div>
                    ))}
                </div>
                
                <div className="admin-actions">
                    <Button type="button" style={{ background: '#f1f5f9', color: '#475569', flex: 1 }} onClick={() => setIsAsignarModalOpen(false)}>Cancelar</Button>
                    <Button type="button" className="btn-aprobar" onClick={guardarAsignacionInsignias} disabled={cargando} style={{ flex: 2 }}>
                        {cargando ? 'Guardando...' : `Asignar a ${usuariosConInsignia.length} usuarios`}
                    </Button>
                </div>
            </Modal>

            {/* MODAL AVISOS */}
            <Modal isOpen={isAvisoModalOpen} onClose={() => setIsAvisoModalOpen(false)} title={avisoForm.id ? "Modificar Aviso" : "Crear Nuevo Aviso"}>
                {avisoForm.id && (
                    <div className="aviso-delete-zone animate-fade-in">
                        <span><i className="fa-solid fa-triangle-exclamation"></i> ¿Ya no necesitas este aviso?</span>
                        <button type="button" className="btn-eliminar-aviso-premium" onClick={solicitarEliminarAviso}>
                            <i className="fa-solid fa-trash"></i> Eliminar Aviso Permanentemente
                        </button>
                    </div>
                )}

                <form onSubmit={guardarAviso}>
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
                    
                    <div className="admin-actions" style={{ marginTop: '25px', gap: '10px' }}>
                        <Button type="button" style={{ background: '#f1f5f9', color: '#475569', flex: 1, padding: '12px', borderRadius: '12px', fontWeight: '800', border: 'none', cursor: 'pointer' }} onClick={() => setIsAvisoModalOpen(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" className="btn-aprobar" disabled={guardandoAviso}>
                            {guardandoAviso ? 'Procesando...' : (avisoForm.id ? 'Guardar Cambios' : 'Publicar Aviso')}
                        </Button>
                    </div>
                </form>
            </Modal>

        </div>
    );
};
