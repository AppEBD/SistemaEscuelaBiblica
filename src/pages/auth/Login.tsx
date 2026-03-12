const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const keys: Record<string, string> = {
      'Administrador / Director': '1234', 'Maestro': '2222', 'Auxiliar': '3333',
      'Logística': '4444', 'Tesorero': '5555', 'Secretaria': '8888'
    };

    if (formData.password === keys[formData.role]) {
      if (rememberMe) {
        localStorage.setItem('ebd_v2_remember', JSON.stringify(formData));
      } else {
        localStorage.removeItem('ebd_v2_remember');
      }

      // CORRECCIÓN AQUÍ: Evitamos que la diagonal "/" rompa Firebase
      const cleanRole = formData.role.replace(/[^a-zA-Z0-9]/g, '');
      const cleanName = formData.username.replace(/[^a-zA-Z0-9]/g, '');
      const userId = `${cleanRole}-${cleanName}`.toLowerCase();
      
      const isDir = formData.role === 'Administrador / Director';
      const newUser = { 
        ...formData, 
        id: userId,
        status: isDir ? 'approved' : 'pending' 
      };
      
      try {
        // Guardar en Firebase
        await setDoc(doc(db, 'users', userId), newUser);
        
        // Guardar localmente
        localStorage.setItem('ebd_v2_session', JSON.stringify(newUser));

        if (isDir) {
          // Si es director, recarga para ir directo al Dashboard
          window.location.reload();
        } else {
          // Si es otro, bloquea la pantalla en gris
          setIsLocked(true);
        }
      } catch (error) {
        alert("Error al conectar con la base de datos. Verifica tu Firebase.");
        console.error(error);
      }
      
    } else {
      alert("La contraseña no coincide con el cargo seleccionado.");
    }
  };
