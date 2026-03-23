import React, { useState } from 'react';

// Definimos qué información necesita recibir el Acordeón para funcionar
interface AccordionProps {
    title: string;
    children: React.ReactNode;
}

const Accordion: React.FC<AccordionProps> = ({ title, children }) => {
    // Este estado controla si el acordeón está abierto o cerrado
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div style={{
            marginBottom: '15px',
            border: '1px solid #e2e8f0',
            borderRadius: '16px',
            backgroundColor: 'white',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
            overflow: 'hidden',
            transition: 'all 0.3s ease'
        }}>
            {/* El botón que el usuario presiona para abrir/cerrar */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '20px',
                    backgroundColor: isOpen ? '#f8fafc' : 'white',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: '800',
                    color: '#1e293b',
                    textAlign: 'left',
                    transition: 'background-color 0.2s ease'
                }}
            >
                <span>{title}</span>
                {/* Flechita que cambia de dirección si está abierto o cerrado */}
                <i 
                    className={`fa-solid fa-chevron-down`} 
                    style={{ 
                        color: '#64748b', 
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.3s ease'
                    }}
                ></i>
            </button>
            
            {/* Si isOpen es true, mostramos el contenido (los usuarios) */}
            {isOpen && (
                <div style={{
                    padding: '0 20px 20px 20px',
                    backgroundColor: '#f8fafc',
                    borderTop: '1px solid #e2e8f0',
                    animation: 'fadeIn 0.3s ease-in-out'
                }}>
                    {children}
                </div>
            )}
        </div>
    );
};

export default Accordion;
