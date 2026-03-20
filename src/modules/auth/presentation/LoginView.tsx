import React, { useState } from 'react';
import { useAuth } from '../application/useAuth';
import { Button } from '../../../shared/components/Button';
import { UserRole } from '../domain/auth.model';

export const LoginView: React.FC = () => {
    const { login, isLoading } = useAuth();
    const [form, setForm] = useState({ rol: '' as UserRole, nombre: '', clave: '', campo: '', fechaNac: '' });
    const [status, setStatus] = useState({ error: '', info: '' });

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus({ error: '', info: '' });

        const res = await login(form.rol, form.clave, form.nombre, form.campo, form.fechaNac);
        
        if (!res.exito) {
            setStatus({ ...status, error: res.mensaje });
        } else if (res.mensaje === "SOLICITUD_ENVIADA" || res.mensaje === "PENDIENTE_APROBACION") {
            setStatus({ ...status, info: "Tu solicitud está en espera de aprobación por el Director." });
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6">
            <div className="w-full max-w-sm bg-white p-8 rounded-[32px] shadow-2xl">
                <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
                    <i className="fas fa-church"></i>
                </div>
                
                <h1 className="text-2xl font-black text-center text-slate-800 mb-2">EBD v2.0</h1>
                <p className="text-sm text-center text-slate-500 mb-8">Ingresa tus datos para acceder</p>

                {status.info && <div className="mb-6 p-4 bg-amber-50 rounded-2xl text-xs font-bold text-amber-800 text-center">{status.info}</div>}

                <form onSubmit={handleLogin} className="space-y-4">
                    <select className="w-full p-4 rounded-2xl bg-slate-50 outline-none font-bold text-slate-700" value={form.rol} onChange={(e) => setForm({...form, rol: e.target.value as UserRole})} required>
                        <option value="" disabled>Selecciona tu rol...</option>
                        <option value="MAESTRO">Maestro</option>
                        <option value="ADMIN">Director</option>
                    </select>

                    {form.rol && form.rol !== 'ADMIN' && (
                        <>
                            <input type="text" placeholder="Nombre Completo" className="w-full p-4 rounded-2xl bg-slate-50 outline-none font-bold text-slate-700" onChange={(e) => setForm({...form, nombre: e.target.value})} required />
                            <input type="date" className="w-full p-4 rounded-2xl bg-slate-50 outline-none font-bold text-slate-700 text-xs" onChange={(e) => setForm({...form, fechaNac: e.target.value})} required title="Fecha de nacimiento" />
                            <select className="w-full p-4 rounded-2xl bg-slate-50 outline-none font-bold text-slate-700" value={form.campo} onChange={(e) => setForm({...form, campo: e.target.value})} required>
                                <option value="" disabled>Selecciona tu campo...</option>
                                <option value="La Isla">La Isla</option>
                                <option value="El Amatal">El Amatal</option>
                            </select>
                        </>
                    )}

                    <input type="password" placeholder="Contraseña" className="w-full p-4 rounded-2xl bg-slate-50 outline-none font-black tracking-widest text-slate-700 text-center text-lg" onChange={(e) => setForm({...form, clave: e.target.value})} required />

                    {status.error && <p className="text-rose-500 text-xs text-center font-bold">{status.error}</p>}

                    <Button type="submit" className="w-full py-4 text-lg" isLoading={isLoading}>Ingresar</Button>
                </form>
            </div>
        </div>
    );
};
