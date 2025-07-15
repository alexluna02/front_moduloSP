import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import UserList from './components/usuarios/UserList';
import RoleForm from './components/Roles/RoleForm';
import Inicio from './components/seguridad/Inicio';
import Login from './components/Loginp/Login';

import PermisosList from './components/permisos/permiso';
import AuditList from './components/auditoria/auditoria';
import './App.css'; 

function App() {
  return (
    <Router>

      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="*"
          element={
            <Inicio>
              <Routes>
                <Route path="/usuarios" element={<UserList />} />
                <Route path="/roles" element={<RoleForm />} />
                <Route path="/inicio" element={<Inicio />} />
                <Route path="/permisos" element={<PermisosList />} />
                <Route path="/auditoria" element={<AuditList />} />
              </Routes>
            </Inicio>
          }
        />
      </Routes>
    </Router>
  );
}
export default App;

