import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserAstronaut, FaSignOutAlt } from 'react-icons/fa'; // <--- Íconos modernos
import '../plantilla/plantilla.css'; 
import '../plantilla/menu.css';

const Layout = ({ children }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [usuario, setUsuario] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const usuarioGuardado = localStorage.getItem('usuario');
    if (usuarioGuardado) {
      setUsuario(JSON.parse(usuarioGuardado));
    }
  }, []);

  const toggleMenu = () => {
    setShowMenu(prev => !prev);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    navigate('/login');
  };

  return (
    <div className="layout-container">
      <header className="header">
        <div className="logo-container">
          <img src="/logo002.png" alt="snovit logo" className="logo" />
          <div className="brand-text">
            <h1>Apliaciones Distribuidas</h1>
            <p>Security</p>
          </div>
        </div>

        <nav className="navbar">
          <div className="profile-container">
            <button className="action-btn" onClick={toggleMenu}>
              <FaUserAstronaut size={20} />
            </button>

            {showMenu && (
              <div className="dropdown-menu">
                <div className="user-section">
                  <strong>{usuario ? usuario.nombre : 'Invitado'}</strong>
                </div>
                <ul>
                  <li 
                    onClick={handleLogout} 
                    className="logout-btn"
                  >
                    <FaSignOutAlt style={{ marginRight: '8px' }} />
                    Cerrar sesión
                  </li>
                </ul>
              </div>
            )}
          </div>
        </nav>
      </header>

      <main className="main-content">{children}</main>

      <footer className="footer">
        <p>© 2025 Mi Empresa</p>
      </footer>
    </div>
  );
};

export default Layout;
