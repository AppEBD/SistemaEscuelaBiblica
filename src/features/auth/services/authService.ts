import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../../config/firebase';
import { Usuario } from '../../../models/types';

export const loginUsuario = async (correo: string, password: string): Promise<{ success: boolean; data?: Usuario; error?: string }> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, correo, password);
    const user = userCredential.user;

    const userDocRef = doc(db, 'usuarios', user.uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const userData = { id: user.uid, ...userDoc.data() } as Usuario;
      return { success: true, data: userData };
    } else {
      await signOut(auth);
      return { success: false, error: 'No se encontró el perfil en el sistema.' };
    }
  } catch (error: any) {
    return { success: false, error: 'Correo o contraseña incorrectos.' };
  }
};

export const logoutUsuario = async () => {
  try {
    await signOut(auth);
    return true;
  } catch (error) {
    return false;
  }
};
