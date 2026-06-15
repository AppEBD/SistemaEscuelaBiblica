export interface Transaccion {
    id?: string;
    tipo: 'ingreso' | 'retiro';
    monto: number;
    motivo: string;
    descripcion: string;
    fecha: string;
    registradoPor: string;
    createdAt: number;
}
