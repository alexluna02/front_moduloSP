import React, { useEffect, useState } from 'react';

function Login() {
  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loginStyles = document.createElement('link');
    loginStyles.rel = 'stylesheet';
    loginStyles.href = '/login.css';
    document.head.appendChild(loginStyles);
    return () => {
      document.head.removeChild(loginStyles);
    };
  }, []);

  const handleLoginError = async (response) => {
    let data;
    try {
      data = await response.json();
    } catch {
      const text = await response.text();
      if (response.status === 401) {
        return text.includes('Usuario o contraseña incorrectos')
          ? 'El usuario no existe o la contraseña es incorrecta'
          : 'Error de autenticación';
      }
      return 'Error en el formato de la respuesta del servidor';
    }

    if (response.status === 401) {
      return data.mensaje && data.mensaje.includes('Usuario o contraseña incorrectos')
        ? 'El usuario no existe o la contraseña es incorrecta'
        : 'Error de autenticación';
    }
    return data.mensaje || 'Error desconocido en el servidor';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje('');
    setIsLoading(true);

    if (!usuario || !contrasena) {
      setMensaje('Por favor, completa los campos de usuario y contraseña');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/usuarios/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario, contrasena, id_modulo: 'SEG' }),
      });

      if (response.ok) {
        const data = await response.json();

        if (!data.token) {
          setMensaje('No se recibió token de autenticación');
          setIsLoading(false);
          return;
        }

        // Guardar token y usuario
        localStorage.setItem('token', data.token);
        localStorage.setItem('usuario', JSON.stringify(data.usuario || { usuario }));

        setMensaje('Login exitoso');

        // Redirigir a inicio u otra ruta protegida
        window.location.href = 'http://localhost:3001/';
      } else {
        const errorMsg = await handleLoginError(response);
        setMensaje(errorMsg);
      }
    } catch (error) {
      console.error('Error en el login:', error);
      setMensaje('Error de conexión o servidor');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Sistema de Seguridad</h2>
        <p>Acceso para administradores</p>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Usuario</label>
            <input
              type="text"
              placeholder="Ingresa tu usuario"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value.trim())}
              required
              disabled={isLoading}
            />
          </div>
          <div className="input-group">
            <label>Contraseña</label>
            <input
              type="password"
              placeholder="••••••••"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Cargando...' : 'Iniciar Sesión'}
          </button>
          {mensaje && (
            <p className={mensaje.toLowerCase().includes('exitoso') ? 'message success' : 'message error'}>
              {mensaje}
            </p>
          )}
        </form>
        <p className="secure-note">Conexión segura protegida con SSL</p>
        <p className="footer">© 2025 Sistema de Seguridad. Todos los derechos reservados.</p>
      </div>
    </div>
  );
}

export default Login;
