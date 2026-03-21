import React, { useState } from 'react';
import { useAuth } from '../application/useAuth';
import './LoginView.css'; 

export const LoginView: React.FC = () => {
    const { login, isLoading } = useAuth();
    
    const [form, setForm] = useState({ rol: '', nombre: '', clave: '', campo: '', birthDay: '', birthMonth: '', birthYear: '' });
    const [status, setStatus] = useState({ error: '', info: '' });
    
    // NUEVOS ESTADOS
    const [recordar, setRecordar] = useState(true);
    const [isPending, setIsPending] = useState(false);

    const rolesConfig = [
        { id: 'MAESTRO', name: 'Maestro', icon: 'fa-chalkboard-user' },
        { id: 'AUXILIAR', name: 'Auxiliar', icon: 'fa-hands-helping' },
        { id: 'LOGISTICA', name: 'Logística', icon: 'fa-truck-ramp-box' },
        { id: 'SECRETARIA', name: 'Secretaría', icon: 'fa-file-signature' },
        { id: 'TESORERO', name: 'Tesorero', icon: 'fa-sack-dollar' },
        { id: 'ADMIN', name: 'Director', icon: 'fa-user-tie' },
    ];

    const days = Array.from({ length: 31 }, (_, i) => i + 1);
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 91 }, (_, i) => currentYear - 10 - i);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus({ error: '', info: '' });

        if (!form.rol) return setStatus({ ...status, error: "Selecciona tu usuario arriba." });

        let fechaCompleta = '';
        if (form.rol !== 'ADMIN') {
            if (!form.birthDay || !form.birthMonth || !form.birthYear) {
                return setStatus({ ...status, error: "Completa tu fecha de nacimiento." });
            }
            fechaCompleta = `${form.birthYear}-${form.birthMonth}-${form.birthDay}`;
        }

        // Enviamos el parámetro 'recordar'
        const res = await login(form.rol as any, form.clave, form.nombre, form.campo, fechaCompleta, recordar);
        
        if (!res.exito) {
            setStatus({ ...status, error: res.mensaje });
        } else if (res.mensaje === "SOLICITUD_ENVIADA" || res.mensaje === "PENDIENTE_APROBACION") {
            setStatus({ ...status, info: "Tu cuenta está pendiente. Espera a que el Director te apruebe y presiona 'Verificar Aprobación'." });
            setIsPending(true); // Bloqueamos el formulario
        }
    };

    return (
        <div className="ebd-login-root">
            <div className="ebd-card">
                <i className="fa-solid fa-church ebd-header-icon"></i>
                <h1 className="ebd-title">Gestión EBD</h1>
                <p className="ebd-subtitle">Selecciona tu usuario e ingresa</p>

                {status.info && <div className="ebd-info animate-fade-in">{status.info}</div>}

                <form onSubmit={handleLogin}>
                    {/* Contenedor que se vuelve gris cuando está bloqueado */}
                    <div className={isPending ? "ebd-form-locked" : ""}>
                        <p className="ebd-role-selector-title">Tipo de Usuario</p>
                        <div className="ebd-roles-grid">
                            {rolesConfig.map(role => (
                                <button key={role.id} type="button" className={`ebd-role-btn ${form.rol === role.id ? 'selected' : ''}`} onClick={() => setForm({...form, rol: role.id})}>
                                    <i className={`fa-solid ${role.icon} ebd-role-icon`}></i>
                                    <span className="ebd-role-name">{role.name}</span>
                                </button>
                            ))}
                        </div>

                        {form.rol && form.rol !== 'ADMIN' && (
                            <div className="animate-fade-in">
                                <div className="ebd-form-group">
                                    <label className="ebd-label">Nombre Completo</label>
                                    <input type="text" placeholder="Ej: Juan Pérez" className="ebd-input" value={form.nombre} onChange={(e) => setForm({...form, nombre: e.target.value})} required />
                                </div>

                                <div className="ebd-form-group">
                                    <label className="ebd-label">Fecha de Nacimiento</label>
                                    <div className="ebd-date-grid">
                                        <select className="ebd-input" value={form.birthDay} onChange={(e) => setForm({...form, birthDay: e.target.value})} required>
                                            <option value="" disabled>Día</option>
                                            {days.map(d => <option key={d} value={d < 10 ? `0${d}` : d}>{d}</option>)}
                                        </select>
                                        <select className="ebd-input" value={form.birthMonth} onChange={(e) => setForm({...form, birthMonth: e.target.value})} required>
                                            <option value="" disabled>Mes</option>
                                            {months.map((m, i) => <option key={m} value={i + 1 < 10 ? `0${i + 1}` : i + 1}>{m}</option>)}
                                        </select>
                                        <select className="ebd-input" value={form.birthYear} onChange={(e) => setForm({...form, birthYear: e.target.value})} required>
                                            <option value="" disabled>Año</option>
                                            {years.map(y => <option key={y} value={y}>{y}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="ebd-form-group">
                                    <label className="ebd-label">Campo / Iglesia</label>
                                    <select className="ebd-input" value={form.campo} onChange={(e) => setForm({...form, campo: e.target.value})} required>
                                        <option value="" disabled>Selecciona tu campo...</option>
                                        <option value="La Isla">La Isla</option><option value="Las Delicias">Las Delicias</option><option value="El Amatal">El Amatal</option><option value="El Manguito">El Manguito</option><option value="Buenos Aires">Buenos Aires</option><option value="Corozal #1">Corozal #1</option><option value="El Porvenir">El Porvenir</option><option value="El Caulote">El Caulote</option><option value="Corozal #2">Corozal #2</option><option value="Valle Encantado">Valle Encantado</option><option value="La Playa">La Playa</option>
                                    </select>
                                </div>
                            </div>
                        )}

                        <div className="ebd-form-group">
                            <label className="ebd-label">Contraseña de Acceso</label>
                            <input type="password" placeholder="••••••" className="ebd-input" value={form.clave} onChange={(e) => setForm({...form, clave: e.target.value})} required />
                        </div>

                        {/* Checkbox de Recordar */}
                        <label className="ebd-checkbox-group">
                            <input type="checkbox" checked={recordar} onChange={(e) => setRecordar(e.target.checked)} />
                            Recordar mi contraseña
                        </label>
                    </div>

                    {status.error && <p className="ebd-error animate-fade-in">{status.error}</p>}

                    {/* El botón se adapta si está en espera */}
                    <button type="submit" className="ebd-submit-btn" disabled={isLoading}>
                        {isLoading ? (
                            <><i className="fa-solid fa-spinner fa-spin mr-2"></i> Procesando...</>
                        ) : isPending ? (
                            <><i className="fa-solid fa-rotate mr-2"></i> Verificar Aprobación</>
                        ) : (
                            form.rol === 'ADMIN' ? 'Ingresar como Director' : 'Enviar Solicitud de Registro'
                        )}
                    </button>
                    
                    {/* Botón para deshacer el bloqueo y corregir datos */}
                    {isPending && (
                        <button type="button" className="ebd-cancel-btn" onClick={() => setIsPending(false)}>
                            Quiero modificar mis datos / Cambiar usuario
                        </button>
                    )}
                </form>
            </div>
        </div>
    );
};
