import React from 'react';
import { useNotifications } from './useNotifications';
import './NotificationsWidget.css'; // Archivo CSS que crearemos ahora

export const NotificationsWidget = () => {
    const { notificaciones, reaccionesBD, manejarReaccion, marcarNotificacion, showBirthdayOverlay, userData } = useNotifications();
    const myUserId = userData?.uid || userData?.id; 
    const nombreUsuario = userData?.nombre || 'Miembro del Equipo';

    return (
        <>
            {/* EL CONFETI */}
            {showBirthdayOverlay && (
                <div className="birthday-overlay">
                    <div className="emoji-confetti" style={{left: '10%', animationDuration: '3s', animationDelay: '0s'}}>🎉</div>
                    <div className="emoji-confetti" style={{left: '25%', animationDuration: '4.5s', animationDelay: '0.2s'}}>🎈</div>
                    <div className="emoji-confetti" style={{left: '45%', animationDuration: '3.5s', animationDelay: '0.5s'}}>🎊</div>
                    <div className="emoji-confetti" style={{left: '65%', animationDuration: '4s', animationDelay: '0.1s'}}>🎁</div>
                    <div className="emoji-confetti" style={{left: '85%', animationDuration: '3.2s', animationDelay: '0.7s'}}>🎉</div>
                    <div className="emoji-confetti" style={{left: '15%', animationDuration: '3.8s', animationDelay: '1.2s'}}>🎂</div>
                    <div className="emoji-confetti" style={{left: '75%', animationDuration: '3.3s', animationDelay: '1.5s'}}>🎈</div>
                    <h1>¡Feliz Cumpleaños!</h1>
                    <p style={{color: 'white', fontSize: '18px', marginTop: '15px', fontWeight: 'bold', textAlign: 'center', padding: '0 20px'}}>Que Dios te bendiga grandemente hoy, {nombreUsuario.split(' ')[0]}.</p>
                </div>
            )}

            {/* EL WIDGET DE AVISOS */}
            <div className="home-widget">
                <div className="home-widget-title"><i className="fa-solid fa-bell" style={{color: '#f59e0b'}}></i> Avisos y Cumpleaños</div>
                
                {notificaciones.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '20px 0', color: '#94a3b8' }}>
                        <i className="fa-regular fa-bell-slash" style={{ fontSize: '30px', marginBottom: '10px', opacity: 0.5 }}></i>
                        <p style={{ margin: 0, fontSize: '13px', fontWeight: '600' }}>No hay avisos ni cumpleañeros esta semana.</p>
                    </div>
                ) : (
                    <div className="notif-list">
                        {notificaciones.map((n: any) => {
                            const rData = reaccionesBD[String(n.id)] || { usuarios: {} };
                            const miReaccion = myUserId ? rData.usuarios[myUserId] : null;
                            const esCumple = n.isCumplePersonal || n.isCumpleEquipo;

                            let up = 0, down = 0, cake = 0;
                            Object.values(rData.usuarios).forEach(voto => {
                                if (voto === 'up') up++;
                                if (voto === 'down') down++;
                                if (voto === 'cake') cake++;
                            });

                            return (
                            <div key={n.id} className={`notif-item ${!n.leida ? 'unread' : ''}`} onClick={() => marcarNotificacion(n.id)}>
                                <div className="notif-icon">
                                    {n.isCumplePersonal ? <i className="fa-solid fa-gift" style={{color: '#f59e0b'}}></i> :
                                        n.isCumpleEquipo ? <i className="fa-solid fa-cake-candles" style={{color: '#ec4899'}}></i> :
                                        (n.leida ? <i className="fa-regular fa-envelope-open"></i> : <i className="fa-solid fa-envelope"></i>)
                                    }
                                </div>
                                <div className="notif-content">
                                    <h4 className="notif-title">
                                        {n.titulo} 
                                        {!n.leida && !esCumple && <span className="badge-new">NUEVO</span>}
                                    </h4>
                                    <p className="notif-desc">{n.mensaje}</p>
                                    <span className="notif-date">{n.fecha}</span>
                                    
                                    <div className="notif-reactions">
                                        <button className={`reaction-btn ${miReaccion === 'up' ? 'active' : ''}`} onClick={(e) => manejarReaccion(String(n.id), 'up', e)}>
                                            👍🏻 {up > 0 ? up : ''}
                                        </button>
                                        {!esCumple && (
                                            <button className={`reaction-btn ${miReaccion === 'down' ? 'active-down' : ''}`} onClick={(e) => manejarReaccion(String(n.id), 'down', e)}>
                                                👎🏻 {down > 0 ? down : ''}
                                            </button>
                                        )}
                                        {esCumple && (
                                            <button className={`reaction-btn ${miReaccion === 'cake' ? 'active-cake' : ''}`} onClick={(e) => manejarReaccion(String(n.id), 'cake', e)}>
                                                🎂 {cake > 0 ? cake : ''}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )})}
                    </div>
                )}
            </div>
        </>
    );
};
