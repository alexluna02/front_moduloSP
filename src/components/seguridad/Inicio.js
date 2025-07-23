import React from 'react';
import Layout from '../plantilla/plantilla';
import '../seguridad/inicio.css';
import { Link, Outlet } from 'react-router-dom';

const Inicio = () => {
  const permisos = JSON.parse(localStorage.getItem('permisos') || '[]');

  const tienePermiso = (nombre) =>
    permisos.some(p =>
      p.nombre_permiso?.toLowerCase() === nombre.toLowerCase() &&
      p.descripcion?.includes('R')
    );

  return (
    <Layout>
      <div className="contenedorindex">
        <aside className="menuindex">
          <h2>Módulo de Seguridad</h2>
          <ul>
            {tienePermiso('usuarios') && (
              <li><Link to="/usuarios">Usuarios</Link></li>
            )}
            {tienePermiso('roles') && (
              <li><Link to="/roles">Roles</Link></li>
            )}
            {tienePermiso('permisos') && (
              <li><Link to="/permisos">Permisos</Link></li>
            )}
            {tienePermiso('auditoria') && (
              <li><Link to="/auditoria">Auditoría</Link></li>
            )}
          </ul>
        </aside>

        <main className="contenidoindex">
          <Outlet /> {}
        </main>
      </div>
    </Layout>
  );
};

export default Inicio;
