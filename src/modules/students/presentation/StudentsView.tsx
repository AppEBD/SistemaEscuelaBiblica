import React from 'react';
import { useStudentsLogic } from './StudentsView.logic';
import Modal from '../../../shared/components/Modal'; 
import { Button } from '../../../shared/components/Button';
import Accordion from '../../../shared/components/Accordion'; 
import { calcularEdadExacta, calcularEdadEsteAnio } from '../../../core/utils/date.utils'; 
import { BadgesPanel } from './components/BadgesPanel';
import './StudentsView.css';

export const StudentsView = () => {
    const { 
        alumnos, alumnosParaAsistencia, cargando, form, setForm, isModalOpen, setIsModalOpen,
        abrirModalNuevo, abrirModalEditar, guardarAlumno, eliminarAlumno, days, months, years, editandoId, userData,
        activeTab, setActiveTab, mainTab, setMainTab, obtenerCumpleanerosPorMes, asistencia, actualizarAsistencia, resumenAsistencia, enviarAsistencia,
        ofrendaDia, setOfrendaDia, numeroLeccion, setNumeroLeccion, seDioLeccion, setSeDioLeccion, isSubmitted, editarAsistencia, asistenciaRegistradaPor,
        reportTab, setReportTab, obtenerRanking, obtenerHistorialPorMes, edadMin, setEdadMin, edadMax, setEdadMax, obtenerAlumnosPorEdad,
        desdeD, setDesdeD, desdeM, setDesdeM, desdeY, setDesdeY, hastaD, setHastaD, hastaM, setHastaM, hastaY, setHastaY, limpiarFiltrosRanking,
        notificaciones, marcarNotificacion, isProfileOpen, setIsProfileOpen, appTheme, setAppTheme, isEditingName, setIsEditingName, userNameDisplay, setUserNameDisplay, guardarNombrePerfil, cerrarSesionApp,
        maxLeccionImpartida, porcentajeLecciones, metaLeccionesAdmin
    } = useStudentsLogic();

    const cumpleanerosPorMes = obtenerCumpleanerosPorMes();
    const esElAutorDeAsistencia = asistenciaRegistradaPor === userData?.nombre;
    const nombreUsuario = userData?.nombre || 'Maestro';

    return (
        <div className={`students-dashboard theme-${appTheme}`}>

            {/* ENCABEZADO GLOBAL VISIBLE */}
            <div className="app-global-header">
                <div className="app-brand">
                    <h2 className="app-brand-title">EBD 2.0</h2>
                    <p className="app-brand-subtitle">{userData?.rol || 'Maestro'} • {userData?.campo}</p>
                </div>
                <button className="profile-pill-btn" onClick={() => setIsProfileOpen(true)}>
                    <i className="fa-solid fa-circle-user"></i> {nombreUsuario.split(' ')[0]}
                </button>
            </div>

            {/* PERFIL LATERAL (DRAWER) */}
            <div className={`profile-overlay ${isProfileOpen ? 'open' : ''}`} onClick={() => setIsProfileOpen(false)}></div>
            <div className={`profile-drawer ${isProfileOpen ? 'open' : ''}`}>
                <div className="pd-header">
                    <h2>Mi Perfil</h2>
                    <button className="pd-close" onClick={() => setIsProfileOpen(false)}><i className="fa-solid fa-xmark"></i></button>
                </div>
                
                <div className="pd-content">
                    <div className="pd-user-info">
                        <div className="pd-user-avatar">{nombreUsuario.charAt(0).toUpperCase()}</div>
                        <div className="pd-name-group">
                            <h3 className="pd-name-display">{nombreUsuario}</h3>
                            <p className="pd-role">{userData?.rol === 'AUXILIAR' ? 'Auxiliar' : 'Maestro'} en {userData?.campo}</p>
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

                    <BadgesPanel userName={nombreUsuario} />

                    <div className="pd-extras">
                        <h4 className="pd-section-title">Opciones Adicionales</h4>
                        <button className="pd-btn-extra"><i className="fa-solid fa-chart-line"></i> Mi Actividad en el Año</button>
                        <button className="pd-btn-extra"><i className="fa-solid fa-moon"></i> Modo Oscuro (Próximamente)</button>
                        <button className="pd-btn-extra"><i className="fa-solid fa-file-export"></i> Exportar Mis Datos</button>
                        <button className="pd-btn-extra" onClick={cerrarSesionApp} style={{color: '#ef4444', marginTop: '10px', borderColor: '#fee2e2'}}>
                            <i className="fa-solid fa-right-from-bracket" style={{color: '#ef4444'}}></i> Cerrar Sesión
                        </button>
                    </div>
                </div>
            </div>

            {/* PANTALLA DE INICIO (HOME) */}
            {mainTab === 'home' && (
                <div className="animate-fade-in">
                    <div className="home-widgets-grid">
                        
                        <div className="home-widget widget-alumnos">
                            <div style={{ position: 'relative', zIndex: 2, width: '100%' }}>
                                <div className="home-widget-title"><i className="fa-solid fa-users"></i> Total Inscritos</div>
                                <div className="home-stat-big" style={{marginBottom: '10px'}}>{alumnos.length} <span>niños en el campo</span></div>
                                
                                <div className="progress-container-dark">
                                    <div className="progress-header-dark">
                                        <span>Progreso ({maxLeccionImpartida} impartidas)</span>
                                        <span>{porcentajeLecciones}%</span>
                                    </div>
                                    <div className="progress-bar-bg-dark">
                                        <div className="progress-bar-fill-dark" style={{ width: `${porcentajeLecciones}%` }}></div>
                                    </div>
                                    <p className="progress-msg-dark">Esperando que el administrador defina la meta de lecciones.</p>
                                </div>
                            </div>
                            <div className="widget-icon-bg"><i className="fa-solid fa-child-reaching"></i></div>
                        </div>

                        <div className="home-widget">
                            <div className="home-widget-title"><i className="fa-solid fa-bell" style={{color: '#f59e0b'}}></i> Avisos y Notificaciones</div>
                            <div className="notif-list">
                                {notificaciones.map(n => (
                                    <div key={n.id} className={`notif-item ${!n.leida ? 'unread' : ''}`} onClick={() => marcarNotificacion(n.id)}>
                                        <div className="notif-icon">{n.leida ? <i className="fa-regular fa-envelope-open"></i> : <i className="fa-solid fa-envelope"></i>}</div>
                                        <div className="notif-content">
                                            <h4 className="notif-title">{n.titulo} {!n.leida && <span className="badge-new">NUEVO</span>}</h4>
                                            <p className="notif-desc">{n.mensaje}</p>
                                            <span className="notif-date">{n.fecha}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {mainTab === 'reportes' && reportTab !== 'menu' && (<button className="btn-volver animate-fade-in" onClick={() => setReportTab('menu')}><i className="fa-solid fa-arrow-left"></i> Volver a Reportes</button>)}

            {/* MÓDULO 1: ALUMNOS */}
            {mainTab === 'alumnos' && (
                <div className="animate-fade-in">
                    <h1 className="st-header-title">Alumnos</h1>
                    <p className="st-header-subtitle">Directorio y Cumpleaños</p>

                    <div className="st-tabs-container">
                        <button className={`st-tab ${activeTab === 'directorio' ? 'active' : ''}`} onClick={() => setActiveTab('directorio')}><i className="fa-solid fa-address-book"></i> Directorio</button>
                        <button className={`st-tab ${activeTab === 'cumpleanos' ? 'active' : ''}`} onClick={() => setActiveTab('cumpleanos')}><i className="fa-solid fa-cake-candles"></i> Cumpleaños</button>
                    </div>

                    {activeTab === 'directorio' && (<button className="btn-inscribir-verde" onClick={abrirModalNuevo}><i className="fa-solid fa-user-plus"></i> Inscribir Nuevo Niño</button>)}

                    {cargando ? <p style={{ textAlign: 'center', color: '#94a3b8', marginTop: '30px' }}><i className="fa-solid fa-spinner fa-spin"></i> Cargando datos...</p> : (
                        <>
                            {activeTab === 'directorio' && (
                                <div className="students-grid animate-fade-in">
                                    {alumnos.length === 0 ? <p style={{ color: '#94a3b8', textAlign: 'center' }}>No hay alumnos inscritos.</p> : null}
                                    {alumnos.map(alumno => {
                                        const esNina = alumno.genero === 'Femenino';
                                        return (
                                            <div className="st-card" key={alumno.id}>
                                                <div className="st-card-top"><div className={`st-avatar ${esNina ? 'nina' : 'nino'}`}>{alumno.nombre ? alumno.nombre.charAt(0).toUpperCase() : '?'}</div><h3 className="st-name">{alumno.nombre}</h3></div>
                                                <div className="st-card-bottom">
                                                    <div className="st-info"><i className="fa-solid fa-cake-candles icon-cake"></i><span className="st-age">{calcularEdadExacta(alumno.fechaNacimiento, alumno.edad)} Años</span><span className="st-separator">|</span><span className={esNina ? 'text-nina' : 'text-nino'}>{esNina ? 'Niña' : 'Niño'}</span></div>
                                                    <div className="st-actions"><button className="st-btn-mini st-btn-edit" onClick={() => abrirModalEditar(alumno)}><i className="fa-solid fa-pen-to-square"></i></button><button className="st-btn-mini st-btn-delete" onClick={() => eliminarAlumno(alumno.id, alumno.nombre)}><i className="fa-solid fa-trash"></i></button></div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {activeTab === 'cumpleanos' && (
                                <div className="birthdays-container animate-fade-in">
                                    {months.map((nombreMes, index) => {
                                        const numeroMes = index + 1;
                                        const ninosDelMes = cumpleanerosPorMes[numeroMes];
                                        return (
                                            <Accordion key={numeroMes} title={`${nombreMes} (${ninosDelMes.length})`}>
                                                {ninosDelMes.length === 0 ? <p style={{ padding: '15px', color: '#94a3b8', margin: 0 }}>No hay cumpleañeros este mes.</p> : 
                                                    <div style={{ display: 'flex', flexDirection: 'column', paddingTop: '10px' }}>
                                                        {ninosDelMes.map(nino => (
                                                            <div className="bday-item" key={nino.id}>
                                                                <div className="bday-date-badge"><span className="bday-date-label">Día</span><span className="bday-date-number">{nino.fechaNacimiento.split('-')[2]}</span></div>
                                                                <div className="bday-info"><div className="bday-name">{nino.nombre}</div><div className="bday-age"><i className="fa-solid fa-gift mr-1"></i> Cumplirá {calcularEdadEsteAnio(nino.fechaNacimiento)} años</div></div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                }
                                            </Accordion>
                                        );
                                    })}
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}

            {/* MÓDULO 2: ASISTENCIA */}
            {mainTab === 'asistencia' && (
                <div className="animate-fade-in">
                    <h1 className="st-header-title">Asistencia</h1>
                    <p className="st-header-subtitle">Registra la ofrenda y pasa lista.</p>
                    
                    {isSubmitted && (<div style={{ background: '#dcfce7', color: '#065f46', padding: '15px', borderRadius: '16px', fontWeight: '800', textAlign: 'center', margin: '15px 0 25px 0', border: '2px solid #10b981' }}><i className="fa-solid fa-circle-check mr-2"></i> Asistencia guardada por {esElAutorDeAsistencia ? 'ti' : asistenciaRegistradaPor}</div>)}

                    <div className={isSubmitted ? 'locked-section' : ''}>
                        <div className="global-ofrenda-card"><div className="global-ofrenda-title"><i className="fa-solid fa-sack-dollar mr-2"></i> Ofrenda Recaudada</div><div className="global-ofrenda-input-wrapper"><span>$</span><input type="number" className="global-ofrenda-input" placeholder="0.00" step="0.05" min="0" value={ofrendaDia} onChange={(e) => setOfrendaDia(e.target.value)} /></div></div>
                        <div className="premium-summary"><div className="ps-header">Resumen de Hoy</div><div className="ps-stats"><div className="ps-item"><span className="ps-val" style={{ color: '#10b981' }}>{resumenAsistencia.presentes}</span><span className="ps-lbl">Presentes</span></div><div className="ps-divider"></div><div className="ps-item"><span className="ps-val" style={{ color: '#ef4444' }}>{resumenAsistencia.ausentes}</span><span className="ps-lbl">Ausentes</span></div><div className="ps-divider"></div><div className="ps-item"><span className="ps-val" style={{ color: '#f59e0b' }}>{resumenAsistencia.permisos}</span><span className="ps-lbl">Permisos</span></div></div></div>
                        
                        <div className="lesson-tracker-box">
                            <div className="lesson-info"><span className="lesson-title">Número de Lección</span><div className="lesson-input-group"><span style={{ fontWeight: '900', color: '#1e293b' }}>#</span><input type="number" className="lesson-input" min="1" value={numeroLeccion} onChange={(e) => setNumeroLeccion(parseInt(e.target.value) || 1)}/></div></div>
                            <div className={`lesson-checkbox-group ${seDioLeccion ? 'active' : ''}`} onClick={() => setSeDioLeccion(!seDioLeccion)}><input type="checkbox" className="lesson-checkbox" checked={seDioLeccion} readOnly /><span className="lesson-checkbox-lbl">Sí, di la clase hoy</span></div>
                        </div>

                        <h2 style={{ fontSize: '18px', fontWeight: '900', color: '#1e293b', marginBottom: '15px' }}>Pasar Lista ({resumenAsistencia.total} Inscritos)</h2>

                        {cargando ? <p style={{ textAlign: 'center', color: '#94a3b8' }}><i className="fa-solid fa-spinner fa-spin"></i> Cargando...</p> : (
                            <div style={{ paddingBottom: '20px' }}>
                                {alumnosParaAsistencia.length === 0 ? <p style={{ color: '#94a3b8', textAlign: 'center' }}>No hay alumnos para pasar lista hoy.</p> : null}
                                {alumnosParaAsistencia.map(alumno => {
                                    const estadoActual = asistencia[alumno.id!] || 'Presente';
                                    const esNina = alumno.genero === 'Femenino';
                                    return (
                                        <div className="att-card" key={alumno.id}>
                                            <div className="att-header"><h3 className="att-name">{alumno.nombre}</h3><span className={`att-gender ${esNina ? 'nina' : 'nino'}`}>{esNina ? 'Niña' : 'Niño'}</span></div>
                                            <div className="att-controls"><button className={`att-radio presente ${estadoActual === 'Presente' ? 'active' : ''}`} onClick={() => actualizarAsistencia(alumno.id!, 'Presente')}>Presente</button><button className={`att-radio ausente ${estadoActual === 'Ausente' ? 'active' : ''}`} onClick={() => actualizarAsistencia(alumno.id!, 'Ausente')}>Ausente</button><button className={`att-radio permiso ${estadoActual === 'Permiso' ? 'active' : ''}`} onClick={() => actualizarAsistencia(alumno.id!, 'Permiso')}>Permiso</button></div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>

                    {alumnosParaAsistencia.length > 0 && !cargando && (
                        isSubmitted ? (
                            esElAutorDeAsistencia ? (<button className="btn-editar-datos animate-fade-in" onClick={editarAsistencia}><i className="fa-solid fa-lock-open"></i> Editar datos guardados</button>) : 
                            (<div style={{ textAlign: 'center', color: '#64748b', fontSize: '14px', marginTop: '20px', fontWeight: 'bold' }}><i className="fa-solid fa-lock" style={{ marginRight: '5px' }}></i> Bloqueado: La asistencia fue enviada por {asistenciaRegistradaPor}.</div>)
                        ) : (<button className="btn-enviar-asistencia animate-fade-in" onClick={enviarAsistencia}><i className="fa-solid fa-cloud-arrow-up"></i> Guardar Asistencia y Ofrenda</button>)
                    )}
                </div>
            )}

            {/* MÓDULO 3: REPORTES */}
            {mainTab === 'reportes' && (
                <div className="animate-fade-in">
                    
                    {reportTab === 'menu' && (
                        <div className="home-menu-grid animate-fade-in" style={{marginTop: '0'}}>
                            <h1 className="st-header-title">Reportes</h1>
                            <p className="st-header-subtitle">Selecciona el reporte que deseas visualizar.</p>

                            <div className="home-module-btn" onClick={() => setReportTab('ranking')}>
                                <div className="home-module-icon" style={{ background: 'linear-gradient(135deg, #fbbf24, #d97706)' }}><i className="fa-solid fa-trophy"></i></div>
                                <div className="home-module-text"><h3>Ranking de Asistencia</h3><p>Top de alumnos con más asistencias.</p></div>
                            </div>
                            <div className="home-module-btn" onClick={() => setReportTab('clases')}>
                                <div className="home-module-icon" style={{ background: 'linear-gradient(135deg, #a78bfa, #7c3aed)' }}><i className="fa-solid fa-book-bible"></i></div>
                                <div className="home-module-text"><h3>Clases Anteriores</h3><p>Historial completo de asistencias.</p></div>
                            </div>
                            <div className="home-module-btn" onClick={() => setReportTab('edades')}>
                                <div className="home-module-icon" style={{ background: 'linear-gradient(135deg, #38bdf8, #0284c7)' }}><i className="fa-solid fa-filter"></i></div>
                                <div className="home-module-text"><h3>Filtrado por Edades</h3><p>Encuentra niños según su rango de edad.</p></div>
                            </div>
                        </div>
                    )}

                    {reportTab === 'ranking' && (
                        <div className="animate-fade-in">
                            <h1 className="st-header-title" style={{ fontSize: '24px' }}>Ranking de Asistencia</h1>
                            
                            <div className="filter-box">
                                <div className="filter-group">
                                    <div className="filter-group-label">Filtrar Desde:</div>
                                    <div className="filter-grid-3">
                                        <select className="custom-select-report" value={desdeD} onChange={e => setDesdeD(e.target.value)}><option value="">Día</option>{days.map(d => <option key={d} value={d}>{d}</option>)}</select>
                                        <select className="custom-select-report" value={desdeM} onChange={e => setDesdeM(e.target.value)}><option value="">Mes</option>{months.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}</select>
                                        <select className="custom-select-report" value={desdeY} onChange={e => setDesdeY(e.target.value)}><option value="">Año</option>{years.map(y => <option key={y} value={y}>{y}</option>)}</select>
                                    </div>
                                </div>
                                <div className="filter-group">
                                    <div className="filter-group-label">Filtrar Hasta:</div>
                                    <div className="filter-grid-3">
                                        <select className="custom-select-report" value={hastaD} onChange={e => setHastaD(e.target.value)}><option value="">Día</option>{days.map(d => <option key={d} value={d}>{d}</option>)}</select>
                                        <select className="custom-select-report" value={hastaM} onChange={e => setHastaM(e.target.value)}><option value="">Mes</option>{months.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}</select>
                                        <select className="custom-select-report" value={hastaY} onChange={e => setHastaY(e.target.value)}><option value="">Año</option>{years.map(y => <option key={y} value={y}>{y}</option>)}</select>
                                    </div>
                                </div>
                                <button className="btn-limpiar-filtros" onClick={limpiarFiltrosRanking}><i className="fa-solid fa-eraser"></i> Limpiar Filtros</button>
                            </div>
                            
                            {obtenerRanking().map((alumno, index) => {
                                const rankClass = index === 0 ? 'rank-1' : index === 1 ? 'rank-2' : index === 2 ? 'rank-3' : '';
                                const medalla = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`;
                                return (
                                    <div className={`rank-card ${rankClass}`} key={alumno.id}>
                                        <div className="rank-medal">{medalla}</div>
                                        <div className="rank-info"><h4 className="rank-name">{alumno.nombre}</h4><span className="rank-score"><i className="fa-solid fa-check"></i> Presente {alumno.totalAsistencias as number} veces</span></div>
                                    </div>
                                )
                            })}
                        </div>
                    )}

                    {reportTab === 'clases' && (
                        <div className="animate-fade-in">
                            <h1 className="st-header-title" style={{ fontSize: '24px', marginBottom: '20px' }}>Clases Anteriores</h1>
                            {Object.entries(obtenerHistorialPorMes()).length === 0 ? <p style={{ color: '#94a3b8', textAlign: 'center' }}>No hay clases registradas aún.</p> : null}
                            
                            {Object.entries(obtenerHistorialPorMes()).map(([mes, asistencias]) => (
                                <Accordion key={mes} title={`${mes} (${asistencias.length} clases)`}>
                                    <div style={{ paddingTop: '10px' }}>
                                        {asistencias.map(asis => (
                                            <div className="history-card" key={asis.id}>
                                                <div className="history-header">
                                                    <div>
                                                        <div className="history-date"><i className="fa-regular fa-calendar"></i> {asis.fecha.split('-').reverse().join('/')}</div>
                                                        <div className="history-user"><i className="fa-solid fa-user-pen"></i> {asis.registradoPor}</div>
                                                    </div>
                                                    <div style={{ textAlign: 'right' }}>
                                                        <div style={{ fontWeight: '900', color: '#1e293b' }}>Lección {asis.numeroLeccion}</div>
                                                        <div style={{ fontSize: '12px', fontWeight: 'bold', color: asis.leccionDada ? '#10b981' : '#94a3b8' }}>{asis.leccionDada ? 'Clase Impartida' : 'No Impartida'}</div>
                                                    </div>
                                                </div>
                                                <div className="history-stats">
                                                    <span className="hs-pill hs-p">P: {asis.resumen?.presentes || 0}</span>
                                                    <span className="hs-pill hs-a">A: {asis.resumen?.ausentes || 0}</span>
                                                    <span className="hs-pill hs-pe">Pe: {asis.resumen?.permisos || 0}</span>
                                                    <span className="hs-pill hs-o">Ofrenda: ${parseFloat((asis.resumen?.ofrendaTotal || 0).toString()).toFixed(2)}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </Accordion>
                            ))}
                        </div>
                    )}

                    {reportTab === 'edades' && (
                        <div className="animate-fade-in">
                            <h1 className="st-header-title" style={{ fontSize: '24px' }}>Filtrado por Edades</h1>
                            
                            <div className="filter-box" style={{ flexDirection: 'row' }}>
                                <div className="filter-group"><div className="filter-group-label">Edad Mínima</div><input type="number" min="0" placeholder="Ej: 0" className="custom-select-report" value={edadMin} onChange={e => setEdadMin(e.target.value === '' ? '' : parseInt(e.target.value))} /></div>
                                <div className="filter-group"><div className="filter-group-label">Edad Máxima</div><input type="number" min="0" placeholder="Ej: 12" className="custom-select-report" value={edadMax} onChange={e => setEdadMax(e.target.value === '' ? '' : parseInt(e.target.value))} /></div>
                            </div>
                            
                            {(() => {
                                const filtrados = obtenerAlumnosPorEdad();
                                const ninos = filtrados.filter(a => a.genero === 'Masculino').length;
                                const ninas = filtrados.filter(a => a.genero === 'Femenino').length;
                                return (
                                    <>
                                        <div className="age-stat-box">
                                            <div className="age-stat"><div className="age-stat-num" style={{color:'#38bdf8'}}>{ninos}</div><div className="age-stat-lbl">Niños</div></div>
                                            <div className="age-stat"><div className="age-stat-num" style={{color:'#f472b6'}}>{ninas}</div><div className="age-stat-lbl">Niñas</div></div>
                                            <div className="age-stat"><div className="age-stat-num">{filtrados.length}</div><div className="age-stat-lbl">Total</div></div>
                                        </div>
                                        
                                        <div className="students-grid">
                                            {filtrados.length === 0 ? <p style={{ color: '#94a3b8', textAlign: 'center' }}>No hay alumnos en este rango.</p> : null}
                                            {filtrados.map(alumno => {
                                                const esNina = alumno.genero === 'Femenino';
                                                return (
                                                    <div className="st-card" key={alumno.id} style={{ padding: '15px' }}>
                                                        <div className="st-card-top" style={{ marginBottom: 0 }}>
                                                            <div className={`st-avatar ${esNina ? 'nina' : 'nino'}`} style={{ width: '40px', height: '40px', fontSize: '16px' }}>{alumno.nombre.charAt(0).toUpperCase()}</div>
                                                            <div>
                                                                <h3 className="st-name" style={{ fontSize: '15px' }}>{alumno.nombre}</h3>
                                                                <span style={{ fontSize: '13px', color: '#64748b' }}>{calcularEdadExacta(alumno.fechaNacimiento, alumno.edad)} años</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </>
                                )
                            })()}
                        </div>
                    )}
                </div>
            )}

            {/* NAV INFERIOR FIJO */}
            <div className="main-nav-menu">
                <button className={`main-nav-btn ${mainTab === 'home' ? 'active' : ''}`} onClick={() => setMainTab('home')}><i className="fa-solid fa-house"></i> Inicio</button>
                <button className={`main-nav-btn ${mainTab === 'alumnos' ? 'active' : ''}`} onClick={() => setMainTab('alumnos')}><i className="fa-solid fa-address-book"></i> Directorio</button>
                <button className={`main-nav-btn ${mainTab === 'asistencia' ? 'active' : ''}`} onClick={() => setMainTab('asistencia')}><i className="fa-solid fa-clipboard-user"></i> Asistencia</button>
                <button className={`main-nav-btn ${mainTab === 'reportes' ? 'active' : ''}`} onClick={() => { setMainTab('reportes'); setReportTab('menu'); }}><i className="fa-solid fa-chart-pie"></i> Reportes</button>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editandoId ? "Editar Alumno" : "Registrar Nuevo Alumno"}>
                <form onSubmit={guardarAlumno}>
                    <div className="ebd-form-group" style={{ marginBottom: '15px' }}><label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Nombre Completo</label><input className="ebd-input" type="text" placeholder="Ej: Adrian Alfredo..." value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} required style={{ width: '100%', padding: '10px', borderRadius: '12px', border: '1px solid #e2e8f0' }} /></div>
                    <div className="ebd-form-group" style={{ marginBottom: '15px' }}><label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Género</label><select className="ebd-input" value={form.genero} onChange={e => setForm({...form, genero: e.target.value})} required style={{ width: '100%', padding: '10px', borderRadius: '12px', border: '1px solid #e2e8f0' }}><option value="" disabled>Seleccione...</option><option value="Masculino">Niño</option><option value="Femenino">Niña</option></select></div>
                    
                    <div className="ebd-form-group" style={{ marginBottom: '25px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Fecha de Nacimiento</label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                            <select className="ebd-input" value={form.birthDay} onChange={e => setForm({...form, birthDay: e.target.value})} required style={{ padding: '10px', borderRadius: '12px', border: '1px solid #e2e8f0' }}><option value="" disabled>Día</option>{days.map(d => <option key={d} value={d}>{d}</option>)}</select>
                            <select className="ebd-input" value={form.birthMonth} onChange={e => setForm({...form, birthMonth: e.target.value})} required style={{ padding: '10px', borderRadius: '12px', border: '1px solid #e2e8f0' }}><option value="" disabled>Mes</option>{months.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}</select>
                            <select className="ebd-input" value={form.birthYear} onChange={e => setForm({...form, birthYear: e.target.value})} required style={{ padding: '10px', borderRadius: '12px', border: '1px solid #e2e8f0' }}><option value="" disabled>Año</option>{years.map(y => <option key={y} value={y}>{y}</option>)}</select>
                        </div>
                        
                        {/* NUEVO: CÁLCULO DE EDAD EN VIVO */}
                        {form.birthDay && form.birthMonth && form.birthYear && (
                            <div style={{ marginTop: '12px', fontSize: '13px', color: 'var(--primary-color)', fontWeight: '800', background: 'var(--primary-light)', padding: '8px 12px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px', width: 'fit-content' }}>
                                <i className="fa-solid fa-cake-candles"></i> 
                                Edad calculada: {calcularEdadExacta(`${form.birthYear}-${form.birthMonth.padStart(2, '0')}-${form.birthDay.padStart(2, '0')}`, 0)} años
                            </div>
                        )}
                    </div>
                    
                    <div className="admin-actions" style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                        <Button type="button" className="btn-denegar" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                        <Button type="submit" className="btn-aprobar" style={{ background: '#10b981' }}>Guardar</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};
