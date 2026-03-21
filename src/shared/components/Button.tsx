import React from 'react';

interface ButtonProps {
    type?: "button" | "submit" | "reset";
    className?: string;
    disabled?: boolean;
    onClick?: () => void;
    children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
    type = "button", 
    className = "", 
    disabled = false, 
    onClick, 
    children 
}) => {
    return (
        <button type={type} className={className} disabled={disabled} onClick={onClick}>
            {children}
        </button>
    );
};
