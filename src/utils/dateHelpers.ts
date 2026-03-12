export const getWeekOfMonth = (year: number, month: number, day: number): number => {
  const firstDayOfMonth = new Date(year, month - 1, 1).getDay(); 
  return Math.ceil((day + firstDayOfMonth) / 7);
};

export const formatFecha = (fechaStr: string): string => {
  if (!fechaStr) return ''; 
  const p = fechaStr.split('-'); 
  if (p.length !== 3) return fechaStr;
  return `${p[2]}/${p[1]}/${p[0]}`; 
};

export const formatFechaDia = (fechaStr: string): string => {
  if (!fechaStr) return '';
  const d = new Date(fechaStr + 'T12:00:00'); 
  const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  return `${dias[d.getDay()]}, ${d.getDate()} ${meses[d.getMonth()]} ${d.getFullYear()}`;
};

export const mesesNombresCompletos = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];
