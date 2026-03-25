import React, { useState } from 'react';
import './BadgesPanel.css';

interface BadgesPanelProps { userName: string; }

export const BadgesPanel: React.FC<BadgesPanelProps> = ({ userName }) => {
    const [isOpen, setIsOpen] = useState(false);
    const unlocked = 4; // Cantidad simulada

    return (
        <div className="badges-section">
            <div className="badges-header-clickable" onClick={() => setIsOpen(!isOpen)}>
                <div className="badges-title-wrap">
                    <i className="fa-solid fa-medal" style={{color: '#f59e0b', fontSize: '24px'}}></i>
                    <div>
                        <h3 className="badges-title">Insignias de {userName.split(' ')[0]}</h3>
                        <span className="badges-subtitle">{unlocked} Desbloqueadas</span>
                    </div>
                </div>
                <i className={`fa-solid fa-chevron-${isOpen ? 'up' : 'down'}`} style={{color: '#94a3b8'}}></i>
            </div>

            {isOpen && (
                <div className="badges-grid animate-fade-in">
                    <div className="badge-card">
                        <div className="badge-icon-wrapper badge-veteran"><i className="fa-solid fa-shield-halved"></i><div className="badge-level">Nvl 2</div></div>
                        <p className="badge-name">Guardián</p><p className="badge-desc">2 Años sirviendo</p>
                    </div>
                    <div className="badge-card">
                        <div className="badge-icon-wrapper badge-seminario-1"><i className="fa-solid fa-book-bible"></i></div>
                        <p className="badge-name">Seminario I</p><p className="badge-desc">Básico completado</p>
                    </div>
                    <div className="badge-card">
                        <div className="badge-icon-wrapper badge-seminario-2"><i className="fa-solid fa-graduation-cap"></i></div>
                        <p className="badge-name">Seminario II</p><p className="badge-desc">Intermedio</p>
                    </div>
                    <div className="badge-card">
                        <div className="badge-icon-wrapper badge-star"><i className="fa-solid fa-star"></i></div>
                        <p className="badge-name">Puntualidad</p><p className="badge-desc">Mes Perfecto</p>
                    </div>
                    <div className="badge-card">
                        <div className="badge-icon-wrapper badge-locked"><i className="fa-solid fa-lock"></i></div>
                        <p className="badge-name" style={{color: '#94a3b8'}}>Seminario III</p><p className="badge-desc">Avanzado (Bloqueado)</p>
                    </div>
                </div>
            )}
        </div>
    );
};
