import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Tu configuración web de Firebase V2.0
const firebaseConfig = {
  apiKey: "AIzaSyDcVEtEEzlQzispE7M_Utu7kyH8cZYLV48",
  authDomain: "appebd-ee4de.firebaseapp.com",
  projectId: "appebd-ee4de",
  storageBucket: "appebd-ee4de.firebasestorage.app",
  messagingSenderId: "591252890803",
  appId: "1:591252890803:web:8f3a78d07828306f34fcc6",
  measurementId: "G-V6NZ56D44V"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Exportamos "auth" (para el login) y "db" (para guardar datos)
export const auth = getAuth(app);
export const db = getFirestore(app);
