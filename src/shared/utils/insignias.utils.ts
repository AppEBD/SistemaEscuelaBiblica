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

    // Texto dinámico que muestra exactamente los años o meses reales
    const tiempoExacto = anios > 0 
        ? `${anios} ${anios === 1 ? 'año' : 'años'}` 
        : `${meses} ${meses === 1 ? 'mes' : 'meses'}`;

    // Lógica de gamificación
    if (anios >= 10) return { icono: '👑', titulo: 'Leyenda de EBD', descripcion: `${tiempoExacto} de servicio ininterrumpido.` };
    if (anios >= 5) return { icono: '🌟', titulo: 'Maestro Veterano', descripcion: `${tiempoExacto} sirviendo con amor.` };
    if (anios >= 1) return { icono: '🛡️', titulo: 'Fiel Servidor', descripcion: `${tiempoExacto} de dedicación.` };
    if (meses >= 6) return { icono: '🔥', titulo: 'Compromiso Firme', descripcion: `${tiempoExacto} sirviendo activamente.` };
    
    return { icono: '🌱', titulo: 'Nueva Semilla', descripcion: 'Iniciando su hermoso camino en el ministerio.' };
};
