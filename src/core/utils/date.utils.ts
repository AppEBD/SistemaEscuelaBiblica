// ============================================================================
// 1. FÓRMULA PRINCIPAL (Usada por el Admin, Usuarios y la lista de Alumnos)
// ============================================================================
// Calcula la edad exacta que tiene la persona el día de HOY.
export const calcularEdadExacta = (fechaNacimiento: string | undefined, edadGuardada?: number): number | string => {
    // Si no hay fecha, rescata la edad vieja de la base de datos
    if (!fechaNacimiento) return edadGuardada ?? 'N/A';
    
    const partes = fechaNacimiento.split('-');
    if (partes.length !== 3) return edadGuardada ?? 'N/A';
    
    const anio = parseInt(partes[0], 10);
    const mes = parseInt(partes[1], 10) - 1; // Enero es 0 en programación
    const dia = parseInt(partes[2], 10);

    const hoy = new Date();
    const fechaCumple = new Date(anio, mes, dia);
    
    let edad = hoy.getFullYear() - fechaCumple.getFullYear();
    const diferenciaMeses = hoy.getMonth() - fechaCumple.getMonth();
    
    // Si aún no llega la fecha de su cumpleaños este año, restamos 1
    if (diferenciaMeses < 0 || (diferenciaMeses === 0 && hoy.getDate() < fechaCumple.getDate())) {
        edad--;
    }
    
    return isNaN(edad) ? (edadGuardada ?? 'N/A') : edad;
};

// ============================================================================
// 2. FÓRMULA DE FORMATO (Usada por el Admin para ver cuándo se registró)
// ============================================================================
// Convierte el timestamp de Firebase a una fecha bonita de El Salvador
export const formatearFechaLocal = (timestamp: number): string => {
    if (!timestamp) return 'Desconocida';
    return new Date(timestamp).toLocaleDateString('es-SV');
};

// ============================================================================
// 3. FÓRMULA NUEVA PARA CUMPLEAÑOS (Usada en la pestaña de Cumpleaños)
// ============================================================================
// Solo calcula qué edad cumplirá en este año, no importa si ya pasó o no.
export const calcularEdadEsteAnio = (fechaNacimiento: string | undefined): number | string => {
    if (!fechaNacimiento) return 'N/A';
    const anioNacimiento = parseInt(fechaNacimiento.split('-')[0], 10);
    const anioActual = new Date().getFullYear(); // Tomará el año actual (ej. 2026)
    const edad = anioActual - anioNacimiento;
    
    return isNaN(edad) ? 'N/A' : edad;
};
