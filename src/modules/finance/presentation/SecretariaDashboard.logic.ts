import { useState, useEffect } from 'react';
import { getAuth, signOut } from 'firebase/auth'; 
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../../core/firebase/firebase.config';
import { useAuth } from '../../auth/application/useAuth';

export const useSecretariaLogic = () => {
    const { userData, logout } = useAuth(); 
    const [insigniasGlobales, setInsigniasGlobales] = useState<any[]>([]);

    // Pestañas y estados de UI
    const [mainTab, setMainTab] = useState<'home' | 'reportes' | 'documentos'>('home');
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    
    // Sistema de Temas (Reutilizado del Maestro)
    const [appTheme, setAppTheme] = useState<'indigo' | 'emerald' | 'rose' | 'amber'>(() => {
        return (localStorage.getItem('ebd_theme_v2') as any) || 'indigo';
    });

    useEffect(() => { 
        localStorage.setItem('ebd_theme_v2', appTheme); 
    }, [appTheme]);

    const cerrarSesionApp = () => {
        if (window.confirm("¿Estás seguro de que deseas cerrar sesión?")) {
            if (logout) { 
                logout(); 
            } else { 
                const auth = getAuth(); 
                signOut(auth).then(() => window.location.reload()); 
            }
        }
    };

    // Descargar las insignias globales creadas por el admin
    useEffect(() => {
        const unsubInsignias = onSnapshot(collection(db, 'insignias_creadas'), (snap) => {
            setInsigniasGlobales(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });
        
        return () => { unsubInsignias(); };
    }, []);

    return {
        userData,
        isProfileOpen, setIsProfileOpen,
        appTheme, setAppTheme,
        cerrarSesionApp,
        mainTab, setMainTab,
        insigniasGlobales
    };
};
