import React from 'react';
import { useSecretariaLogic } from './SecretariaDashboard.logic';
import { NotificationsWidget } from '../../../shared/components/notifications/NotificationsWidget';
import { BadgesPanel } from '../../students/presentation/components/BadgesPanel';
import './SecretariaDashboard.css';

export const SecretariaDashboard = () => {
    const { 
        userData, 
        isProfileOpen, setIsProfileOpen, 
        appTheme, setAppTheme, 
        cerrarSesionApp, 
        mainTab, setMainTab,
        insigniasGlobales
    } = useSecretariaLogic();

    const nombreUsuario = userData?.nombre || 'Secretaría';
    const inicial = nombreUsuario.charAt(0).toUpperCase();

    return (
        <div className={`secretaria-dashboard theme-${appTheme}`}>

            {/* CABECERA GLOBAL */}
            <div className="app-global-header">
                <div className="app-brand">
                    <h2 className="app-brand-title">EBD 2.0</h2>
                    <p className="app-brand-subtitle">{userData?.rol || 'Secretaría'}</p>
                </div>
                <button className="profile-pill-btn" onClick={() => setIsProfileOpen(true)}>
                    <i className="fa-solid fa-circle-user"></i> {nombreUsuario.split(' ')[0]}
                </button>
            </div>

            {/* MENÚ DE PERFIL (DRAWER) */}
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

                    {/* IMPORTAMOS EXACTAMENTE EL MISMO PANEL DE INSIGNIAS */}
                    <BadgesPanel 
                        userName={nombreUsuario} 
                        fechaInicioServicio={userData?.fechaInicioServicio}
                        insigniasUsuario={userData?.insignias || []}
                        insigniasGlobales={insigniasGlobales || []}
                    />

                    <div className="pd-extras">
                        <h4 className="pd-section-title">Opciones Adicionales</h4>
                        <button className="pd-btn-extra"><i className="fa-solid fa-moon"></i> Modo Oscuro (Próximamente)</button>
                        <button className="pd-btn-extra"><i className="fa-solid fa-file-export"></i> Exportar Mis Datos</button>
                        <button className="pd-btn-extra" onClick={cerrarSesionApp} style={{color: '#ef4444', marginTop: '10px', borderColor: '#fee2e2'}}>
                            <i className="fa-solid fa-right-from-bracket" style={{color: '#ef4444'}}></i> Cerrar Sesión
                        </button>
                    </div>
                </div>
            </div>

            {/* PESTAÑA PRINCIPAL (HOME) */}
            {mainTab === 'home' && (
                <div className="animate-fade-in">
                    <div className="home-widgets-grid">
                        
                        <div className="home-widget widget-secretaria">
                            <div style={{ position: 'relative', zIndex: 2, width: '100%' }}>
                                <div className="home-widget-title"><i className="fa-solid fa-file-signature"></i> Panel Central</div>
                                <div className="home-stat-big">Bienvenido(a)</div>
                                <p className="progress-msg-dark">Mantente al día con los avisos del equipo directivo y administra la documentación.</p>
                            </div>
                            <div className="widget-icon-bg"><i className="fa-solid fa-folder-open"></i></div>
                        </div>

                        {/* EL COMPONENTE COMPARTIDO QUE MANEJA AVISOS, REACCIONES Y EMOJIS */}
                        <NotificationsWidget />

                    </div>
                </div>
            )}

            {/* PESTAÑA DE REPORTES Y DOCUMENTOS (Placeholders por ahora) */}
            {mainTab === 'reportes' && (
                <div className="animate-fade-in" style={{ textAlign: 'center', padding: '50px 20px', color: '#64748b' }}>
                    <i className="fa-solid fa-chart-pie" style={{ fontSize: '50px', marginBottom: '20px', opacity: 0.5 }}></i>
                    <h2>Reportes Generales</h2>
                    <p>Aquí irá el módulo de reportes diseñado para la Secretaría.</p>
                </div>
            )}

            {mainTab === 'documentos' && (
                <div className="animate-fade-in" style={{ textAlign: 'center', padding: '50px 20px', color: '#64748b' }}>
                    <i className="fa-solid fa-file-lines" style={{ fontSize: '50px', marginBottom: '20px', opacity: 0.5 }}></i>
                    <h2>Documentación</h2>
                    <p>Módulo de gestión de archivos en construcción.</p>
                </div>
            )}

            {/* BARRA DE NAVEGACIÓN INFERIOR */}
            <div className="main-nav-menu">
                <button className={`main-nav-btn ${mainTab === 'home' ? 'active' : ''}`} onClick={() => setMainTab('home')}>
                    <i className="fa-solid fa-house"></i> Inicio
                </button>
                <button className={`main-nav-btn ${mainTab === 'reportes' ? 'active' : ''}`} onClick={() => setMainTab('reportes')}>
                    <i className="fa-solid fa-chart-pie"></i> Reportes
                </button>
                <button className={`main-nav-btn ${mainTab === 'documentos' ? 'active' : ''}`} onClick={() => setMainTab('documentos')}>
                    <i className="fa-solid fa-file-lines"></i> Archivos
                </button>
            </div>

        </div>
    );
};
