export const calcularEdadExacta = (fechaNacimiento: string | undefined, edadGuardada?: number): number | string => {
    // Si no hay fecha de nacimiento, usamos la edad que ya estaba en la base de datos
    if (!fechaNacimiento) return edadGuardada ?? 'N/A';
    
    // Separamos la fecha manualmente (YYYY-MM-DD) para evitar errores
    const partes = fechaNacimiento.split('-');
    if (partes.length !== 3) return edadGuardada ?? 'N/A';
    
    const anio = parseInt(partes[0], 10);
    const mes = parseInt(partes[1], 10) - 1; // Los meses en código van de 0 a 11
    const dia = parseInt(partes[2], 10);

    const hoy = new Date();
    const fechaCumple = new Date(anio, mes, dia);
    
    let edad = hoy.getFullYear() - fechaCumple.getFullYear();
    const diferenciaMeses = hoy.getMonth() - fechaCumple.getMonth();
    
    // Si aún no ha llegado su mes o día de cumpleaños, le restamos 1 año
    if (diferenciaMeses < 0 || (diferenciaMeses === 0 && hoy.getDate() < fechaCumple.getDate())) {
        edad--;
    }
    
    // Si por alguna razón el cálculo falla, devolvemos la edad que ya estaba guardada
    return isNaN(edad) ? (edadGuardada ?? 'N/A') : edad;
};

export const formatearFechaLocal = (timestamp: number): string => {
    if (!timestamp) return 'Desconocida';
    return new Date(timestamp).toLocaleDateString('es-SV');
};
