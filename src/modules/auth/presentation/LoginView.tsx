import React, { useState } from 'react';
import { useAuth } from '../application/useAuth';
// ¡Aquí conectamos los estilos mágicos!
import './LoginView.css'; 

export const LoginView: React.FC = () => {
    const { login, isLoading } = useAuth();
    const [form, setForm] = useState({ rol: '', nombre: '', clave: '', campo: '', fechaNac: '' });
    const [status, setStatus] = useState({ error: '', info: '' });

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus({ error: '', info: '' });

        const res = await login(form.rol as any, form.clave, form.nombre, form.campo, form.fechaNac);
        
        if (!res.exito) {
            setStatus({ ...status, error: res.mensaje });
        } else if (res.mensaje === "SOLICITUD_ENVIADA" || res.mensaje === "PENDIENTE_APROBACION") {
            setStatus({ ...status, info: "Tu solicitud está en espera de aprobación por el Director." });
        }
    };

    return (
        <div className="login-wrapper">
            <div className="login-card">
                <i className="fa-solid fa-church login-icon"></i>
                <h1 className="login-title">Gestión EBD</h1>
                <p className="login-subtitle">Ingresa tus datos para acceder</p>

                {status.info && <div className="login-info">{status.info}</div>}

                <form onSubmit={handleLogin}>
                    <select 
                        className="login-input" 
                        value={form.rol} 
                        onChange={(e) => setForm({...form, rol: e.target.value})} 
                        required
                    >
                        <option value="" disabled>Selecciona tu rol...</option>
                        <option value="MAESTRO">Maestro</option>
                        <option value="AUXILIAR">Auxiliar</option>
                        <option value="LOGISTICA">Logística</option>
                        <option value="SECRETARIA">Secretaría</option>
                        <option value="TESORERO">Tesorero</option>
                        <option value="ADMIN">Director (Admin)</option>
                    </select>

                    {form.rol && form.rol !== 'ADMIN' && (
                        <>
                            <input 
                                type="text" 
                                placeholder="Nombre Completo" 
                                className="login-input" 
                                onChange={(e) => setForm({...form, nombre: e.target.value})} 
                                required 
                            />
                            <input 
                                type="date" 
                                className="login-input" 
                                onChange={(e) => setForm({...form, fechaNac: e.target.value})} 
                                required 
                            />
                            <select 
                                className="login-input" 
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
                        </>
                    )}

                    <input 
                        type="password" 
                        placeholder="Contraseña" 
                        className="login-input" 
                        onChange={(e) => setForm({...form, clave: e.target.value})} 
                        required 
                    />

                    {status.error && <p className="login-error">{status.error}</p>}

                    <button type="submit" className="login-btn" disabled={isLoading}>
                        {isLoading ? 'Ingresando...' : 'Ingresar'}
                    </button>
                </form>
            </div>
        </div>
    );
};
