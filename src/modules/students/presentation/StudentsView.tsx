import React from 'react';
import { useStudentsLogic } from './StudentsView.logic';
import Modal from '../../../shared/components/Modal'; 
import { Button } from '../../../shared/components/Button';
import Accordion from '../../../shared/components/Accordion'; 
import { calcularEdadExacta, calcularEdadEsteAnio } from '../../../core/utils/date.utils'; 
import './StudentsView.css';

export const StudentsView = () => {
    const { 
        alumnos, cargando, form, setForm, isModalOpen, setIsModalOpen,
        abrirModalNuevo, abrirModalEditar, guardarAlumno, eliminarAlumno,
        days, months, years, editandoId, userData,
        activeTab, setActiveTab, mainTab, setMainTab, obtenerCumpleanerosPorMes,
        asistencia, actualizarAsistencia, resumenAsistencia, enviarAsistencia,
        ofrendaDia, setOfrendaDia,
        numeroLeccion, setNumeroLeccion, seDioLeccion, setSeDioLeccion, isSubmitted, editarAsistencia
    } = useStudentsLogic();

    const cumpleanerosPorMes = obtenerCumpleanerosPorMes();

    return (
        <div className="students-dashboard">
            
            {/* =========================================
                PANTALLA DE INICIO (HOME DASHBOARD)
                ========================================= */}
            {mainTab === 'home' && (
                <div className="animate-fade-in">
                    <div className="home-welcome">
                        <h1>¡Hola, {userData?.nombre?.split(' ')[0]}!</h1>
                        <p>¿Qué deseas hacer en <strong>{userData?.campo}</strong>?</p>
                    </div>

                    <div className="home-menu-grid">
                        <div className="home-module-btn" onClick={() => setMainTab('alumnos')}>
                            <div className="home-module-icon icon-alumnos"><i className="fa-solid fa-children"></i></div>
                            <div className="home-module-text">
                                <h3>Directorio de Alumnos</h3>
                                <p>Agrega niños, edita perfiles y revisa los cumpleaños del mes.</p>
                            </div>
                        </div>

                        <div className="home-module-btn" onClick={() => setMainTab('asistencia')}>
                            <div className="home-module-icon icon-asistencia"><i className="fa-solid fa-clipboard-check"></i></div>
                            <div className="home-module-text">
                                <h3>Pasar Asistencia</h3>
                                <p>Toma asistencia rápida y registra la ofrenda general del día.</p>
                            </div>
                        </div>

                        <div className="home-module-btn" onClick={() => setMainTab('reportes')}>
                            <div className="home-module-icon icon-reportes"><i className="fa-solid fa-chart-pie"></i></div>
                            <div className="home-module-text">
                                <h3>Reportes y Estadísticas</h3>
                                <p>Revisa el historial de asistencia y crecimiento de tu campo.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* BOTÓN PARA REGRESAR AL MENÚ (Solo aparece si no estás en Home) */}
            {mainTab !== 'home' && (
                <button className="btn-volver animate-fade-in" onClick={() => setMainTab('home')}>
                    <i className="fa-solid fa-arrow-left"></i> Volver al Menú Principal
                </button>
            )}

            {/* =========================================
                MÓDULO 1: ALUMNOS (Directorio y Cumpleaños)
                ========================================= */}
            {mainTab === 'alumnos' && (
                <div className="animate-fade-in">
                    <h1 className="st-header-title">Alumnos</h1>
                    <p className="st-header-subtitle">Directorio y Cumpleaños • <strong>{userData?.campo}</strong></p>

                    <div className="st-tabs-container">
                        <button className={`st-tab ${activeTab === 'directorio' ? 'active' : ''}`} onClick={() => setActiveTab('directorio')}>
                            <i className="fa-solid fa-address-book"></i> Directorio
                        </button>
                        <button className={`st-tab ${activeTab === 'cumpleanos' ? 'active' : ''}`} onClick={() => setActiveTab('cumpleanos')}>
                            <i className="fa-solid fa-cake-candles"></i> Cumpleaños
                        </button>
                    </div>

                    {activeTab === 'directorio' && (
                        <button className="btn-inscribir-verde" onClick={abrirModalNuevo}>
                            <i className="fa-solid fa-user-plus"></i> Inscribir Nuevo Niño
                        </button>
                    )}

                    {cargando ? (
                        <p style={{ textAlign: 'center', color: '#94a3b8', marginTop: '30px' }}><i className="fa-solid fa-spinner fa-spin"></i> Cargando datos...</p>
                    ) : (
                        <>
                            {activeTab === 'directorio' && (
                                <div className="students-grid animate-fade-in">
                                    {alumnos.length === 0 ? <p style={{ color: '#94a3b8', textAlign: 'center' }}>No hay alumnos inscritos.</p> : null}
                                    
                                    {alumnos.map(alumno => {
                                        const esNina = alumno.genero === 'Femenino';
                                        const inicial = alumno.nombre ? alumno.nombre.charAt(0).toUpperCase() : '?';
                                        
                                        return (
                                            <div className="st-card" key={alumno.id}>
                                                <div className="st-card-top">
                                                    <div className={`st-avatar ${esNina ? 'nina' : 'nino'}`}>
                                                        {inicial}
                                                    </div>
                                                    <h3 className="st-name">{alumno.nombre}</h3>
                                                </div>
                                                <div className="st-card-bottom">
                                                    <div className="st-info">
                                                        <i className="fa-solid fa-cake-candles icon-cake"></i>
                                                        <span className="st-age">{calcularEdadExacta(alumno.fechaNacimiento, alumno.edad)} Años</span>
                                                        <span className="st-separator">|</span>
                                                        <span className={esNina ? 'text-nina' : 'text-nino'}>{esNina ? 'Niña' : 'Niño'}</span>
                                                    </div>
                                                    <div className="st-actions">
                                                        <button className="st-btn-mini st-btn-edit" onClick={() => abrirModalEditar(alumno)}><i className="fa-solid fa-pen-to-square"></i></button>
                                                        <button className="st-btn-mini st-btn-delete" onClick={() => eliminarAlumno(alumno.id, alumno.nombre)}><i className="fa-solid fa-trash"></i></button>
                                                    </div>
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
                                                                <div className="bday-date-badge">
                                                                    <span className="bday-date-label">Día</span>
                                                                    <span className="bday-date-number">{nino.fechaNacimiento.split('-')[2]}</span>
                                                                </div>
                                                                <div className="bday-info">
                                                                    <div className="bday-name">{nino.nombre}</div>
                                                                    <div className="bday-age"><i className="fa-solid fa-gift mr-1"></i> Cumplirá {calcularEdadEsteAnio(nino.fechaNacimiento)} años</div>
                                                                </div>
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

            {/* =========================================
                MÓDULO 2: ASISTENCIA Y OFRENDA GLOBAL
                ========================================= */}
            {mainTab === 'asistencia' && (
                <div className="animate-fade-in">
                    
                    {/* MENSAJE DE ÉXITO AL GUARDAR */}
                    {isSubmitted && (
                        <div style={{ background: '#dcfce7', color: '#065f46', padding: '15px', borderRadius: '16px', fontWeight: '800', textAlign: 'center', marginBottom: '25px', border: '2px solid #10b981' }}>
                            <i className="fa-solid fa-circle-check mr-2"></i> Asistencia Guardada Exitosamente
                        </div>
                    )}

                    {/* CONTENEDOR BLOQUEABLE (Se pone gris si isSubmitted es true) */}
                    <div className={isSubmitted ? 'locked-section' : ''}>
                        
                        <div className="global-ofrenda-card">
                            <div className="global-ofrenda-title"><i className="fa-solid fa-sack-dollar mr-2"></i> Ofrenda Recaudada</div>
                            <div className="global-ofrenda-input-wrapper">
                                <span>$</span>
                                <input 
                                    type="number" className="global-ofrenda-input" placeholder="0.00" step="0.05" min="0"
                                    value={ofrendaDia} onChange={(e) => setOfrendaDia(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="premium-summary">
                            <div className="ps-header">Resumen de Hoy</div>
                            <div className="ps-stats">
                                <div className="ps-item"><span className="ps-val" style={{ color: '#10b981' }}>{resumenAsistencia.presentes}</span><span className="ps-lbl">Presentes</span></div>
                                <div className="ps-divider"></div>
                                <div className="ps-item"><span className="ps-val" style={{ color: '#ef4444' }}>{resumenAsistencia.ausentes}</span><span className="ps-lbl">Ausentes</span></div>
                                <div className="ps-divider"></div>
                                <div className="ps-item"><span className="ps-val" style={{ color: '#f59e0b' }}>{resumenAsistencia.permisos}</span><span className="ps-lbl">Permisos</span></div>
                            </div>
                        </div>

                        {/* NÚMERO DE LECCIÓN */}
                        <div className="lesson-tracker-box">
                            <div className="lesson-info">
                                <span className="lesson-title">Número de Lección</span>
                                <div className="lesson-input-group">
                                    <span style={{ fontWeight: '900', color: '#1e293b' }}>#</span>
                                    <input 
                                        type="number" className="lesson-input" min="1"
                                        value={numeroLeccion} onChange={(e) => setNumeroLeccion(parseInt(e.target.value) || 1)}
                                    />
                                </div>
                            </div>
                            
                            <div className={`lesson-checkbox-group ${seDioLeccion ? 'active' : ''}`} onClick={() => setSeDioLeccion(!seDioLeccion)}>
                                <input type="checkbox" className="lesson-checkbox" checked={seDioLeccion} readOnly />
                                <span className="lesson-checkbox-lbl">Sí, di la clase hoy</span>
                            </div>
                        </div>

                        <h2 style={{ fontSize: '18px', fontWeight: '900', color: '#1e293b', marginBottom: '15px' }}>Pasar Lista ({resumenAsistencia.total} Inscritos)</h2>

                        {cargando ? <p style={{ textAlign: 'center', color: '#94a3b8' }}><i className="fa-solid fa-spinner fa-spin"></i> Cargando...</p> : (
                            <div style={{ paddingBottom: '20px' }}>
                                {alumnos.length === 0 ? <p style={{ color: '#94a3b8', textAlign: 'center' }}>No hay alumnos para pasar lista.</p> : null}
                                
                                {alumnos.map(alumno => {
                                    const estadoActual = asistencia[alumno.id!] || 'Presente';
                                    const esNina = alumno.genero === 'Femenino';
                                    
                                    return (
                                        <div className="att-card" key={alumno.id}>
                                            <div className="att-header">
                                                <h3 className="att-name">{alumno.nombre}</h3>
                                                <span className={`att-gender ${esNina ? 'nina' : 'nino'}`}>{esNina ? 'Niña' : 'Niño'}</span>
                                            </div>
                                            
                                            <div className="att-controls">
                                                <button className={`att-radio presente ${estadoActual === 'Presente' ? 'active' : ''}`} onClick={() => actualizarAsistencia(alumno.id!, 'Presente')}>Presente</button>
                                                <button className={`att-radio ausente ${estadoActual === 'Ausente' ? 'active' : ''}`} onClick={() => actualizarAsistencia(alumno.id!, 'Ausente')}>Ausente</button>
                                                <button className={`att-radio permiso ${estadoActual === 'Permiso' ? 'active' : ''}`} onClick={() => actualizarAsistencia(alumno.id!, 'Permiso')}>Permiso</button>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>

                    {/* BOTONES DE ACCIÓN (Fuera del contenedor bloqueado) */}
                    {alumnos.length > 0 && !cargando && (
                        isSubmitted ? (
                            <button className="btn-editar-datos animate-fade-in" onClick={editarAsistencia}>
                                <i className="fa-solid fa-lock-open"></i> Editar datos guardados
                            </button>
                        ) : (
                            <button className="btn-enviar-asistencia animate-fade-in" onClick={enviarAsistencia}>
                                <i className="fa-solid fa-cloud-arrow-up"></i> Guardar Asistencia y Ofrenda
                            </button>
                        )
                    )}
                </div>
            )}

            {/* =========================================
                MÓDULO 3: REPORTES (EN CONSTRUCCIÓN)
                ========================================= */}
            {mainTab === 'reportes' && (
                <div className="animate-fade-in">
                    <h1 className="st-header-title">Reportes</h1>
                    <p className="st-header-subtitle">Estadísticas y datos de tu campo.</p>
                    
                    <div className="placeholder-view">
                        <i className="fa-solid fa-person-digging"></i>
                        <h2 style={{ fontSize: '22px', color: '#334155', margin: '0 0 10px 0', fontWeight: '900' }}>Pronto disponible</h2>
                        <p style={{ color: '#64748b', fontSize: '15px', lineHeight: '1.5' }}>
                            Estamos construyendo esta función para que puedas ver el historial de asistencias, ofrendas y el progreso de tus alumnos.
                        </p>
                    </div>
                </div>
            )}

            {/* =========================================
                MODAL DE REGISTRO / EDICIÓN DE ALUMNOS
                ========================================= */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editandoId ? "Editar Alumno" : "Registrar Nuevo Alumno"}>
                <form onSubmit={guardarAlumno}>
                    <div className="ebd-form-group" style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Nombre Completo del Niño(a)</label>
                        <input className="ebd-input" type="text" placeholder="Ej: Adrian Alfredo..." value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} required style={{ width: '100%', padding: '10px', borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                    </div>

                    <div className="ebd-form-group" style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Género</label>
                        <select className="ebd-input" value={form.genero} onChange={e => setForm({...form, genero: e.target.value})} required style={{ width: '100%', padding: '10px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                            <option value="" disabled>Seleccione...</option>
                            <option value="Masculino">Niño</option>
                            <option value="Femenino">Niña</option>
                        </select>
                    </div>

                    <div className="ebd-form-group" style={{ marginBottom: '25px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Fecha de Nacimiento</label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                            <select className="ebd-input" value={form.birthDay} onChange={e => setForm({...form, birthDay: e.target.value})} required style={{ padding: '10px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                <option value="" disabled>Día</option>{days.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                            <select className="ebd-input" value={form.birthMonth} onChange={e => setForm({...form, birthMonth: e.target.value})} required style={{ padding: '10px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                <option value="" disabled>Mes</option>{months.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                            </select>
                            <select className="ebd-input" value={form.birthYear} onChange={e => setForm({...form, birthYear: e.target.value})} required style={{ padding: '10px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                <option value="" disabled>Año</option>{years.map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                        </div>
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
