import { create } from 'zustand';
import { Usuario } from '../../../models/types';

interface AuthState {
  usuarioActual: Usuario | null;
  cargando: boolean;
  setUsuario: (usuario: Usuario | null) => void;
  setCargando: (estado: boolean) => void;
  cerrarSesion: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  usuarioActual: null,
  cargando: true,
  setUsuario: (usuario) => set({ usuarioActual: usuario }),
  setCargando: (estado) => set({ cargando: estado }),
  cerrarSesion: () => set({ usuarioActual: null, cargando: false }),
}));
