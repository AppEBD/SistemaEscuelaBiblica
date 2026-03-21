import React from 'react';
import './Modal.css'; // Conectamos sus propios estilos

// Definimos qué cosas necesita recibir el Modal para funcionar
interface ModalProps {
    isOpen: boolean;        // ¿Está abierto o cerrado?
    onClose: () => void;    // Función para cerrarlo
    title: string;          // El título (ej. "Editar Usuario")
    children: React.ReactNode; // Lo que va adentro (el formulario)
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
    // Si isOpen es falso, no dibujamos nada en la pantalla
    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h3>{title}</h3>
                    <button className="modal-close-btn" onClick={onClose}>
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>
                <div className="modal-body">
                    {/* Aquí se inyectará automáticamente el formulario */}
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;
