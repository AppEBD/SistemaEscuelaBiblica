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
        activeTab, setActiveTab, obtenerCumpleanerosPorMes
    } = useStudentsLogic();

    const cumpleanerosPorMes = obtenerCumpleanerosPorMes();

    return (
        <div className="students-dashboard">
            
            <h1 className="st-header-title">Alumnos</h1>
            <p className="st-header-subtitle">Directorio y Cumpleaños</p>

            <div className="st-tabs-container">
                <button 
                    className={`st-tab ${activeTab === 'directorio' ? 'active' : ''}`}
                    onClick={() => setActiveTab('directorio')}
                >
                    <i className="fa-solid fa-address-book"></i> Directorio
                </button>
                <button 
                    className={`st-tab ${activeTab === 'cumpleanos' ? 'active' : ''}`}
                    onClick={() => setActiveTab('cumpleanos')}
                >
                    <i className="fa-solid fa-cake-candles"></i> Cumpleaños
                </button>
            </div>

            {activeTab === 'directorio' && (
                <button className="btn-inscribir-verde" onClick={abrirModalNuevo}>
                    <i className="fa-solid fa-user-plus"></i> Inscribir Nuevo Niño
                </button>
            )}

            {cargando ? (
                <p style={{ textAlign: 'center', color: '#94a3b8', marginTop: '30px' }}>
                    <i className="fa-solid fa-spinner fa-spin"></i> Cargando datos...
                </p>
            ) : (
                <>
                    {/* VISTA 1: EL DIRECTORIO IDÉNTICO A TU IMAGEN */}
                    {activeTab === 'directorio' && (
                        <div className="students-grid animate-fade-in">
                            {alumnos.length === 0 ? (
                                <p style={{ color: '#94a3b8', textAlign: 'center' }}>No hay alumnos inscritos.</p>
                            ) : null}

                            {alumnos.map(alumno => {
                                const esNina = alumno.genero === 'Femenino';
                                // Sacamos la primera letra del nombre para el Avatar
                                const inicial = alumno.nombre ? alumno.nombre.charAt(0).toUpperCase() : '?';
                                const edadExacta = calcularEdadExacta(alumno.fechaNacimiento, alumno.edad);

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
                                                <span className="st-age">{edadExacta} Años</span>
                                                <span className="st-separator">|</span>
                                                <span className={esNina ? 'text-nina' : 'text-nino'}>
                                                    {esNina ? 'Niña' : 'Niño'}
                                                </span>
                                            </div>
                                            <div className="st-actions">
                                                <button className="st-btn-mini st-btn-edit" onClick={() => abrirModalEditar(alumno)}>
                                                    <i className="fa-solid fa-pen-to-square"></i>
                                                </button>
                                                <button className="st-btn-mini st-btn-delete" onClick={() => eliminarAlumno(alumno.id, alumno.nombre)}>
                                                    <i className="fa-solid fa-trash"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* VISTA 2: CUMPLEAÑOS (Limpio y acorde al nuevo diseño) */}
                    {activeTab === 'cumpleanos' && (
                        <div className="birthdays-container animate-fade-in">
                            {months.map((nombreMes, index) => {
                                const numeroMes = index + 1;
                                const ninosDelMes = cumpleanerosPorMes[numeroMes];

                                return (
                                    <Accordion key={numeroMes} title={`${nombreMes} (${ninosDelMes.length})`}>
                                        {ninosDelMes.length === 0 ? (
                                            <p style={{ padding: '15px', color: '#94a3b8', margin: 0 }}>
                                                No hay cumpleañeros este mes.
                                            </p>
                                        ) : (
                                            <div style={{ display: 'flex', flexDirection: 'column', paddingTop: '10px' }}>
                                                {ninosDelMes.map(nino => (
                                                    <div className="bday-item" key={nino.id}>
                                                        <div className="bday-date">
                                                            {nino.fechaNacimiento.split('-')[2]}
                                                        </div>
                                                        <div className="bday-name">{nino.nombre}</div>
                                                        <div className="bday-age">
                                                            <i className="fa-solid fa-gift mr-1"></i> Cumplirá {calcularEdadEsteAnio(nino.fechaNacimiento)} años
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
                </>
            )}

            {/* MODAL (Se mantiene la funcionalidad impecable que ya teníamos) */}
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
                        <Button type="submit" className="btn-aprobar" style={{ background: '#10b981' }}>
                            Guardar
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};
