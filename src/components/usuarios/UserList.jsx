import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './usuario.css';
import { Table, Button, Input, Modal, Form, Select, Spin,Alert } from 'antd';
import { FaSearch, FaEdit, FaTrash, FaUserPlus } from 'react-icons/fa';
import '@ant-design/icons';
import Inicio from '../seguridad/Inicio';
import CustomAlert from '../Alert';
import { listarRoles,crearRol } from '../Roles/RoleForm.js';


const { Option } = Select;
const API_URL = 'https://aplicacion-de-seguridad-v2.onrender.com/api';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [alert, setAlert] = useState({ type: '', message: '', description: '' });
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
    const [form] = Form.useForm();
    const [formRol] = Form.useForm();
    const [roles, setRoles] = useState([]);
    const [nombreRol, setNombreRol] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [estado, setEstado] = useState(true); 
    const [isRolModalOpen, setIsRolModalOpen] = useState(false);

  // Obtener usuarios
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/usuarios`);
      setUsers(res.data);
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

  useEffect(() => {
      fetchUsers();

      setLoading(true);
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

  // Filtrar búsqueda
  const filteredUsers = users.filter((u) =>
    ['usuario', 'id_usuario'].some((field) =>
      String(u[field]).toLowerCase().includes(searchText.toLowerCase())
    )
  );

    const handleCrearRol = async () => {
        try {
            setLoading(true);
            const values = await formRol.validateFields(); // ✅ validación
            const resultado = await crearRol(values);   // 📡 petición al backend

            if (resultado.success) {
                setAlert({
                    type: 'success',
                    message: '¡Operación exitosa!',
                    description: 'El rol fue creado correctamente.',
                });
                listarRoles()
                    .then((data) => {
                        setRoles(data);
                    })          // 🔄 actualiza la lista
                setIsRolModalOpen(false);  // 🔒 cierra el modal
                formRol.resetFields();      // 🧼 limpia el formulario
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


  // Eliminar usuario
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

  // Abrir modal para crear o editar usuario
  const openModal = (user = null) => {
    setEditingUser(user);
    if (user) {
      // Obtener el rol del usuario (asumiendo que viene como user.rol o user.id_rol)
      // Si no viene, deberás obtenerlo de la API y asignarlo aquí
      form.setFieldsValue({
        usuario: user.usuario,
        contrasena: user.contrasena,
        nombre: user.nombre,
        estado: user.estado,
        rol: user.rol || user.id_rol // Ajusta según la estructura de tu API
      });
    } else {
      form.resetFields();
    }
    setModalOpen(true);
  };

  // Guardar usuario (crear o actualizar)
  const handleModalSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      if (editingUser) {
        // Actualizar usuario
        await axios.put(`${API_URL}/usuarios/${editingUser.id_usuario}`, values);
        setAlert({
          type: 'success',
          message: 'Usuario actualizado',
          description: 'Los datos del usuario fueron actualizados correctamente.',
        });
      } else {
          // Crear usuario
          console.log('Payload usuario:', {
              usuario: values.usuario,
              contrasena: values.contrasena,
              nombre: values.nombre,
              estado: values.estado
          });
          const res = await axios.post(`${API_URL}/usuarios`, values);

          const id_usuario = res.data.id_usuario;
          // Asignar el rol al usuario
          console.log('Payload relación usuario-rol:', {
              id_usuario,
              id_rol: values.rol
          });

          await axios.post(`${API_URL}/usuarios_roles`, {
              id_usuario,
              id_rol: values.rol,
          });

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
          <Button
            icon={<FaEdit />}
            onClick={() => openModal(record)}
            style={{ marginRight: 8 }}
          />
          <Button
            icon={<FaTrash />}
            danger
            onClick={() => handleDelete(record.id_usuario)}
          />
        </>
      ),
    },
    {
      title: 'ID',
      dataIndex: 'id_usuario',
      key: 'id_usuario',
      render: (id) => `#${id.toString().padStart(3, '0')}`,
    },
    {
      title: 'Usuario',
      dataIndex: 'usuario',
      key: 'usuario',
      },
      {
          title: 'Nombre',
          dataIndex: 'nombre',
          key: 'nombre',
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
    },
    {
      title: 'Fecha Creación',
      dataIndex: 'fecha_creacion',
      key: 'fecha_creacion',
      render: (fecha) => new Date(fecha).toLocaleString(),
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
            <Button type="primary" icon={<FaUserPlus />} onClick={() => openModal()}>
              Nuevo Usuario
            </Button>
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
          title={editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
          open={modalOpen}
          onCancel={() => setModalOpen(false)}
          onOk={handleModalSubmit}
          okText={editingUser ? 'Actualizar' : 'Crear'}
          destroyOnHidden
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

                      
                          <Form.Item label="Rol" name="rol" rules={[{ required: true, message: 'Selecciona un rol' }]}>
                          <Select placeholder="Selecciona un rol" style={{ width: '100%' }}>
                              {roles.map(rol => (
                                  <Select.Option key={rol.id_rol} value={rol.id_rol}>
                                      {rol.nombre_rol}
                                  </Select.Option>
                              ))}
                          </Select>
                      </Form.Item>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                          <Button onClick={() => setIsRolModalOpen(true)} className="custom-button">Agregar nuevo rol</Button>

                          <Modal
                              title="Crear Rol"
                              open={isRolModalOpen}
                              onOk={handleCrearRol }
                              onCancel={() => setIsRolModalOpen(false)}
                              confirmLoading={loading}
                              okText="Crear Rol"
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