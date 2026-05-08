import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null
    };

    public static getDerivedStateFromError(error: Error): State {
        // Actualiza el estado para que la siguiente renderización muestre la UI de repuesto
        return { hasError: true, error, errorInfo: null };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // Aquí atrapamos el error y lo guardamos en el estado para mostrarlo
        console.error('Error atrapado por ErrorBoundary:', error, errorInfo);
        this.setState({ error, errorInfo });
    }

    private limpiarCaché = () => {
        // Botón de emergencia para borrar datos corruptos que causen el crash
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = '/';
    };

    public render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '30px', backgroundColor: '#fef2f2', color: '#991b1b', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
                    <div style={{ maxWidth: '800px', margin: '0 auto', backgroundColor: 'white', padding: '30px', borderRadius: '20px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', border: '2px solid #fca5a5' }}>
                        <h1 style={{ fontSize: '28px', fontWeight: '900', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <i className="fa-solid fa-triangle-exclamation" style={{color: '#ef4444'}}></i> ¡Ouch! La pantalla colapsó.
                        </h1>
                        <p style={{ fontSize: '15px', color: '#475569', marginBottom: '20px' }}>
                            El sistema encontró un error inesperado al intentar cargar la vista. No te preocupes, el <strong>Error Boundary</strong> detuvo la pantalla blanca para que podamos ver qué falló.
                        </p>
                        
                        <div style={{ backgroundColor: '#fee2e2', padding: '15px', borderRadius: '12px', borderLeft: '5px solid #ef4444', marginBottom: '20px', fontWeight: 'bold' }}>
                            {this.state.error?.toString()}
                        </div>

                        <details style={{ backgroundColor: '#f8fafc', padding: '15px', borderRadius: '12px', border: '1px solid #e2e8f0', cursor: 'pointer', marginBottom: '25px' }}>
                            <summary style={{ fontWeight: '800', color: '#334155' }}>Ver ruta exacta del error (Stack Trace)</summary>
                            <pre style={{ marginTop: '15px', fontSize: '12px', color: '#64748b', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                                {this.state.errorInfo?.componentStack}
                            </pre>
                        </details>

                        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                            <button onClick={() => window.location.reload()} style={{ flex: 1, backgroundColor: '#3b82f6', color: 'white', border: 'none', padding: '15px', borderRadius: '12px', fontWeight: '800', fontSize: '15px', cursor: 'pointer' }}>
                                <i className="fa-solid fa-rotate-right"></i> Refrescar Página
                            </button>
                            <button onClick={this.limpiarCaché} style={{ flex: 1, backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '15px', borderRadius: '12px', fontWeight: '800', fontSize: '15px', cursor: 'pointer' }}>
                                <i className="fa-solid fa-trash-can"></i> Borrar Caché y Salir
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
