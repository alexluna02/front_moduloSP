// src/App.jsx
import React from 'react';
//import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import UserList from './components/usuarios/UserList';
import RoleForm from './components/Roles/RoleForm';
import Inicio from './components/seguridad/Inicio';
import Login from './components/Loginp/Login';
import PermisosList from './components/permisos/permiso';
import AuditList from './components/auditoria/auditoria';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />

        {/* Rutas protegidas bajo el layout Inicio */}
        <Route element={<Inicio />}>
          <Route path="/usuarios" element={<UserList />} />
          <Route path="/roles" element={<RoleForm />} />
          <Route path="/inicio" element={<Inicio />} />
          <Route path="/permisos" element={<PermisosList />} />
          <Route path="/auditoria" element={<AuditList />} />
        </Route>

        {/* Ruta por defecto (catch-all) */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App; // 👈 ESTA LÍNEA es muy importante
