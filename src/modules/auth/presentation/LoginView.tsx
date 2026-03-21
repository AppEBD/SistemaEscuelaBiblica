import React, { useState } from 'react';
import { useAuth } from '../application/useAuth';
// Importamos los nuevos estilos llamativos
import './LoginView.css'; 

export const LoginView: React.FC = () => {
    const { login, isLoading } = useAuth();
    
    // Estado del formulario (eliminamos fechaNac y añadimos dia, mes, año)
    const [form, setForm] = useState({ 
        rol: '', 
        nombre: '', 
        clave: '', 
        campo: '', 
        birthDay: '', 
        birthMonth: '', 
        birthYear: '' 
    });
    const [status, setStatus] = useState({ error: '', info: '' });

    // --- Configuración de los Roles Llamativos ---
    const rolesConfig = [
        { id: 'MAESTRO', name: 'Maestro', icon: 'fa-chalkboard-user' },
        { id: 'AUXILIAR', name: 'Auxiliar', icon: 'fa-hands-helping' },
        { id: 'LOGISTICA', name: 'Logística', icon: 'fa-truck-ramp-box' },
        { id: 'SECRETARIA', name: 'Secretaría', icon: 'fa-file-signature' },
        { id: 'TESORERO', name: 'Tesorero', icon: 'fa-sack-dollar' },
        { id: 'ADMIN', name: 'Director', icon: 'fa-user-tie' },
    ];

    // --- Generadores para la Fecha Separada ---
    const days = Array.from({ length: 31 }, (_, i) => i + 1);
    const months = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    // Generar años desde hace 100 años hasta hace 10 años (mínimo de edad)
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 91 }, (_, i) => currentYear - 10 - i);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus({ error: '', info: '' });

        // Validar selección de rol
        if (!form.rol) {
            setStatus({ ...status, error: "Por favor, selecciona tu usuario arriba." });
            return;
        }

        let fechaCompleta = '';

        // Si es registro (no admin), unimos la fecha
        if (form.rol !== 'ADMIN') {
            if (!form.birthDay || !form.birthMonth || !form.birthYear) {
                setStatus({ ...status, error: "Por favor, completa tu fecha de nacimiento." });
                return;
            }
            // Formato estándar AAAA-MM-DD
            fechaCompleta = `${form.birthYear}-${form.birthMonth}-${form.birthDay}`;
        }

        // --- LLAMADA CORREGIDA A LA FUNCIÓN LOGIN ---
        // Pasamos los parámetros correctos: rol, clave, nombre, campo, fecha
        const res = await login(
            form.rol as any, 
            form.clave, 
            form.nombre, 
            form.campo, 
            fechaCompleta
        );
        
        if (!res.exito) {
            setStatus({ ...status, error: res.mensaje });
        } else if (res.mensaje === "SOLICITUD_ENVIADA" || res.mensaje === "PENDIENTE_APROBACION") {
            setStatus({ ...status, info: "¡Solicitud recibida! Está en espera de aprobación por el Director." });
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
                    
                    {/* --- NUEVA SECCIÓN: Selector de Roles Llamativo --- */}
                    <p className="ebd-role-selector-title">Tipo de Usuario</p>
                    <div className="ebd-roles-grid">
                        {rolesConfig.map(role => (
                            <button
                                key={role.id}
                                type="button"
                                // Si está seleccionado, añadimos la clase 'selected'
                                className={`ebd-role-btn ${form.rol === role.id ? 'selected' : ''}`}
                                onClick={() => setForm({...form, rol: role.id})}
                            >
                                <i className={`fa-solid ${role.icon} ebd-role-icon`}></i>
                                <span className="ebd-role-name">{role.name}</span>
                            </button>
                        ))}
                    </div>

                    {/* --- Campos dinámicos si NO es Admin --- */}
                    {form.rol && form.rol !== 'ADMIN' && (
                        <div className="animate-fade-in">
                            <div className="ebd-form-group">
                                <label className="ebd-label">Nombre Completo</label>
                                <input 
                                    type="text" 
                                    placeholder="Ej: Juan Pérez" 
                                    className="ebd-input" 
                                    value={form.nombre}
                                    onChange={(e) => setForm({...form, nombre: e.target.value})} 
                                    required 
                                />
                            </div>

                            {/* --- NUEVA SECCIÓN: Fecha Separada --- */}
                            <div className="ebd-form-group">
                                <label className="ebd-label">Fecha de Nacimiento</label>
                                <div className="ebd-date-grid">
                                    <select 
                                        className="ebd-input" 
                                        value={form.birthDay} 
                                        onChange={(e) => setForm({...form, birthDay: e.target.value})} 
                                        required
                                    >
                                        <option value="" disabled>Día</option>
                                        {days.map(d => <option key={d} value={d < 10 ? `0${d}` : d}>{d}</option>)}
                                    </select>
                                    <select 
                                        className="ebd-input" 
                                        value={form.birthMonth} 
                                        onChange={(e) => setForm({...form, birthMonth: e.target.value})} 
                                        required
                                    >
                                        <option value="" disabled>Mes</option>
                                        {months.map((m, i) => <option key={m} value={i + 1 < 10 ? `0${i + 1}` : i + 1}>{m}</option>)}
                                    </select>
                                    <select 
                                        className="ebd-input" 
                                        value={form.birthYear} 
                                        onChange={(e) => setForm({...form, birthYear: e.target.value})} 
                                        required
                                    >
                                        <option value="" disabled>Año</option>
                                        {years.map(y => <option key={y} value={y}>{y}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="ebd-form-group">
                                <label className="ebd-label">Campo / Iglesia</label>
                                <select 
                                    className="ebd-input" 
                                    value={form.campo} 
                                    onChange={(e) => setForm({...form, campo: e.target.value})} 
                                    required
                                >
                                    <option value="" disabled>Selecciona tu campo...</option>
                                    <option value="La Isla">La Isla</option>
                                    <option value="Las Delicias">Las Delicias</option>
                                    <option value="El Amatal">El Amatal</option>
                                    <option value="El Manguito">El Manguito</option>
                                    <option value="Buenos Aires">Buenos Aires</option>
                                    <option value="Corozal #1">Corozal #1</option>
                                    <option value="El Porvenir">El Porvenir</option>
                                    <option value="El Caulote">El Caulote</option>
                                    <option value="Corozal #2">Corozal #2</option>
                                    <option value="Valle Encantado">Valle Encantado</option>
                                    <option value="La Playa">La Playa</option>
                                </select>
                            </div>
                        </div>
                    )}

                    <div className="ebd-form-group">
                        <label className="ebd-label">Contraseña de Acceso</label>
                        <input 
                            type="password" 
                            placeholder="••••••" 
                            className="ebd-input" 
                            value={form.clave}
                            onChange={(e) => setForm({...form, clave: e.target.value})} 
                            required 
                        />
                    </div>

                    {status.error && <p className="ebd-error animate-fade-in">{status.error}</p>}

                    <button type="submit" className="ebd-submit-btn" disabled={isLoading}>
                        {isLoading ? (
                            <><i className="fa-solid fa-spinner fa-spin mr-2"></i> Procesando...</>
                        ) : (
                            form.rol === 'ADMIN' ? 'Ingresar como Director' : 'Enviar Solicitud de Registro'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};
