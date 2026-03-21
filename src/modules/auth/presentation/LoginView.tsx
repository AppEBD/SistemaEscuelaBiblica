import React, { useState, useEffect } from 'react';
import { useAuth } from '../application/useAuth';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../../core/firebase/firebase.config';
import { AuthService } from '../infrastructure/auth.service';
import './LoginView.css'; 

export const LoginView: React.FC = () => {
    const { login, isLoading } = useAuth();
    
    const estadoInicial = { rol: '', nombre: '', clave: '', campo: '', birthDay: '', birthMonth: '', birthYear: '' };
    const [form, setForm] = useState(estadoInicial);
    const [status, setStatus] = useState({ error: '', info: '' });
    
    const [recordar, setRecordar] = useState(true);
    const [isPending, setIsPending] = useState(false);
    const [isReturning, setIsReturning] = useState(false);

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

    useEffect(() => {
        // 1. Revisamos si estaba pendiente (prioridad 1)
        const pendingData = localStorage.getItem('usuario_en_espera');
        if (pendingData) {
            const datos = JSON.parse(pendingData);
            setForm(datos.form);
            setIsPending(true);
            setStatus({ error: '', info: "Tu cuenta está pendiente de aprobación por el Director." });

            const coleccion = AuthService.obtenerColeccion(datos.form.rol);
            const unsubscribe = onSnapshot(doc(db, coleccion, datos.id), (docSnap) => {
                if (!docSnap.exists()) {
                    localStorage.removeItem('usuario_en_espera');
                    setIsPending(false);
                    setForm(estadoInicial);
                    setStatus({ info: '', error: "Tu solicitud fue DENEGADA. Los datos han sido borrados de la base de datos." });
                } else if (docSnap.data().estado === 'Activo') {
                    localStorage.removeItem('usuario_en_espera');
                    AuthService.sesion.guardar(datos.form.rol, { id: docSnap.id, ...docSnap.data() }, recordar);
                    window.location.reload();
                }
            });
            return () => unsubscribe();
        }

        // 2. Si no estaba pendiente, vemos si es alguien que cerró sesión (prioridad 2)
        const recentData = localStorage.getItem('usuario_reciente');
        if (recentData) {
            setForm(JSON.parse(recentData));
            setIsReturning(true);
        }
    }, [recordar]);

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

        const res = await login(form.rol as any, form.clave, form.nombre, form.campo, fechaCompleta, recordar, isPending);
        
        if (!res.exito) {
            if (res.mensaje === "DENEGADO") {
                localStorage.removeItem('usuario_en_espera');
                setIsPending(false); setForm(estadoInicial);
                setStatus({ info: '', error: "Tu solicitud fue DENEGADA por el Director." });
            } else {
                setStatus({ ...status, error: res.mensaje });
            }
        } else if (res.mensaje === "SOLICITUD_ENVIADA" || res.mensaje === "PENDIENTE_APROBACION") {
            localStorage.setItem('usuario_en_espera', JSON.stringify({ id: res.id, form }));
            setIsPending(true); setIsReturning(false);
            setStatus({ ...status, info: "Tu cuenta está pendiente. Espera a que el Director te apruebe." });
        } else if (res.mensaje === "ACCESO_CONCEDIDO" || res.mensaje === "Bienvenido Director") {
            // ¡MAGIA! Guardamos sus datos para que al cerrar sesión el formulario esté en gris
            localStorage.setItem('usuario_reciente', JSON.stringify(form));
            window.location.reload();
        }
    };

    const limpiarCuenta = () => {
        localStorage.removeItem('usuario_en_espera');
        localStorage.removeItem('usuario_reciente');
        setIsPending(false); setIsReturning(false);
        setForm(estadoInicial);
        setStatus({ info: '', error: '' });
    };

    return (
        <div className="ebd-login-root">
            <div className="ebd-card">
                <i className="fa-solid fa-church ebd-header-icon"></i>
                <h1 className="ebd-title">Gestión EBD</h1>
                <p className="ebd-subtitle">Selecciona tu usuario e ingresa</p>

                {status.info && <div className="ebd-info animate-fade-in">{status.info}</div>}
                {status.error && <p className="ebd-error animate-fade-in">{status.error}</p>}

                <form onSubmit={handleLogin}>
                    <div className={(isPending || isReturning) ? "ebd-form-locked" : ""}>
                        <p className="ebd-role-selector-title">Tipo de Usuario</p>
                        <div className="ebd-roles-grid">
                            {rolesConfig.map(role => (
                                <button key={role.id} type="button" className={`ebd-role-btn ${form.rol === role.id ? 'selected' : ''}`} onClick={() => setForm({...form, rol: role.id})}>
                                    <i className={`fa-solid ${role.icon} ebd-role-icon`}></i>
                                    <span className="ebd-role-name">{role.name}</span>
                                </button>
                            ))}
                        </div>

                        {!form.rol ? (
                            <div className="ebd-info animate-fade-in" style={{ backgroundColor: '#e0e7ff', color: '#4338ca', borderLeftColor: '#4f46e5' }}>
                                👆 Selecciona tu tipo de usuario arriba para continuar.
                            </div>
                        ) : (
                            <div className="animate-fade-in">
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
                                    </>
                                )}

                                <div className="ebd-form-group">
                                    <label className="ebd-label">Contraseña de Acceso</label>
                                    <input type="password" placeholder="••••••" className="ebd-input" value={form.clave} onChange={(e) => setForm({...form, clave: e.target.value})} required />
                                </div>

                                <label className="ebd-checkbox-group">
                                    <input type="checkbox" checked={recordar} onChange={(e) => setRecordar(e.target.checked)} />
                                    Recordar mi contraseña
                                </label>
                            </div>
                        )}
                    </div>

                    <button type="submit" className="ebd-submit-btn" disabled={isLoading || isPending || (!form.rol && !isReturning)}>
                        {isLoading ? (
                            <><i className="fa-solid fa-spinner fa-spin mr-2"></i> Procesando...</>
                        ) : isPending ? (
                            <><i className="fa-solid fa-clock mr-2"></i> Esperando Aprobación...</>
                        ) : isReturning ? (
                            <><i className="fa-solid fa-arrow-right-to-bracket mr-2"></i> Ingresar de nuevo</>
                        ) : (
                            form.rol === 'ADMIN' ? 'Ingresar como Director' : 'Enviar Solicitud de Registro'
                        )}
                    </button>
                    
                    {(isPending || isReturning) && (
                        <button type="button" className="ebd-cancel-btn" onClick={limpiarCuenta}>
                            {isPending ? 'Quiero modificar mis datos / Cambiar usuario' : 'Ingresar con otra cuenta'}
                        </button>
                    )}
                </form>
            </div>
        </div>
    );
};
