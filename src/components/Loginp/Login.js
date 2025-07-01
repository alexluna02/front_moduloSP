import React, { useState } from 'react';
import './login.css'; // Asegúrate de tener este archivo

function Login() {
  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [modulo, setModulo] = useState('');
  const [mensaje, setMensaje] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje('');

    try {
      const response = await fetch('https://modulo-seguridad.onrender.com/api/usuarios/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario, contrasena }), // El backend no requiere módulo
      });

      const data = await response.json();

      if (response.ok) {
        setMensaje('Login exitoso');
        localStorage.setItem('modulo', modulo);
        localStorage.setItem('usuario', usuario);

        // Redirección según el módulo
        switch (modulo) {
          case 'ventas':
            window.location.href = '/ventas';
            break;
          case 'compras':
            window.location.href = '/compras';
            break;
          case 'cuentas':
            window.location.href = '/cuentas';
            break;
          case 'inventario':
            window.location.href = '/inventario';
            break;
          default:
            setMensaje('Módulo no reconocido');
        }
      } else {
        setMensaje(data.message || 'Usuario o contraseña incorrectos');
      }
    } catch (error) {
      setMensaje('Error de conexión');
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
              placeholder="usuario"
              value={usuario}
              onChange={e => setUsuario(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label>Contraseña</label>
            <input
              type="password"
              placeholder="••••••••"
              value={contrasena}
              onChange={e => setContrasena(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>Selecciona el Módulo</label>
            <select value={modulo} onChange={(e) => setModulo(e.target.value)} required>
              <option value="">-- Selecciona un módulo --</option>
              <option value="ventas">Ventas</option>
              <option value="compras">Compras</option>
              <option value="cuentas">Cuentas por Cobrar</option>
              <option value="inventario">Inventario</option>
            </select>
          </div>

          <button type="submit">Iniciar Sesión</button>

          {mensaje && <p className="message">{mensaje}</p>}
        </form>

        <p className="secure-note">Conexión segura protegida con SSL</p>
        <p className="footer">© 2025 Sistema de Seguridad. Todos los derechos reservados.</p>
      </div>
    </div>
  );
}

export default Login;
