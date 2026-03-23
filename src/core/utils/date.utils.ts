// 1. Calcula la edad exacta que tiene la persona el día de HOY.
export const calcularEdadExacta = (fechaNacimiento: string | undefined, edadGuardada?: number): number | string => {
    if (!fechaNacimiento) return edadGuardada ?? 'N/A';
    
    const partes = fechaNacimiento.split('-');
    if (partes.length !== 3) return edadGuardada ?? 'N/A';
    
    const anio = parseInt(partes[0], 10);
    const mes = parseInt(partes[1], 10) - 1; 
    const dia = parseInt(partes[2], 10);

    const hoy = new Date();
    const fechaCumple = new Date(anio, mes, dia);
    
    let edad = hoy.getFullYear() - fechaCumple.getFullYear();
    const diferenciaMeses = hoy.getMonth() - fechaCumple.getMonth();
    
    if (diferenciaMeses < 0 || (diferenciaMeses === 0 && hoy.getDate() < fechaCumple.getDate())) {
        edad--;
    }
    
    return isNaN(edad) ? (edadGuardada ?? 'N/A') : edad;
};

// 2. Convierte el timestamp a una fecha de El Salvador
export const formatearFechaLocal = (timestamp: number): string => {
    if (!timestamp) return 'Desconocida';
    return new Date(timestamp).toLocaleDateString('es-SV');
};

// 3. FÓRMULA CORREGIDA: Calcula la edad que cumplirá en su próximo cumpleaños
export const calcularEdadEsteAnio = (fechaNacimiento: string | undefined): number | string => {
    // Reutilizamos la fórmula exacta para saber cuántos años tiene hoy
    const edadActual = calcularEdadExacta(fechaNacimiento);
    
    // Si la edad actual es un número, simplemente le sumamos 1 para su próximo cumpleaños
    if (typeof edadActual === 'number') {
        return edadActual + 1;
    }
    
    return 'N/A';
};
