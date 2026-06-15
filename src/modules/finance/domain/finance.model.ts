export interface Transaccion {
    id?: string;
    tipo: 'ingreso' | 'retiro';
    monto: number;
    motivo: string;
    descripcion: string;
    fecha: string;
    hora: string; // Agregamos la hora exacta de la transacción
    registradoPor: string;
    createdAt: number;
}
