import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './usuario.css';
import { Table, Button, Input, Modal, Form, Select, Spin, Alert, Tag } from 'antd';
import { FaSearch, FaEdit, FaTrash, FaUserPlus } from 'react-icons/fa';
import '@ant-design/icons';
import CustomAlert from '../Alert';
import { listarRoles, crearRol } from '../Roles/RoleForm';
import { useNavigate } from 'react-router-dom';
import { validarAutorizacion } from '../utils/authUtils'; 

const { Option } = Select;
const API_URL = 'https://aplicacion-de-seguridad-v2.onrender.com/api';

const UserList = () => {

  
  const navigate = useNavigate();

  useEffect(() => {
    const checkToken = async () => {
      const { valido } = await validarAutorizacion();
      if (!valido) {
        navigate('/login');
      }
    };
    checkToken();
  }, [navigate]);

  const [users, setUsers] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [alert, setAlert] = useState({ type: '', message: '', description: '' });
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form] = Form.useForm();
  const [formRol] = Form.useForm();
  const [roles, setRoles] = useState([]);
  const [estado, setEstado] = useState(true);
  const [isRolModalOpen, setIsRolModalOpen] = useState(false);
  const [originalRoles, setOriginalRoles] = useState([]);
  const [visible, setVisible] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);

  const cerrarModal = () => {
    setVisible(false);
    setUsuarioSeleccionado(null);
  };

 const obtenerRolesUsuario = async (id_usuario) => {
  try {
    const res = await axios.get(`${API_URL}/usuarios_roles/${id_usuario}`);
    const roles = res.data.data;  // <-- extraer el array roles dentro de data
    return Array.isArray(roles) ? roles : [];
  } catch (error) {
    console.error('Error al obtener roles del usuario:', error);
    return [];
  }
};


  
  


 const mostrarModal = async (record) => {
  const roles = await obtenerRolesUsuario(record.id_usuario);

  setUsuarioSeleccionado({
    ...record,
    roles: roles // solo roles, sin permisos
  });

  setVisible(true);
};


  // Obtener usuarios
  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_URL}/usuarios`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      // Asegurarse de asignar solo el array dentro de data
      if (res.data && Array.isArray(res.data.data)) {
        setUsers(res.data.data);
      } else {
        console.error('La respuesta no contiene un array en data:', res.data);
        setUsers([]);
      }
    } catch (error) {
      setAlert({
        type: 'error',
        message: 'Error al cargar usuarios',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  // Obtener permisos desde localStorage
  const permisos = JSON.parse(localStorage.getItem('permisos') || '[]');
  const permisoUsuarios = permisos.find(p => p.nombre_permiso?.toLowerCase() === 'usuarios');
  //const puedeLeer = permisoUsuarios?.descripcion.includes('R');
  const puedeCrear = permisoUsuarios?.descripcion.includes('C');
  const puedeEditar = permisoUsuarios?.descripcion.includes('U');
  const puedeEliminar = permisoUsuarios?.descripcion.includes('D');

  useEffect(() => {
    fetchUsers();
    listarRoles()
      .then((data) => {
        setRoles(data);
      })
      .catch(() => {
        setAlert({
          type: 'error',
          message: '¡Operación fallida!',
          description: 'Error al cargar roles.',
        });
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

    useEffect(() => {
        if (alert.message) {
            const timer = setTimeout(() => {
                setAlert({ type: '', message: '', description: '' });
            }, 4000);

            return () => clearTimeout(timer);
        }
    }, [alert]);

  // Filtrar búsqueda
  const filteredUsers = Array.isArray(users) ? users.filter((u) =>
    ['usuario', 'id_usuario', 'nombre'].some((field) =>
      String(u[field]).toLowerCase().includes(searchText.toLowerCase())
    )
  ) : [];

  const handleCrearRol = async () => {
    try {
      setLoading(true);
      const values = await formRol.validateFields();
      const resultado = await crearRol(values);

      if (resultado.success) {
        setAlert({
          type: 'success',
          message: '¡Operación exitosa!',
          description: 'El rol fue creado correctamente.',
        });
        listarRoles()
          .then((data) => {
            setRoles(data);
          });
        setIsRolModalOpen(false);
        formRol.resetFields();
      } else {
        throw new Error('Error en la creación del rol');
      }
    } catch (error) {
      setAlert({
        type: 'error',
        message: '¡Operación fallida!',
        description: 'No se pudo crear el rol.',
      });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este usuario?')) {
      setLoading(true);
      try {
        await axios.delete(`${API_URL}/usuarios/${id}`);
        setAlert({
          type: 'success',
          message: 'Usuario eliminado',
          description: 'El usuario ha sido eliminado correctamente.',
        });
        fetchUsers();
      } catch (error) {
        setAlert({
          type: 'error',
          message: 'Error al eliminar usuario',
          description: error.message,
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const openModal = async (user = null) => {
    setEditingUser(user);
    if (user) {
      const rolesUsuario = await obtenerRolesUsuario(user.id_usuario);
      const rolesIds = Array.isArray(rolesUsuario) ? rolesUsuario.map(r => r.id_rol) : [];
      setOriginalRoles(rolesIds);
      form.setFieldsValue({
        usuario: user.usuario,
        contrasena: user.contrasena,
        nombre: user.nombre,
        estado: user.estado,
        rol: rolesIds,
      });
    } else {
      form.resetFields();
      setOriginalRoles([]);
    }
    setModalOpen(true);
  };

  const handleModalSubmit = async () => {
    try {
      
      const values = await form.validateFields();
      values.estado = values.estado === 'true' || values.estado === true;
      const newRoles = Array.isArray(values.rol) ? values.rol : [];
      const removedRoles = originalRoles.filter(id => !newRoles.includes(id));
      const addedRoles = newRoles.filter(id => !originalRoles.includes(id));
      
      setLoading(true);

      if (editingUser) {
        await axios.put(`${API_URL}/usuarios/${editingUser.id_usuario}`, values);
        await Promise.all(
          removedRoles.map(id_rol =>
            axios.delete(`${API_URL}/usuarios_roles`, {
              data: { id_usuario: editingUser.id_usuario, id_rol }
            })
          )
        );
        await Promise.all(
          addedRoles.map(id_rol =>
            axios.post(`${API_URL}/usuarios_roles`, {
              id_usuario: editingUser.id_usuario,
              id_rol
            })
          )
        );
        setAlert({
          type: 'success',
          message: 'Usuario actualizado',
          description: 'Los datos del usuario fueron actualizados correctamente.',
        });
      } else {
        const res = await axios.post(`${API_URL}/usuarios`, values);
          const id_usuario = res.data.data.id_usuario;
        await Promise.all(
          values.rol.map(id_rol =>
            axios.post(`${API_URL}/usuarios_roles`, {
              id_usuario,
              id_rol,
            })
          )
        );
        form.resetFields();
        setModalOpen(false);
        setAlert({
          type: 'success',
          message: 'Usuario creado',
          description: 'Nuevo usuario agregado correctamente.',
        });
      }

      fetchUsers();
      setModalOpen(false);
    } catch (error) {
      setAlert({
        type: 'error',
        message: 'Error al guardar usuario',
        description: error.response?.data?.message || error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Acciones',
      key: 'acciones',
      render: (_, record) => (
        <>
          {puedeEditar && (
            <Button
              icon={<FaEdit />}
              onClick={() => openModal(record)}
              style={{ marginRight: 8 }}
            />
          )}
          {puedeEliminar && (
            <Button
              icon={<FaTrash />}
              danger
              onClick={() => handleDelete(record.id_usuario)}
            />
          )}
        </>
      ),
    },
    {
      title: 'ID',
      dataIndex: 'id_usuario',
      key: 'id_usuario',
      render: (id) => `#${id.toString().padStart(3, '0')}`,
      sorter: (a, b) => a.id_usuario - b.id_usuario,
    },
    {
      title: 'Usuario',
      dataIndex: 'usuario',
      key: 'usuario',
      sorter: (a, b) => a.usuario.localeCompare(b.usuario),
      sortDirection: ['ascend', 'descend'],
    },
    {
      title: 'Nombre',
      dataIndex: 'nombre',
      key: 'nombre',
      sorter: (a, b) => a.nombre.localeCompare(b.nombre),
      sortDirection: ['ascend', 'descend'],
    },
    {
      title: 'Estado',
      dataIndex: 'estado',
      key: 'estado',
      render: (estado) => (
        <span className={estado ? 'status active' : 'status inactive'}>
          {estado ? 'Activo' : 'Inactivo'}
        </span>
      ),
      sorter: (a, b) => a.estado - b.estado,
    },
    {
      title: 'Detalles',
      render: (_, record) => (
        <Button type="link" onClick={() => mostrarModal(record)}>
          Expandir
        </Button>
      ),
    },
    {
      title: 'Fecha Creación',
      dataIndex: 'fecha_creacion',
      key: 'fecha_creacion',
      render: (fecha) => new Date(fecha).toLocaleString(),
      sorter: (a, b) => new Date(a.fecha_creacion) - new Date(b.fecha_creacion),
    },
  ];

  return (
    <div style={{ padding: 20 }}>
      <h2>Administra los usuarios del sistema</h2>

      <CustomAlert
        type={alert.type}
        message={alert.message}
        description={alert.description}
        onClose={() => setAlert({ type: '', message: '', description: '' })}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ marginLeft: 10 }}>
          {puedeCrear && (
            <Button type="primary" icon={<FaUserPlus />} onClick={() => openModal()} className="fixed-primary-button">
              Nuevo Usuario
            </Button>
          )}
        </div>

        <div style={{ marginRight: 10 }}>
          <Input
            placeholder="Buscar..."
            prefix={<FaSearch />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
        </div>
      </div>

      <Table
        dataSource={filteredUsers}
        columns={columns}
        rowKey="id_usuario"
        loading={loading}
        pagination={{ showSizeChanger: true }}
      />

          <Modal
  title={`Detalles de ${usuarioSeleccionado?.nombre}`}
  visible={visible}
  onCancel={cerrarModal}
  footer={null}
>
  <p><strong>ID:</strong> {usuarioSeleccionado?.id_usuario}</p>
  <p><strong>Nombre:</strong> {usuarioSeleccionado?.nombre}</p>
  <p><strong>Usuario:</strong> {usuarioSeleccionado?.usuario}</p>
  <p><strong>Estado:</strong> {usuarioSeleccionado?.estado ? 'Activo' : 'Inactivo'}</p>

  <p><strong>Roles asignados:</strong></p>
  {usuarioSeleccionado?.roles?.length > 0 ? (
    <ul>
      {usuarioSeleccionado.roles.map((rol) => (
        <li key={rol.id_rol}>
          <Tag color="blue">{rol.nombre_rol}</Tag>
        </li>
      ))}
    </ul>
  ) : (
    <em style={{ color: '#999' }}>Este usuario no tiene roles asignados</em>
  )}
</Modal>


      <Modal
        title={editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleModalSubmit}
        okText={editingUser ? 'Guardar' : 'Crear'}
        cancelText="Cancelar"
        destroyOnHidden
        okButtonProps={{ className: 'modal-action-button' }}
        cancelButtonProps={{ className: 'modal-action-button' }}
      >
        <Spin spinning={loading}>
          <Form form={form} layout="vertical">
            <Form.Item
              label="Nombre"
              name="nombre"
              rules={[{ required: true, message: 'El nombre es obligatorio' }]}
            >
              <Input placeholder="Ingrese el nombre completo" />
            </Form.Item>

            <Form.Item
              label="Usuario"
              name="usuario"
              rules={[
                { required: true, message: 'El nombre de usuario es obligatorio' },
                {
                  pattern: /^[a-zA-Z0-9_]+$/,
                  message: 'Solo se permiten letras, números y guiones bajos',
                },
              ]}
            >
              <Input placeholder="Ingrese el nombre de usuario" />
            </Form.Item>

            <Form.Item
              label="Contraseña"
              name="contrasena"
              rules={[
                { required: true, message: 'La contraseña es obligatoria' },
                { min: 6, message: 'La contraseña debe tener al menos 6 caracteres' },
              ]}
            >
              <Input.Password placeholder="Ingrese la contraseña" />
            </Form.Item>

            {editingUser && (
              <Form.Item label="Roles asignados actualmente">
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {originalRoles.map(id => {
                    const rol = roles.find(r => r.id_rol === id);
                    return rol ? (
                      <Tag key={id} color="blue">
                        {rol.nombre_rol}
                      </Tag>
                    ) : null;
                  })}
                </div>
              </Form.Item>
            )}

            <Form.Item
              label="Roles"
              name="rol"
              rules={[{ required: true, message: 'Selecciona al menos un rol' }]}
            >
              <Select
                mode="multiple"
                placeholder="Selecciona uno o varios roles"
                style={{ width: '100%' }}
              >
                {roles.map(rol => (
                  <Select.Option key={rol.id_rol} value={rol.id_rol}>
                    {rol.nombre_rol}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <Button type="primary" onClick={() => setIsRolModalOpen(true)} className="fixed-primary-button">
                Agregar nuevo rol
              </Button>

              <Modal
                title="Crear Rol"
                open={isRolModalOpen}
                onOk={handleCrearRol}
                onCancel={() => setIsRolModalOpen(false)}
                confirmLoading={loading}
                okText="Guardar Rol"
                cancelText="Cancelar"
                okButtonProps={{ className: 'modal-action-button' }}
                cancelButtonProps={{ className: 'modal-action-button' }}
              >
                {alert && <Alert type={alert.type} message={alert.message} description={alert.description} />}
                <Form form={formRol} layout="vertical">
                  <Form.Item name="nombre_rol" label="Nombre del Rol" rules={[{ required: true, message: 'Este campo es obligatorio' }]}>
                    <Input placeholder="Ej. Administrador" />
                  </Form.Item>
                  <Form.Item name="descripcion" label="Descripción">
                    <Input placeholder="Ej. Acceso completo al sistema" />
                  </Form.Item>
                  <Form.Item label="Estado">
                    <Select value={estado} onChange={(value) => setEstado(value)}>
                      <Option value={true}>Activo</Option>
                      <Option value={false}>Inactivo</Option>
                    </Select>
                  </Form.Item>
                </Form>
              </Modal>
            </div>

            <Form.Item label="Estado" name="estado" initialValue={true}>
              <Select>
                <Option value={true}>Activo</Option>
                <Option value={false}>Inactivo</Option>
              </Select>
            </Form.Item>
          </Form>
        </Spin>
      </Modal>
    </div>
  );
};

export default UserList;