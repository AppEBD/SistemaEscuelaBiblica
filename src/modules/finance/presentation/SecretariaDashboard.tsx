import React from 'react';
import { useSecretariaLogic } from './SecretariaDashboard.logic';
import { NotificationsWidget } from '../../../shared/components/notifications/NotificationsWidget';
import { BadgesPanel } from '../../students/presentation/components/BadgesPanel';
import Modal from '../../../shared/components/Modal'; 
import { Button } from '../../../shared/components/Button';
import Accordion from '../../../shared/components/Accordion'; 
import './SecretariaDashboard.css';

export const SecretariaDashboard = () => {
    const { 
        userData, cargando, mainTab, setMainTab,
        isProfileOpen, setIsProfileOpen, appTheme, setAppTheme, cerrarSesionApp, insigniasGlobales,
        confirmState, setConfirmState,
        totalFondos, agruparTransaccionesPorMes,
        isTxModalOpen, setIsTxModalOpen, txForm, setTxForm,
        guardarTransaccion, estadoTxInicial
    } = useSecretariaLogic();

    const nombreUsuario = userData?.nombre || 'Secretaría';
    const inicial = nombreUsuario.charAt(0).toUpperCase();

    // Componente interno reutilizable para dibujar las tarjetas de transacciones sin duplicar código
    const renderTransactionCard = (tx: any) => (
        <div className="tx-card" key={tx.id}>
            <div className="tx-header">
                <div className="tx-info">
                    <div className={`tx-icon ${tx.tipo}`}>
                        {tx.tipo === 'ingreso' ? <i className="fa-solid fa-arrow-down"></i> : <i className="fa-solid fa-arrow-up"></i>}
                    </div>
                    <div className="tx-text-wrap">
                        <h4 className="tx-motivo">{tx.motivo}</h4>
                        <div className="tx-datetime-badges">
                            <span className="badge-date"><i className="fa-regular fa-calendar"></i> {tx.fecha ? tx.fecha.split('-').reverse().join('/') : '--'}</span>
                            {tx.hora && <span className="badge-time"><i className="fa-regular fa-clock"></i> {tx.hora}</span>}
                        </div>
                    </div>
                </div>
                <div className={`tx-amount ${tx.tipo}`}>
                    {tx.tipo === 'ingreso' ? '+' : '-'}${tx.monto.toFixed(2)}
                </div>
            </div>
            
            {tx.descripcion && (
                <Accordion title="Ver Descripción Detallada">
                    <p style={{ margin: 0, fontSize: '13px', color: '#475569', whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>
                        {tx.descripcion}
                    </p>
                </Accordion>
            )}

            <div className="tx-footer">
                <span><i className="fa-solid fa-user-pen" style={{marginRight: '5px'}}></i> Por: <strong>{tx.registradoPor}</strong></span>
                <span className="tx-lock"><i className="fa-solid fa-lock"></i> Registro Inmutable</span>
            </div>
        </div>
    );

    return (
        <div className={`secretaria-dashboard theme-${appTheme}`}>

            {/* CABECERA PRINCIPAL */}
            <div className="app-global-header">
                <div className="app-brand">
                    <h2 className="app-brand-title">EBD 2.0</h2>
                    <p className="app-brand-subtitle">{userData?.rol || 'Secretaría'}</p>
                </div>
                <button className="profile-pill-btn" onClick={() => setIsProfileOpen(true)}>
                    <i className="fa-solid fa-circle-user"></i> {nombreUsuario.split(' ')[0]}
                </button>
            </div>

            {/* MENÚ LATERAL DE PERFIL */}
            <div className={`profile-overlay ${isProfileOpen ? 'open' : ''}`} onClick={() => setIsProfileOpen(false)}></div>
            <div className={`profile-drawer ${isProfileOpen ? 'open' : ''}`}>
                <div className="pd-header">
                    <h2>Mi Perfil</h2>
                    <button className="pd-close" onClick={() => setIsProfileOpen(false)}><i className="fa-solid fa-xmark"></i></button>
                </div>
                
                <div className="pd-content">
                    <div className="pd-user-info">
                        <div className="pd-user-avatar">{inicial}</div>
                        <div className="pd-name-group">
                            <h3 className="pd-name-display">{nombreUsuario}</h3>
                            <p className="pd-role">{userData?.rol}</p>
                        </div>
                    </div>

                    <div>
                        <h4 className="pd-section-title">Color de la Aplicación</h4>
                        <div className="theme-picker">
                            <div className={`theme-circle bg-indigo ${appTheme === 'indigo' ? 'active' : ''}`} onClick={() => setAppTheme('indigo')}><i className="fa-solid fa-check" style={{opacity: appTheme === 'indigo' ? 1 : 0}}></i></div>
                            <div className={`theme-circle bg-emerald ${appTheme === 'emerald' ? 'active' : ''}`} onClick={() => setAppTheme('emerald')}><i className="fa-solid fa-check" style={{opacity: appTheme === 'emerald' ? 1 : 0}}></i></div>
                            <div className={`theme-circle bg-rose ${appTheme === 'rose' ? 'active' : ''}`} onClick={() => setAppTheme('rose')}><i className="fa-solid fa-check" style={{opacity: appTheme === 'rose' ? 1 : 0}}></i></div>
                            <div className={`theme-circle bg-amber ${appTheme === 'amber' ? 'active' : ''}`} onClick={() => setAppTheme('amber')}><i className="fa-solid fa-check" style={{opacity: appTheme === 'amber' ? 1 : 0}}></i></div>
                        </div>
                    </div>

                    <BadgesPanel 
                        userName={nombreUsuario} 
                        fechaInicioServicio={userData?.fechaInicioServicio}
                        insigniasUsuario={userData?.insignias || []}
                        insigniasGlobales={insigniasGlobales || []}
                    />

                    <div className="pd-extras">
                        <h4 className="pd-section-title">Opciones Adicionales</h4>
                        <button className="pd-btn-extra"><i className="fa-solid fa-moon"></i> Modo Oscuro (Próximamente)</button>
                        <button className="pd-btn-extra" onClick={cerrarSesionApp} style={{color: '#ef4444', marginTop: '10px', borderColor: '#fee2e2'}}>
                            <i className="fa-solid fa-right-from-bracket" style={{color: '#ef4444'}}></i> Cerrar Sesión
                        </button>
                    </div>
                </div>
            </div>

            {/* PESTAÑA HOME */}
            {mainTab === 'home' && (
                <div className="animate-fade-in">
                    <div className="home-widgets-grid">
                        <div className="home-widget widget-secretaria">
                            <div style={{ position: 'relative', zIndex: 2, width: '100%' }}>
                                <div className="home-widget-title"><i className="fa-solid fa-file-signature"></i> Panel Central</div>
                                <div className="home-stat-big">Bienvenido(a)</div>
                                <p className="progress-msg-dark">Mantente al día con los avisos del equipo directivo y administra la documentación financiera.</p>
                            </div>
                            <div className="widget-icon-bg"><i className="fa-solid fa-folder-open"></i></div>
                        </div>
                        <NotificationsWidget />
                    </div>
                </div>
            )}

            {/* PESTAÑA DE TESORERÍA / FINANZAS */}
            {mainTab === 'reportes' && (
                <div className="animate-fade-in">
                    <h1 className="st-header-title">Tesorería</h1>
                    <p className="st-header-subtitle">Control de ingresos y retiros de fondos.</p>

                    <div className="funds-master-card">
                        <div className="fmc-label">Fondo Total Disponible</div>
                        <div className="fmc-amount"><span className="fmc-currency">$</span>{totalFondos.toFixed(2)}</div>
                    </div>

                    <div className="funds-action-buttons">
                        <button className="fab-btn fab-ingreso" onClick={() => { setTxForm({...estadoTxInicial, tipo: 'ingreso'}); setIsTxModalOpen(true); }}>
                            <i className="fa-solid fa-arrow-down-to-line"></i> Registrar Ingreso
                        </button>
                        <button className="fab-btn fab-retiro" onClick={() => { setTxForm({...estadoTxInicial, tipo: 'retiro'}); setIsTxModalOpen(true); }}>
                            <i className="fa-solid fa-arrow-up-from-bracket"></i> Registrar Retiro
                        </button>
                    </div>

                    <h3 style={{ fontSize: '18px', color: '#1e293b', marginBottom: '20px' }}><i className="fa-solid fa-clock-rotate-left"></i> Historial de Movimientos</h3>
                    
                    {cargando ? <p style={{ textAlign: 'center', color: '#94a3b8' }}><i className="fa-solid fa-spinner fa-spin"></i> Cargando registros...</p> : (
                        Object.keys(agruparTransaccionesPorMes()).length === 0 ? <p style={{ color: '#94a3b8', textAlign: 'center' }}>No hay transacciones registradas.</p> : (
                            Object.entries(agruparTransaccionesPorMes()).map(([mes, datosMes]) => (
                                <Accordion key={mes} title={mes}>
                                    <div style={{ paddingTop: '10px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                        
                                        {/* SEPARACIÓN EXACTA DE FONDOS POR ACORDEONES SEPARADOS */}
                                        <Accordion title={`🟢 Total Ingresos: +$${datosMes.totalIngresos.toFixed(2)}`}>
                                            <div style={{ paddingTop: '10px' }}>
                                                {Object.keys(datosMes.semanasIngresos).length === 0 ? (
                                                    <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '13px', padding: '10px' }}>No hubo ingresos registrados este mes.</p>
                                                ) : (
                                                    Object.entries(datosMes.semanasIngresos).map(([semana, txs]) => (
                                                        <Accordion key={semana} title={semana}>
                                                            <div style={{ paddingTop: '10px' }}>
                                                                {txs.map(tx => renderTransactionCard(tx))}
                                                            </div>
                                                        </Accordion>
                                                    ))
                                                )}
                                            </div>
                                        </Accordion>

                                        <Accordion title={`🔴 Total Retiros: -$${datosMes.totalRetiros.toFixed(2)}`}>
                                            <div style={{ paddingTop: '10px' }}>
                                                {Object.keys(datosMes.semanasRetiros).length === 0 ? (
                                                    <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '13px', padding: '10px' }}>No hubo retiros registrados este mes.</p>
                                                ) : (
                                                    Object.entries(datosMes.semanasRetiros).map(([semana, txs]) => (
                                                        <Accordion key={semana} title={semana}>
                                                            <div style={{ paddingTop: '10px' }}>
                                                                {txs.map(tx => renderTransactionCard(tx))}
                                                            </div>
                                                        </Accordion>
                                                    ))
                                                )}
                                            </div>
                                        </Accordion>

                                    </div>
                                </Accordion>
                            ))
                        )
                    )}
                </div>
            )}

            {mainTab === 'documentos' && (
                <div className="animate-fade-in" style={{ textAlign: 'center', padding: '50px 20px', color: '#64748b' }}>
                    <i className="fa-solid fa-file-lines" style={{ fontSize: '50px', marginBottom: '20px', opacity: 0.5 }}></i>
                    <h2>Documentación</h2>
                    <p>Módulo de gestión de archivos en construcción.</p>
                </div>
            )}

            <div className="main-nav-menu">
                <button className={`main-nav-btn ${mainTab === 'home' ? 'active' : ''}`} onClick={() => setMainTab('home')}>
                    <i className="fa-solid fa-house"></i> Inicio
                </button>
                <button className={`main-nav-btn ${mainTab === 'reportes' ? 'active' : ''}`} onClick={() => setMainTab('reportes')}>
                    <i className="fa-solid fa-sack-dollar"></i> Finanzas
                </button>
                <button className={`main-nav-btn ${mainTab === 'documentos' ? 'active' : ''}`} onClick={() => setMainTab('documentos')}>
                    <i className="fa-solid fa-file-lines"></i> Archivos
                </button>
            </div>

            {/* MODAL EXCLUSIVO DE REGISTRO */}
            <Modal isOpen={isTxModalOpen} onClose={() => setIsTxModalOpen(false)} title={`Registrar ${txForm.tipo === 'ingreso' ? 'Ingreso al Fondo' : 'Retiro del Fondo'}`}>
                <form onSubmit={guardarTransaccion}>
                    <div className="admin-form-group">
                        <label className="admin-label">Monto ($)</label>
                        <input type="number" step="0.01" min="0.01" className="admin-input" placeholder="Ej: 50.00" value={txForm.monto} onChange={e => setTxForm({...txForm, monto: e.target.value})} required style={{ fontSize: '24px', fontWeight: '900' }} />
                    </div>
                    
                    <div className="admin-form-group">
                        <label className="admin-label">Motivo (Título corto)</label>
                        <input type="text" className="admin-input" placeholder={txForm.tipo === 'ingreso' ? "Ej: Ofrenda Mes de Mayo" : "Ej: Compra de Papelería"} value={txForm.motivo} onChange={e => setTxForm({...txForm, motivo: e.target.value})} required />
                    </div>

                    <div className="admin-form-group">
                        <label className="admin-label">Descripción Detallada</label>
                        <textarea className="admin-input" rows={3} placeholder="Explica detalladamente para qué se usó el dinero o de dónde proviene..." value={txForm.descripcion} onChange={e => setTxForm({...txForm, descripcion: e.target.value})} required></textarea>
                    </div>
                    
                    <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '8px', lineHeight: '1.4' }}>
                        <i className="fa-solid fa-shield-halved"></i> 
                        Este registro será inmutable. La fecha y hora exactas se guardarán automáticamente en el servidor para efectos de auditoría.
                    </div>
                    
                    <div className="admin-actions" style={{ marginTop: '25px', gap: '10px' }}>
                        <Button type="button" style={{ background: '#f1f5f9', color: '#475569', flex: 1, padding: '12px', borderRadius: '12px', fontWeight: '800', border: 'none', cursor: 'pointer' }} onClick={() => setIsTxModalOpen(false)}>Cancelar</Button>
                        <Button type="submit" className="btn-aprobar" style={{ background: txForm.tipo === 'ingreso' ? '#10b981' : '#ef4444' }}>Guardar {txForm.tipo === 'ingreso' ? 'Ingreso' : 'Retiro'}</Button>
                    </div>
                </form>
            </Modal>

            {/* MODAL UNIVERSAL DE CONFIRMACIÓN */}
            <Modal isOpen={confirmState.isOpen} onClose={() => setConfirmState(prev => ({...prev, isOpen: false}))} title={confirmState.title}>
                <div style={{ fontSize: '15px', color: '#475569', marginBottom: '20px', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
                    {confirmState.message}
                </div>
                <div className="admin-actions">
                    {confirmState.type !== 'success' && (
                        <Button type="button" style={{ background: '#f1f5f9', color: '#475569', flex: 1, padding: '12px', borderRadius: '12px', fontWeight: '800', border: 'none', cursor: 'pointer' }} onClick={() => setConfirmState(prev => ({...prev, isOpen: false}))}>
                            Cancelar
                        </Button>
                    )}
                    <Button type="button" className={confirmState.type === 'danger' ? 'btn-denegar' : 'btn-aprobar'} onClick={() => confirmState.onConfirm()}>
                        {confirmState.confirmText}
                    </Button>
                </div>
            </Modal>

        </div>
    );
};
