export const calcularInsigniaTiempoServicio = (fechaInicio: string | undefined) => {
    if (!fechaInicio) return null;

    const hoy = new Date();
    const inicio = new Date(fechaInicio);
    
    let anios = hoy.getFullYear() - inicio.getFullYear();
    let meses = hoy.getMonth() - inicio.getMonth();

    if (meses < 0 || (meses === 0 && hoy.getDate() < inicio.getDate())) {
        anios--;
        meses += 12;
    }

    // Lógica de gamificación: Mientras más años, mejor insignia
    if (anios >= 10) return { icono: '👑', titulo: 'Leyenda de EBD', descripcion: `Más de ${anios} años de servicio ininterrumpido.` };
    if (anios >= 5) return { icono: '🌟', titulo: 'Maestro Veterano', descripcion: `Más de ${anios} años sirviendo con amor.` };
    if (anios >= 1) return { icono: '🛡️', titulo: 'Fiel Servidor', descripcion: `${anios} ${anios === 1 ? 'año' : 'años'} de dedicación.` };
    if (meses >= 6) return { icono: '🔥', titulo: 'Compromiso Firme', descripcion: `Más de 6 meses sirviendo activamente.` };
    
    return { icono: '🌱', titulo: 'Nueva Semilla', descripcion: 'Iniciando su hermoso camino en el ministerio.' };
};
