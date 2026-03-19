import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDcVEtEEzlQzispE7M_Utu7kyH8cZYLV48",
  authDomain: "appebd-ee4de.firebaseapp.com",
  projectId: "appebd-ee4de",
  storageBucket: "appebd-ee4de.firebasestorage.app",
  messagingSenderId: "591252890803",
  appId: "1:591252890803:web:8f3a78d07828306f34fcc6",
  measurementId: "G-V6NZ56D44V"
};

// Inicialización
const app = initializeApp(firebaseConfig);

// Exportamos servicios para el resto de la app
export const db = getFirestore(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
