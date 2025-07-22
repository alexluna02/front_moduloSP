import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEdit, FaTrash, FaInfoCircle, FaSearch, FaLock } from 'react-icons/fa';
import { Button, Table, Spin, Modal, Input, Form, Select, Checkbox, List } from 'antd';
import CustomAlert from '../Alert.js';
import { validarAutorizacion } from '../utils/authUtils';
import './RoleAdmin.css';

const { Option } = Select;

// API Functions
export const listarRoles = async () => {
  try {
    const res = await fetch('/api/roles', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Error del servidor: ${res.status} - ${text}`);
    }
    const json = await res.json();
    if (!json.data || !Array.isArray(json.data)) {
      throw new Error('Formato de respuesta inválido. No se encontró un array en "data".');
    }
    return json.data;
  } catch (err) {
    console.error('Error al cargar roles:', err);
    throw err;
  }
};

export const crearRol = async (roleData) => {
  try {
    const res = await fetch('/api/roles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(roleData),
    });
    if (!res.ok) {
      throw new Error('Error en la respuesta del servidor');
    }
    const data = await res.json();
    return { success: true, data };
  } catch (error) {
    console.error('Error al crear el rol:', error);
    return { success: false, error };
  }
};

export const listarPermisos = async () => {
  try {
    const res = await fetch('/api/permisos', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Error del servidor: ${res.status} - ${text}`);
    }
    const json = await res.json();
    if (!json.data || !Array.isArray(json.data)) {
      throw new Error('Formato de respuesta inválido. No se encontró un array en "data".');
    }
    return json.data;
  } catch (err) {
    console.error('Error al cargar permisos:', err);
    throw err;
  }
};

export const asignarPermisosRol = async (roleId, permisos) => {
  try {
    const res = await fetch(`/api/roles_permisos/roles/${roleId}/permisos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ permisos }),
    });
    if (!res.ok) {
      throw new Error('Error al asignar permisos');
    }
    const data = await res.json();
    return { success: true, data };
  } catch (error) {
    console.error('Error al asignar permisos:', error);
    return { success: false, error };
  }
};

const RoleAdmin = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [estado, setEstado] = useState(true);
  const [roles, setRoles] = useState([]);
  const [editingRoleId, setEditingRoleId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPermisosModalOpen, setIsPermisosModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ type: '', message: '', description: '' });
  const [searchText, setSearchText] = useState('');
  const [permisos, setPermisos] = useState([]);
  const [selectedPermisos, setSelectedPermisos] = useState([]);
  const [loadingPermisos, setLoadingPermisos] = useState(false);
  const [permisoRoles, setPermisoRoles] = useState(null);
  const [detalleVisible, setDetalleVisible] = useState(false);
  const [detalleRol, setDetalleRol] = useState(null);
  const [detallePermisos, setDetallePermisos] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Check authentication
  useEffect(() => {
    const checkToken = async () => {
      const { valido } = await validarAutorizacion();
      if (!valido) {
        navigate('/login');
      }
    };
    checkToken();
  }, [navigate]);

  // Fetch roles and permissions
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [rolesData, permisosData] = await Promise.all([listarRoles(), listarPermisos()]);
        setRoles(rolesData);
        setPermisos(permisosData);
        const permiso = permisosData.find(p => p.nombre_permiso?.toLowerCase() === 'roles');
        setPermisoRoles(permiso);
      } catch (err) {
        setAlert({
          type: 'error',
          message: '¡Operación fallida!',
          description: 'Error al cargar roles o permisos.',
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Handlers
  const handleSubmit = async (values) => {
    setLoading(true);
    const roleData = { nombre_rol: values.nombreRol, descripcion: values.descripcion, estado };
    try {
      if (editingRoleId) {
        const res = await fetch(`/api/roles/${editingRoleId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(roleData),
        });
        if (!res.ok) throw new Error('Error al actualizar el rol');
        setAlert({
          type: 'success',
          message: '¡Operación exitosa!',
          description: 'El rol fue actualizado correctamente.',
        });
      } else {
        const { success, data } = await crearRol(roleData);
        if (!success) throw new Error('Error al crear el rol');
        setEditingRoleId(data.id_rol);
        setAlert({
          type: 'success',
          message: '¡Operación exitosa!',
          description: 'El rol fue creado correctamente.',
        });
      }
      form.resetFields();
      setIsModalOpen(false);
      setRoles(await listarRoles());
    } catch (error) {
      setAlert({
        type: 'error',
        message: '¡Operación fallida!',
        description: 'Error en la operación del rol.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePermisosSubmit = async () => {
    if (!editingRoleId) {
      setIsPermisosModalOpen(false);
      return;
    }
    setLoading(true);
    try {
      const { success } = await asignarPermisosRol(editingRoleId, selectedPermisos);
      if (!success) throw new Error('Error al asignar permisos');
      setAlert({
        type: 'success',
        message: '¡Operación exitosa!',
        description: 'Los permisos fueron asignados correctamente.',
      });
      setIsPermisosModalOpen(false);
      setSelectedPermisos([]);
      setRoles(await listarRoles());
    } catch (error) {
      setAlert({
        type: 'error',
        message: '¡Operación fallida!',
        description: 'Error al asignar permisos.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este rol?')) {
      try {
        const res = await fetch(`/api/roles/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!res.ok) throw new Error('Error al eliminar el rol');
        setAlert({
          type: 'success',
          message: '¡Operación exitosa!',
          description: 'El rol fue eliminado correctamente.',
        });
        setRoles(await listarRoles());
      } catch (error) {
        setAlert({
          type: 'error',
          message: '¡Operación fallida!',
          description: 'Error al eliminar el rol.',
        });
      }
    }
  };

  const handleEdit = async (role) => {
    setEditingRoleId(role.id_rol);
    form.setFieldsValue({ nombreRol: role.nombre_rol, descripcion: role.descripcion });
    setEstado(role.estado);
    setIsModalOpen(true);
    setLoadingPermisos(true);
    try {
      const res = await fetch(`/api/roles_permisos/roles/${role.id_rol}/permisos`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedPermisos(data.map(p => p.id_permiso));
      } else {
        setSelectedPermisos([]);
      }
    } catch (e) {
      console.error('Error al cargar permisos:', e);
      setSelectedPermisos([]);
    } finally {
      setLoadingPermisos(false);
    }
  };

  const handleDetails = async (role) => {
    setDetalleRol(role);
    setDetallePermisos([]);
    setDetalleVisible(true);
    setLoadingPermisos(true);
    try {
      const res = await fetch(`/api/roles_permisos/roles/${role.id_rol}/permisos`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDetallePermisos(data);
      } else {
        setDetallePermisos([]);
      }
    } catch (e) {
      console.error('Error al cargar permisos:', e);
      setDetallePermisos([]);
    } finally {
      setLoadingPermisos(false);
    }
  };

  // Modal Handlers
  const openModal = () => {
    setEditingRoleId(null);
    form.resetFields();
    setEstado(true);
    setSelectedPermisos([]);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingRoleId(null);
    form.resetFields();
    setSelectedPermisos([]);
  };

  const openPermisosModal = () => {
    if (!editingRoleId) {
      setSelectedPermisos([]);
    }
    setIsPermisosModalOpen(true);
  };

  const closePermisosModal = () => {
    setIsPermisosModalOpen(false);
  };

  // Permissions Check
  //const puedeLeer = permisoRoles?.descripcion?.includes('R') || false;
  const puedeCrear = permisoRoles?.descripcion?.includes('C') || false;
  const puedeEditar = permisoRoles?.descripcion?.includes('U') || false;
  const puedeEliminar = permisoRoles?.descripcion?.includes('D') || false;

  // Filtered Roles
  const filteredRoles = roles.filter(item =>
    Object.values(item).some(value =>
      String(value).toLowerCase().includes(searchText.toLowerCase())
    )
  );

  // Table Columns
  const columns = [
    {
  title: 'Acciones',
  key: 'acciones',
  render: (_, role) => (
    <div className="flex space-x-2">
      {puedeEditar && (
        <Button
          icon={<FaEdit />}
          onClick={() => handleEdit(role)}
          className="role-action-btn edit"
        />
      )}
      {puedeEliminar && (
        <Button
          icon={<FaTrash />}
          onClick={() => handleDelete(role.id_rol)}
          className="role-action-btn delete"
        />
      )}
    </div>
  ),
},

    {
      title: 'ID',
      dataIndex: 'id_rol',
      key: 'id_rol',
      sorter: (a, b) => a.id_rol - b.id_rol,
    },
    {
      title: 'Roles',
      dataIndex: 'nombre_rol',
      key: 'nombre_rol',
      sorter: (a, b) => a.nombre_rol.localeCompare(b.nombre_rol),
    },
    {
      title: 'Descripción',
      dataIndex: 'descripcion',
      key: 'descripcion',
      sorter: (a, b) => a.descripcion.localeCompare(b.descripcion),
    },
    {
      title: 'Detalles',
      key: 'detalles',
      render: (_, role) => (
        <Button
          icon={<FaInfoCircle />}
          onClick={() => handleDetails(role)}
          className="flex items-center text-blue-600 hover:bg-blue-50"
        >
          Ver
        </Button>
      ),
    },
    {
  title: 'Estado',
  dataIndex: 'estado',
  key: 'estado',
  render: estado => (
    <span className={`role-status ${estado ? 'active' : 'inactive'}`}>
      {estado ? 'Activo' : 'Inactivo'}
    </span>
  ),
}

  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Lista de Roles</h2>

      <CustomAlert
        type={alert.type}
        message={alert.message}
        description={alert.description}
        onClose={() => setAlert({ type: '', message: '', description: '' })}
      />

      <div className="flex justify-between items-center mb-6">
        {puedeCrear && (
          <Button
            type="primary"
            onClick={openModal}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
          >
            Crear
          </Button>
        )}
        <Input
          placeholder="Buscar..."
          prefix={<FaSearch className="text-gray-400" />}
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          className="w-64 rounded-lg border-gray-300 focus:border-blue-500"
        />
      </div>

      <Table
        dataSource={filteredRoles}
        columns={columns}
        rowKey="id_rol"
        loading={loading}
        pagination={{
          current: currentPage,
          pageSize,
          total: roles.length,
          onChange: (page, pageSize) => {
            setCurrentPage(page);
            setPageSize(pageSize);
          },
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '30', '50'],
          showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} elementos`,
        }}
        className="bg-white shadow-md rounded-lg"
      />

      <Modal
        title={editingRoleId ? 'Editar Rol' : 'Crear Nuevo Rol'}
        open={isModalOpen}
        onCancel={closeModal}
        footer={null}
        destroyOnClose
        className="rounded-lg"
      >
        <Spin spinning={loading} tip="Guardando...">
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Form.Item
              label="Nombre del Rol"
              name="nombreRol"
              rules={[
                { required: true, message: 'El nombre es obligatorio' },
                { pattern: /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/, message: 'Solo se permiten letras y espacios' },
              ]}
            >
              <Input
                placeholder="Ingresa el nombre del rol"
                className="w-full rounded-lg border-gray-300 focus:border-blue-500"
              />
            </Form.Item>

            <Form.Item label="Descripción" name="descripcion">
              <Input.TextArea
                placeholder="Ingresa una descripción (opcional)"
                className="w-full rounded-lg border-gray-300 focus:border-blue-500"
              />
            </Form.Item>

            <Form.Item label="Estado">
              <Select
                value={estado}
                onChange={value => setEstado(value)}
                className="w-full rounded-lg"
              >
                <Option value={true}>Activo</Option>
                <Option value={false}>Inactivo</Option>
              </Select>
            </Form.Item>

            <div className="flex justify-between items-center">
              <Button
                icon={<FaLock />}
                onClick={openPermisosModal}
                disabled={!editingRoleId && !form.getFieldValue('nombreRol')}
                className="flex items-center text-blue-600 hover:bg-blue-50"
              >
                Permisos
              </Button>
              <div className="flex gap-2">
                <Button
                  onClick={closeModal}
                  className="border-gray-300 hover:bg-gray-100"
                >
                  Cancelar
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {editingRoleId ? 'Guardar' : 'Crear'}
                </Button>
              </div>
            </div>
          </Form>
        </Spin>
      </Modal>

      <Modal
        title="Asignar Permisos"
        open={isPermisosModalOpen}
        onCancel={closePermisosModal}
        footer={[
          <Button
            key="cancel"
            onClick={closePermisosModal}
            className="border-gray-300 hover:bg-gray-100"
          >
            Cancelar
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={handlePermisosSubmit}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Guardar
          </Button>,
        ]}
        destroyOnClose
        className="rounded-lg"
      >
        <Spin spinning={loadingPermisos} tip="Cargando permisos...">
          <List
            dataSource={permisos}
            renderItem={permiso => (
              <List.Item>
                <Checkbox
                  checked={selectedPermisos.includes(permiso.id_permiso)}
                  onChange={e => {
                    setSelectedPermisos(prev =>
                      e.target.checked
                        ? [...prev, permiso.id_permiso]
                        : prev.filter(id => id !== permiso.id_permiso)
                    );
                  }}
                >
                  {permiso.nombre_permiso} ({permiso.nombre_modulo})
                </Checkbox>
              </List.Item>
            )}
          />
        </Spin>
      </Modal>

      <Modal
        title="Detalles del Rol"
        open={detalleVisible}
        onCancel={() => setDetalleVisible(false)}
        footer={null}
        className="rounded-lg"
      >
        {detalleRol && (
          <div className="space-y-4">
            <p><strong>ID:</strong> {detalleRol.id_rol}</p>
            <p><strong>Nombre:</strong> {detalleRol.nombre_rol}</p>
            <p><strong>Descripción:</strong> {detalleRol.descripcion || 'Sin descripción'}</p>
            <p><strong>Estado:</strong> {detalleRol.estado ? 'Activo' : 'Inactivo'}</p>
            <div className="mt-4">
              <strong>Permisos asociados:</strong>
              {loadingPermisos ? (
                <p>Cargando permisos...</p>
              ) : detallePermisos.length > 0 ? (
                <Table
                  dataSource={detallePermisos}
                  columns={[
                    { title: 'Permiso', dataIndex: 'nombre_permiso', key: 'nombre_permiso' },
                    { title: 'Módulo', dataIndex: 'nombre_modulo', key: 'nombre_modulo' },
                  ]}
                  pagination={false}
                  rowKey="id_permiso"
                  className="bg-white shadow-md rounded-lg"
                />
              ) : (
                <p>No hay permisos asociados.</p>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default RoleAdmin;