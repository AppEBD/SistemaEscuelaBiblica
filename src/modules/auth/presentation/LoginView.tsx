import React, { useState } from 'react';
import { useAuth } from '../application/useAuth';
import './LoginView.css';

export const LoginView: React.FC = () => {
    const { login, isLoading } = useAuth();
    const [form, setForm] = useState({
        rol: '',
        nombre: '',
        clave: '',
        campo: '',
        fechaNac: '',
    });
    const [status, setStatus] = useState({ error: '', info: '' });

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus({ error: '', info: '' });

        try {
            const res = await login(
                form.rol as any,
                form.clave,
                form.nombre,
                form.campo,
                form.fechaNac
            );

            if (!res.exito) {
                setStatus({ error: res.mensaje, info: '' });
            } else if (res.mensaje === 'SOLICITUD_ENVIADA') {
                setStatus({ error: '', info: 'Tu solicitud fue enviada. El Director debe aprobarte para ingresar.' });
            } else if (res.mensaje === 'PENDIENTE_APROBACION') {
                setStatus({ error: '', info: 'Tu cuenta está pendiente de aprobación por el Director.' });
            }
        } catch (err) {
            setStatus({ error: 'Ocurrió un error inesperado.', info: '' });
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setStatus({ error: '', info: '' });
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const esAdmin = form.rol === 'ADMIN';

    return (
        <div className="login-wrapper">
            <div className="login-card">
                <i className="fa-solid fa-church login-icon"></i>
                <h1 className="login-title">Gestión EBD</h1>
                <p className="login-subtitle">Ingresa tus datos para acceder</p>

                {status.info && <div className="login-info">{status.info}</div>}

                <form onSubmit={handleLogin} noValidate>
                    <select
                        name="rol"
                        className="login-input"
                        value={form.rol}
                        onChange={handleChange}
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

                    {form.rol && !esAdmin && (
                        <>
                            <input
                                type="text"
                                name="nombre"
                                placeholder="Nombre Completo"
                                className="login-input"
                                value={form.nombre}
                                onChange={handleChange}
                                required
                            />
                            <input
                                type="date"
                                name="fechaNac"
                                className="login-input"
                                value={form.fechaNac}
                                onChange={handleChange}
                                required
                            />
                            <select
                                name="campo"
                                className="login-input"
                                value={form.campo}
                                onChange={handleChange}
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
                        name="clave"
                        placeholder="Contraseña"
                        className="login-input"
                        value={form.clave}
                        onChange={handleChange}
                        required
                    />

                    {status.error && <p className="login-error">{status.error}</p>}

                    <button
                        type="submit"
                        className="login-btn"
                        disabled={isLoading || !form.rol || !form.clave}
                    >
                        {isLoading ? 'Ingresando...' : 'Ingresar'}
                    </button>
                </form>
            </div>
        </div>
    );
};
