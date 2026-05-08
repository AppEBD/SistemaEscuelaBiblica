import React, { useState } from 'react';
import { calcularInsigniaTiempoServicio } from '../../../shared/utils/insignias.utils';
import './BadgesPanel.css';

interface BadgesPanelProps { 
    userName: string; 
    fechaInicioServicio?: string;
    insigniasUsuario?: string[];
    insigniasGlobales?: any[];
}

export const BadgesPanel: React.FC<BadgesPanelProps> = ({ 
    userName, 
    fechaInicioServicio, 
    insigniasUsuario = [], 
    insigniasGlobales = [] 
}) => {
    const [isOpen, setIsOpen] = useState(false);
    
    // 1. Calculamos la insignia automática por tiempo
    const insigniaTiempo = calcularInsigniaTiempoServicio(fechaInicioServicio);

    // 2. Calculamos cuántas insignias tiene desbloqueadas en total
    const totalDesbloqueadas = (insigniaTiempo ? 1 : 0) + insigniasUsuario.length;

    return (
        <div className="badges-section">
            <div className="badges-header-clickable" onClick={() => setIsOpen(!isOpen)}>
                <div className="badges-title-wrap">
                    <i className="fa-solid fa-medal" style={{color: '#f59e0b', fontSize: '24px'}}></i>
                    <div>
                        <h3 className="badges-title">Insignias de {userName.split(' ')[0]}</h3>
                        <span className="badges-subtitle">{totalDesbloqueadas} Desbloqueadas</span>
                    </div>
                </div>
                <i className={`fa-solid fa-chevron-${isOpen ? 'up' : 'down'}`} style={{color: '#94a3b8'}}></i>
            </div>

            {isOpen && (
                <div className="badges-grid animate-fade-in">
                    
                    {/* INSIGNIA AUTOMÁTICA DE TIEMPO (Siempre se muestra si hay fecha) */}
                    {insigniaTiempo ? (
                        <div className="badge-card">
                            <div className="badge-icon-wrapper badge-veteran">
                                {insigniaTiempo.icono}
                            </div>
                            <p className="badge-name">{insigniaTiempo.titulo}</p>
                            <p className="badge-desc">{insigniaTiempo.descripcion}</p>
                        </div>
                    ) : (
                        <div className="badge-card">
                            <div className="badge-icon-wrapper badge-locked"><i className="fa-solid fa-clock"></i></div>
                            <p className="badge-name" style={{color: '#94a3b8'}}>Tiempo de Servicio</p>
                            <p className="badge-desc">Fecha no registrada</p>
                        </div>
                    )}

                    {/* INSIGNIAS CREADAS POR EL ADMIN (Se muestran a color si las tiene, en gris si no) */}
                    {insigniasGlobales.map(insignia => {
                        const laTieneDesbloqueada = insigniasUsuario.includes(insignia.id);
                        
                        if (laTieneDesbloqueada) {
                            return (
                                <div className="badge-card" key={insignia.id}>
                                    <div className="badge-icon-wrapper badge-seminario-1">
                                        {insignia.icono}
                                    </div>
                                    <p className="badge-name">{insignia.titulo}</p>
                                    <p className="badge-desc">{insignia.descripcion}</p>
                                </div>
                            );
                        } else {
                            // Está bloqueada
                            return (
                                <div className="badge-card" key={insignia.id}>
                                    <div className="badge-icon-wrapper badge-locked">
                                        <i className="fa-solid fa-lock"></i>
                                    </div>
                                    <p className="badge-name" style={{color: '#94a3b8'}}>{insignia.titulo}</p>
                                    <p className="badge-desc">Bloqueada</p>
                                </div>
                            );
                        }
                    })}
                </div>
            )}
        </div>
    );
};
