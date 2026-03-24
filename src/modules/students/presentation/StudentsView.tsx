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
        asistencia, actualizarAsistencia, resumenAsistencia, enviarAsistencia
    } = useStudentsLogic();

    const cumpleanerosPorMes = obtenerCumpleanerosPorMes();

    return (
        <div className="students-dashboard">
            
            {/* =========================================
                MENÚ PRINCIPAL (Navegación Global)
                ========================================= */}
            <div className="main-nav-menu">
                <button className={`main-nav-btn ${mainTab === 'alumnos' ? 'active' : ''}`} onClick={() => setMainTab('alumnos')}>
                    <i className="fa-solid fa-users"></i> Alumnos
                </button>
                <button className={`main-nav-btn ${mainTab === 'asistencia' ? 'active' : ''}`} onClick={() => setMainTab('asistencia')}>
                    <i className="fa-solid fa-clipboard-user"></i> Asistencia
                </button>
                <button className={`main-nav-btn ${mainTab === 'reportes' ? 'active' : ''}`} onClick={() => setMainTab('reportes')}>
                    <i className="fa-solid fa-chart-pie"></i> Reportes
                </button>
            </div>

            {/* =========================================
                VISTA 1: ALUMNOS (Directorio y Cumpleaños)
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
                        <p style={{ textAlign: 'center', color: '#94a3b8', marginTop: '30px' }}><i className="fa-solid fa-spinner fa-spin"></i> Cargando...</p>
                    ) : (
                        <>
                            {activeTab === 'directorio' && (
                                <div className="students-grid">
                                    {alumnos.length === 0 ? <p style={{ color: '#94a3b8', textAlign: 'center' }}>No hay alumnos inscritos.</p> : null}
                                    {alumnos.map(alumno => {
                                        const esNina = alumno.genero === 'Femenino';
                                        return (
                                            <div className="st-card" key={alumno.id}>
                                                <div className="st-card-top">
                                                    <div className={`st-avatar ${esNina ? 'nina' : 'nino'}`}>
                                                        {alumno.nombre ? alumno.nombre.charAt(0).toUpperCase() : '?'}
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
                                <div className="birthdays-container">
                                    {months.map((nombreMes, index) => {
                                        const ninosDelMes = cumpleanerosPorMes[index + 1];
                                        return (
                                            <Accordion key={index} title={`${nombreMes} (${ninosDelMes.length})`}>
                                                {ninosDelMes.length === 0 ? <p style={{ padding: '15px', color: '#94a3b8', margin: 0 }}>No hay cumpleañeros este mes.</p> : 
                                                    <div style={{ display: 'flex', flexDirection: 'column', paddingTop: '10px' }}>
                                                        {ninosDelMes.map(nino => (
                                                            <div className="bday-item" key={nino.id}>
                                                                <div className="bday-date-badge"><span className="bday-date-label">Día</span><span className="bday-date-number">{nino.fechaNacimiento.split('-')[2]}</span></div>
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
                VISTA 2: ASISTENCIA (Pasar lista y Ofrenda)
                ========================================= */}
            {mainTab === 'asistencia' && (
                <div className="animate-fade-in">
                    <h1 className="st-header-title">Asistencia de Hoy</h1>
                    <p className="st-header-subtitle">Pasa lista y registra las ofrendas en <strong>{userData?.campo}</strong>.</p>

                    {/* CUADRO DE RESUMEN INTELIGENTE */}
                    <div className="att-summary-box">
                        <div className="att-summary-item" style={{ color: '#0f172a' }}>
                            <span className="att-summary-val">{resumenAsistencia.total}</span>
                            <span className="att-summary-lbl">Inscritos</span>
                        </div>
                        <div className="att-summary-item" style={{ color: '#059669', background: '#dcfce7' }}>
                            <span className="att-summary-val">{resumenAsistencia.presentes}</span>
                            <span className="att-summary-lbl">Presentes</span>
                        </div>
                        <div className="att-summary-item" style={{ color: '#dc2626', background: '#fee2e2' }}>
                            <span className="att-summary-val">{resumenAsistencia.ausentes}</span>
                            <span className="att-summary-lbl">Ausentes</span>
                        </div>
                        <div className="att-summary-item" style={{ color: '#d97706', background: '#fef3c7' }}>
                            <span className="att-summary-val">{resumenAsistencia.permisos}</span>
                            <span className="att-summary-lbl">Permisos</span>
                        </div>
                    </div>

                    {/* LISTA DE NIÑOS PARA MARCAR ASISTENCIA */}
                    {cargando ? <p style={{ textAlign: 'center', color: '#94a3b8' }}><i className="fa-solid fa-spinner fa-spin"></i> Cargando lista...</p> : (
                        <div style={{ paddingBottom: '20px' }}>
                            {alumnos.length === 0 ? <p style={{ color: '#94a3b8', textAlign: 'center' }}>No tienes alumnos inscritos para pasar lista.</p> : null}
                            
                            {alumnos.map(alumno => {
                                // Buscamos el estado actual de este niño en el state de Asistencia
                                const miAsistencia = asistencia[alumno.id!] || { estado: 'Presente', ofrenda: '' };
                                const esNina = alumno.genero === 'Femenino';
                                
                                return (
                                    <div className="att-card" key={alumno.id}>
                                        <div className="att-header">
                                            <h3 className="att-name">{alumno.nombre}</h3>
                                            <span className={`att-gender ${esNina ? 'nina' : 'nino'}`}>{esNina ? 'Niña' : 'Niño'}</span>
                                        </div>
                                        
                                        {/* BOTONES DE PRESENTE / AUSENTE / PERMISO */}
                                        <div className="att-controls">
                                            <button 
                                                className={`att-radio presente ${miAsistencia.estado === 'Presente' ? 'active' : ''}`} 
                                                onClick={() => actualizarAsistencia(alumno.id!, 'estado', 'Presente')}
                                            >Presente</button>
                                            
                                            <button 
                                                className={`att-radio ausente ${miAsistencia.estado === 'Ausente' ? 'active' : ''}`} 
                                                onClick={() => actualizarAsistencia(alumno.id!, 'estado', 'Ausente')}
                                            >Ausente</button>
                                            
                                            <button 
                                                className={`att-radio permiso ${miAsistencia.estado === 'Permiso' ? 'active' : ''}`} 
                                                onClick={() => actualizarAsistencia(alumno.id!, 'estado', 'Permiso')}
                                            >Permiso</button>
                                        </div>

                                        {/* CAJITA DE OFRENDA */}
                                        <div className="att-ofrenda-group">
                                            <span className="att-ofrenda-lbl"><i className="fa-solid fa-coins" style={{ color: '#f59e0b', marginRight: '5px' }}></i> Ofrenda</span>
                                            <span style={{ fontSize: '18px', fontWeight: '900', color: '#1e293b', marginRight: '5px' }}>$</span>
                                            <input 
                                                type="number" className="att-ofrenda-input" placeholder="0.00" step="0.05" min="0"
                                                value={miAsistencia.ofrenda} 
                                                onChange={(e) => actualizarAsistencia(alumno.id!, 'ofrenda', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                )
                            })}

                            {/* BOTÓN FLOTANTE PARA GUARDAR */}
                            {alumnos.length > 0 && (
                                <button className="btn-enviar-asistencia" onClick={enviarAsistencia}>
                                    <i className="fa-solid fa-cloud-arrow-up"></i> Guardar Asistencia de Hoy
                                </button>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* =========================================
                VISTA 3: REPORTES (EN CONSTRUCCIÓN)
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

            {/* MODAL DE REGISTRO DE ALUMNOS (Siempre disponible si se abre) */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editandoId ? "Editar Alumno" : "Registrar Nuevo Alumno"}>
                <form onSubmit={guardarAlumno}>
                    <div className="ebd-form-group" style={{ marginBottom: '15px' }}><label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Nombre Completo del Niño(a)</label><input className="ebd-input" type="text" placeholder="Ej: Adrian Alfredo..." value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} required style={{ width: '100%', padding: '10px', borderRadius: '12px', border: '1px solid #e2e8f0' }} /></div>
                    <div className="ebd-form-group" style={{ marginBottom: '15px' }}><label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Género</label><select className="ebd-input" value={form.genero} onChange={e => setForm({...form, genero: e.target.value})} required style={{ width: '100%', padding: '10px', borderRadius: '12px', border: '1px solid #e2e8f0' }}><option value="" disabled>Seleccione...</option><option value="Masculino">Niño</option><option value="Femenino">Niña</option></select></div>
                    <div className="ebd-form-group" style={{ marginBottom: '25px' }}><label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Fecha de Nacimiento</label><div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}><select className="ebd-input" value={form.birthDay} onChange={e => setForm({...form, birthDay: e.target.value})} required style={{ padding: '10px', borderRadius: '12px', border: '1px solid #e2e8f0' }}><option value="" disabled>Día</option>{days.map(d => <option key={d} value={d}>{d}</option>)}</select><select className="ebd-input" value={form.birthMonth} onChange={e => setForm({...form, birthMonth: e.target.value})} required style={{ padding: '10px', borderRadius: '12px', border: '1px solid #e2e8f0' }}><option value="" disabled>Mes</option>{months.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}</select><select className="ebd-input" value={form.birthYear} onChange={e => setForm({...form, birthYear: e.target.value})} required style={{ padding: '10px', borderRadius: '12px', border: '1px solid #e2e8f0' }}><option value="" disabled>Año</option>{years.map(y => <option key={y} value={y}>{y}</option>)}</select></div></div>
                    <div className="admin-actions" style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}><Button type="button" className="btn-denegar" onClick={() => setIsModalOpen(false)}>Cancelar</Button><Button type="submit" className="btn-aprobar" style={{ background: '#10b981' }}>Guardar</Button></div>
                </form>
            </Modal>
        </div>
    );
};
