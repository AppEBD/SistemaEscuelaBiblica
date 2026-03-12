import { create } from 'zustand';
import { Usuario } from '../../../models/types';

interface AuthState {
  usuarioActual: Usuario | null;
  cargando: boolean;
  setUsuario: (usuario: Usuario | null) => void;
  cerrarSesion: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  usuarioActual: null,
  cargando: true, // Empieza en true mientras revisa si hay alguien logueado
  
  setUsuario: (usuario) => set({ usuarioActual: usuario, cargando: false }),
  
  cerrarSesion: () => set({ usuarioActual: null, cargando: false }),
}));
