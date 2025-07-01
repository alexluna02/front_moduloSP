// src/components/Layout.jsx
import React, { useState } from 'react';
import '../plantilla/plantilla.css'; // Tus estilos generales
import '../plantilla/menu.css'; // Nuevo archivo de estilos para el menú

const Layout = ({ children }) => {
  const [showMenu, setShowMenu] = useState(false);

  const toggleMenu = () => {
    setShowMenu(prev => !prev);
  };

  return (
    <div className="layout-container">
      <header className="header">
        <div className="logo-container">
          <img src="/logo01.png" alt="snovit logo" className="logo" />
          <div className="brand-text">
            <h1>Supermercado API</h1>
            <p>Productos de calidad</p>
          </div>
        </div>

        <nav className="navbar">
          <div className="profile-container">
            <button className="action-btn" onClick={toggleMenu}>
              <i className="fas fa-user-astronaut"></i>
            </button>

            {showMenu && (
              <div className="dropdown-menu">
                <div className="user-section">
                  <strong>Alex Luna</strong>
                </div>
                <ul>
                  <li><i className="fas fa-sign-out-alt"></i> Cerrar sesión</li>
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
