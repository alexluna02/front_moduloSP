import React from 'react';
import Layout from '../plantilla/plantilla';
import '../seguridad/inicio.css';
import { Link } from 'react-router-dom';
const Inicio = ({ children }) => {
  return (
    <Layout>
      <div className="contenedorindex">
        <aside className="menuindex">
          <h2>Módulo de Seguridad</h2>
          <ul>
           <li> <Link to="/usuarios">Usuarios</Link> </li>
           <li><Link to="/roles">Roles</Link></li>
           <li><Link to="/permisos">Permisos</Link></li>
           <li><Link to="/auditoria">Auditoria</Link></li>
          </ul>
        </aside>

        <main className="contenidoindex">
          {children}
        </main>
      </div>
    </Layout>
  );
};

export default Inicio;
