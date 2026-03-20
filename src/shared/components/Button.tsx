import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ children, isLoading, className, ...props }) => {
    return (
        <button 
            className={`px-4 py-3 rounded-2xl font-black transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center bg-indigo-600 text-white shadow-lg shadow-indigo-200 ${className}`} 
            disabled={isLoading || props.disabled}
            {...props}
        >
            {isLoading ? <i className="fas fa-spinner animate-spin mr-2"></i> : null}
            {children}
        </button>
    );
};
