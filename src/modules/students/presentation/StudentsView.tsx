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
            
            {/* ¡MAGIA! LAS PESTAÑAS AHORA ESTÁN EN LA PARTE SUPERIOR */}
            <div className="students-tabs">
                <button 
                    className={`tab-btn ${activeTab === 'directorio' ? 'active' : ''}`}
                    onClick={() => setActiveTab('directorio')}
                >
                    <i className="fa-solid fa-address-book mr-2"></i> Directorio de Alumnos
                </button>
                <button 
                    className={`tab-btn ${activeTab === 'cumpleanos' ? 'active' : ''}`}
                    onClick={() => setActiveTab('cumpleanos')}
                >
                    <i className="fa-solid fa-cake-candles mr-2"></i> Cumpleaños del Mes
                </button>
            </div>

            {/* EL ENCABEZADO AHORA QUEDA ABAJO DE LAS PESTAÑAS */}
            <div className="students-header">
                <div>
                    <h2>{activeTab === 'directorio' ? 'Mis Alumnos' : 'Calendario de Cumpleaños'}</h2>
                    <p>Gestiona la asistencia y registros del campo <strong>{userData?.campo}</strong></p>
                    {!cargando && activeTab === 'directorio' && (
                        <div style={{ marginTop: '10px', fontSize: '14px', fontWeight: 'bold', color: '#4f46e5' }}>
                            <i className="fa-solid fa-children"></i> Total inscritos: {alumnos.length}
                        </div>
                    )}
                </div>
                
                {/* El botón de Inscribir solo lo mostramos en el Directorio para no estorbar en Cumpleaños */}
                {activeTab === 'directorio' && (
                    <button className="btn-inscribir" onClick={abrirModalNuevo}>
                        <i className="fa-solid fa-user-plus"></i> Inscribir un nuevo niño
                    </button>
                )}
            </div>

            {cargando ? (
                <p><i className="fa-solid fa-spinner fa-spin"></i> Cargando datos...</p>
            ) : (
                <>
                    {/* VISTA 1: EL DIRECTORIO */}
                    {activeTab === 'directorio' && (
                        <div className="students-grid animate-fade-in">
                            {alumnos.length === 0 ? (
                                <p style={{ color: '#64748b' }}>No tienes alumnos inscritos aún en tu campo.</p>
                            ) : null}

                            {alumnos.map(alumno => {
                                const esNina = alumno.genero === 'Femenino';
                                return (
                                    <div className="student-card" key={alumno.id}>
                                        <div className="student-card-header">
                                            <div className={`student-avatar ${esNina ? 'avatar-nina' : 'avatar-nino'}`}>
                                                <i className={`fa-solid ${esNina ? 'fa-child-dress' : 'fa-child-reaching'}`}></i>
                                            </div>
                                            <div>
                                                <h3 className="student-name">{alumno.nombre}</h3>
                                                <span className={`student-tag ${esNina ? 'tag-nina' : 'tag-nino'}`}>
                                                    {esNina ? 'Niña' : 'Niño'}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        <div className="student-details">
                                            <div><i className="fa-solid fa-cake-candles" style={{ color: '#fbbf24' }}></i> <strong>Edad:</strong> {calcularEdadExacta(alumno.fechaNacimiento, alumno.edad)} años</div>
                                            <div><i className="fa-solid fa-calendar-day" style={{ color: '#94a3b8' }}></i> <strong>Nació el:</strong> {alumno.fechaNacimiento.split('-').reverse().join('/')}</div>
                                        </div>

                                        <div className="student-actions">
                                            <Button className="btn-editar" onClick={() => abrirModalEditar(alumno)}><i className="fa-solid fa-pen"></i> Editar</Button>
                                            <Button className="btn-denegar" onClick={() => eliminarAlumno(alumno.id, alumno.nombre)}><i className="fa-solid fa-trash"></i></Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* VISTA 2: CUMPLEAÑOS */}
                    {activeTab === 'cumpleanos' && (
                        <div className="birthdays-container animate-fade-in">
                            {months.map((nombreMes, index) => {
                                const numeroMes = index + 1;
                                const ninosDelMes = cumpleanerosPorMes[numeroMes];

                                return (
                                    <Accordion key={numeroMes} title={`${nombreMes} (${ninosDelMes.length})`}>
                                        {ninosDelMes.length === 0 ? (
                                            <p style={{ padding: '15px', color: '#64748b', fontStyle: 'italic', margin: 0 }}>
                                                No hay cumpleañeros este mes.
                                            </p>
                                        ) : (
                                            <div style={{ display: 'flex', flexDirection: 'column', paddingTop: '10px' }}>
                                                {ninosDelMes.map(nino => {
                                                    const esNina = nino.genero === 'Femenino';
                                                    return (
                                                        <div className={`birthday-list-item ${esNina ? 'bday-nina' : 'bday-nino'}`} key={nino.id}>
                                                            <div className="bday-name">
                                                                <i className={`fa-solid ${esNina ? 'fa-child-dress' : 'fa-child-reaching'}`}></i>
                                                                {nino.nombre}
                                                            </div>
                                                            <div className="bday-age">
                                                                <i className="fa-solid fa-gift mr-1"></i> Cumplirá {calcularEdadEsteAnio(nino.fechaNacimiento)} años
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </Accordion>
                                );
                            })}
                        </div>
                    )}
                </>
            )}

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editandoId ? "Editar Alumno" : "Registrar Nuevo Alumno"}>
                <form onSubmit={guardarAlumno}>
                    <div className="ebd-form-group" style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Nombre Completo del Niño(a)</label>
                        <input className="ebd-input" type="text" placeholder="Ej: Carlitos Pérez" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }} />
                    </div>

                    <div className="ebd-form-group" style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Género</label>
                        <select className="ebd-input" value={form.genero} onChange={e => setForm({...form, genero: e.target.value})} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}>
                            <option value="" disabled>Seleccione...</option>
                            <option value="Masculino">Masculino (Niño)</option>
                            <option value="Femenino">Femenino (Niña)</option>
                        </select>
                    </div>

                    <div className="ebd-form-group" style={{ marginBottom: '25px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Fecha de Nacimiento</label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                            <select className="ebd-input" value={form.birthDay} onChange={e => setForm({...form, birthDay: e.target.value})} required style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}>
                                <option value="" disabled>Día</option>{days.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                            <select className="ebd-input" value={form.birthMonth} onChange={e => setForm({...form, birthMonth: e.target.value})} required style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}>
                                <option value="" disabled>Mes</option>{months.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                            </select>
                            <select className="ebd-input" value={form.birthYear} onChange={e => setForm({...form, birthYear: e.target.value})} required style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}>
                                <option value="" disabled>Año</option>{years.map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="admin-actions" style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                        <Button type="button" className="btn-denegar" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                        <Button type="submit" className="btn-aprobar">
                            <i className="fa-solid fa-save"></i> Guardar Alumno
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};
