/**
 * Calcula la edad exacta en años a partir de una fecha de nacimiento.
 * Automáticamente detecta si ya cumplió años este año o no.
 * Formato esperado: "YYYY-MM-DD"
 */
export const calcularEdadExacta = (fechaNacimiento: string): number | null => {
    if (!fechaNacimiento) return null;
    
    const hoy = new Date();
    const fechaCumple = new Date(fechaNacimiento);
    
    let edad = hoy.getFullYear() - fechaCumple.getFullYear();
    const diferenciaMeses = hoy.getMonth() - fechaCumple.getMonth();
    
    // Si el mes actual es menor al mes de nacimiento, 
    // o si es el mismo mes pero el día de hoy es menor al día de nacimiento,
    // significa que aún no ha cumplido años este año, así que le restamos 1.
    if (diferenciaMeses < 0 || (diferenciaMeses === 0 && hoy.getDate() < fechaCumple.getDate())) {
        edad--;
    }
    
    return edad;
};

/**
 * Formatea una fecha (timestamp) para que se vea bonita y en español (ej. 21/03/2026)
 */
export const formatearFechaLocal = (timestamp: number): string => {
    if (!timestamp) return 'Desconocida';
    return new Date(timestamp).toLocaleDateString('es-SV');
};
