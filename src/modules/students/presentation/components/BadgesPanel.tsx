import React from 'react';
import './BadgesPanel.css';

interface BadgesPanelProps {
    userName: string;
}

export const BadgesPanel: React.FC<BadgesPanelProps> = ({ userName }) => {
    // Aquí en el futuro puedes conectar con Firebase para ver cuáles tiene desbloqueadas el maestro
    
    return (
        <div className="badges-section">
            <div className="badges-header">
                <h3 className="badges-title">
                    <i className="fa-solid fa-medal" style={{color: '#f59e0b'}}></i> 
                    Insignias de {userName.split(' ')[0]}
                </h3>
                <span className="badges-score">4 Desbloqueadas</span>
            </div>

            <div className="badges-grid">
                
                {/* INSIGNIA 1: Antigüedad */}
                <div className="badge-card">
                    <div className="badge-icon-wrapper badge-veteran">
                        <i className="fa-solid fa-shield-halved"></i>
                        <div className="badge-level">Nvl 2</div>
                    </div>
                    <p className="badge-name">Guardián</p>
                    <p className="badge-desc">2 Años sirviendo</p>
                </div>

                {/* INSIGNIA 2: Seminario 1 */}
                <div className="badge-card">
                    <div className="badge-icon-wrapper badge-seminario-1">
                        <i className="fa-solid fa-book-bible"></i>
                    </div>
                    <p className="badge-name">Seminario I</p>
                    <p className="badge-desc">Básico</p>
                </div>

                {/* INSIGNIA 3: Seminario 2 */}
                <div className="badge-card">
                    <div className="badge-icon-wrapper badge-seminario-2">
                        <i className="fa-solid fa-graduation-cap"></i>
                    </div>
                    <p className="badge-name">Seminario II</p>
                    <p className="badge-desc">Intermedio</p>
                </div>

                {/* INSIGNIA 4: Logro Maestro Estrella */}
                <div className="badge-card">
                    <div className="badge-icon-wrapper badge-star">
                        <i className="fa-solid fa-star"></i>
                    </div>
                    <p className="badge-name">Puntualidad</p>
                    <p className="badge-desc">Mes Perfecto</p>
                </div>

                {/* INSIGNIA 5: Seminario 3 (BLOQUEADA) */}
                <div className="badge-card">
                    <div className="badge-icon-wrapper badge-locked">
                        <i className="fa-solid fa-lock"></i>
                    </div>
                    <p className="badge-name" style={{color: '#94a3b8'}}>Seminario III</p>
                    <p className="badge-desc">Avanzado</p>
                </div>

            </div>
        </div>
    );
};
