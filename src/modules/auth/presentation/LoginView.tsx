import React from 'react';
import { useLoginLogic } from './LoginView.logic';
import { Button } from '../../../shared/components/Button';
import { ROLES_CONFIG, IGLESIAS_CAMPOS } from '../../../core/constants/roles';
import './LoginView.css'; 

export const LoginView: React.FC = () => {
    const { 
        form, setForm, status, recordar, setRecordar, isPending, isReturning, isLoading,
        days, months, years, handleLogin, limpiarCuenta
    } = useLoginLogic();

    const rolSeleccionado = ROLES_CONFIG.find(r => r.id === form.rol);

    return (
        <div className="ebd-login-root">
            <div className="ebd-card">
                {/* Cambié también el ícono principal a algo más educativo/infantil o general si gustas, pero dejé el original por ahora */}
                <i className="fa-solid fa-church ebd-header-icon"></i>
                <h1 className="ebd-title">Gestión EBD</h1>
                <p className="ebd-subtitle">Plataforma de Escuela Bíblica</p>

                {status.info && <div className="ebd-info animate-fade-in">{status.info}</div>}
                {status.error && <p className="ebd-error animate-fade-in">{status.error}</p>}

                <form onSubmit={handleLogin}>
                    
                    {!form.rol && !isPending && !isReturning ? (
                        <div className="animate-fade-in">
                            <p className="ebd-role-selector-title">¿Cómo deseas ingresar?</p>
                            <div className="ebd-roles-grid">
                                {ROLES_CONFIG.map(role => (
                                    <button 
                                        key={role.id} 
                                        type="button" 
                                        className="ebd-role-btn" 
                                        onClick={() => setForm({...form, rol: role.id})}
                                    >
                                        <i className={`fa-solid ${role.icon} ebd-role-icon`}></i>
                                        <span className="ebd-role-name">{role.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        
                        <div className={`animate-fade-in ${(isPending || isReturning) ? "ebd-form-locked" : ""}`}>
                            
                            {!isPending && !isReturning && (
                                <button type="button" className="ebd-back-btn" onClick={() => setForm({...form, rol: ''})}>
                                    <i className="fa-solid fa-arrow-left"></i> Cambiar tipo de usuario
                                </button>
                            )}

                            {rolSeleccionado && (
                                <div className="selected-role-title">
                                    <i className={`fa-solid ${rolSeleccionado.icon}`}></i>
                                    Ingresando como {rolSeleccionado.name}
                                </div>
                            )}

                            {form.rol !== 'ADMIN' && (
                                <>
                                    <div className="ebd-form-group">
                                        <label className="ebd-label">Nombre Completo</label>
                                        <input type="text" placeholder="Ej: Juan Pérez" className="ebd-input" value={form.nombre} onChange={(e) => setForm({...form, nombre: e.target.value})} required />
                                    </div>

                                    <div className="ebd-form-group">
                                        <label className="ebd-label">Fecha de Nacimiento</label>
                                        <div className="ebd-date-grid">
                                            <select className="ebd-input" value={form.birthDay} onChange={(e) => setForm({...form, birthDay: e.target.value})} required>
                                                <option value="" disabled>Día</option>{days.map(d => <option key={d} value={d < 10 ? `0${d}` : d}>{d}</option>)}
                                            </select>
                                            <select className="ebd-input" value={form.birthMonth} onChange={(e) => setForm({...form, birthMonth: e.target.value})} required>
                                                <option value="" disabled>Mes</option>{months.map((m, i) => <option key={m} value={i + 1 < 10 ? `0${i + 1}` : i + 1}>{m}</option>)}
                                            </select>
                                            <select className="ebd-input" value={form.birthYear} onChange={(e) => setForm({...form, birthYear: e.target.value})} required>
                                                <option value="" disabled>Año</option>{years.map(y => <option key={y} value={y}>{y}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="ebd-form-group animate-fade-in">
                                        <label className="ebd-label">Género</label>
                                        <select className="ebd-input" value={form.genero} onChange={(e) => setForm({...form, genero: e.target.value})} required>
                                            <option value="" disabled>Selecciona tu género...</option>
                                            <option value="Masculino">Masculino</option>
                                            <option value="Femenino">Femenino</option>
                                        </select>
                                    </div>

                                    {(form.rol === 'MAESTRO' || form.rol === 'AUXILIAR') && (
                                        <div className="ebd-form-group animate-fade-in">
                                            {/* CORRECCIÓN: Ahora dice solo "Campo" */}
                                            <label className="ebd-label">Campo</label>
                                            <select className="ebd-input" value={form.campo} onChange={(e) => setForm({...form, campo: e.target.value})} required>
                                                <option value="" disabled>Selecciona tu campo...</option>
                                                {IGLESIAS_CAMPOS.map(iglesia => <option key={iglesia} value={iglesia}>{iglesia}</option>)}
                                            </select>
                                        </div>
                                    )}
                                </>
                            )}

                            <div className="ebd-form-group">
                                <label className="ebd-label">Contraseña de Acceso</label>
                                <input type="password" placeholder="••••••" className="ebd-input" value={form.clave} onChange={(e) => setForm({...form, clave: e.target.value})} required />
                            </div>

                            <label className="ebd-checkbox-group">
                                <input type="checkbox" checked={recordar} onChange={(e) => setRecordar(e.target.checked)} /> Recordar mi contraseña
                            </label>
                        </div>
                    )}

                    {(form.rol || isPending || isReturning) && (
                        <Button type="submit" className="ebd-submit-btn" disabled={isLoading || isPending || (!form.rol && !isReturning)}>
                            {isLoading ? (
                                <><i className="fa-solid fa-spinner fa-spin mr-2"></i> Procesando...</>
                            ) : isPending ? (
                                <><i className="fa-solid fa-clock mr-2"></i> Esperando Aprobación...</>
                            ) : isReturning ? (
                                <><i className="fa-solid fa-arrow-right-to-bracket mr-2"></i> Ingresar de nuevo</>
                            ) : (
                                form.rol === 'ADMIN' ? 'Ingresar como Director' : 'Enviar Solicitud de Registro'
                            )}
                        </Button>
                    )}
                    
                    {(isPending || isReturning) && (
                        <Button type="button" className="ebd-cancel-btn" onClick={limpiarCuenta}>
                            {isPending ? 'Quiero modificar mis datos / Cambiar usuario' : 'Ingresar con otra cuenta'}
                        </Button>
                    )}
                </form>
            </div>
        </div>
    );
};
