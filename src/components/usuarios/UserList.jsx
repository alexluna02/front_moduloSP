import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './usuario.css';
import { Table, Button, Input, Modal, Form, Select, Spin } from 'antd';
import { FaSearch, FaEdit, FaTrash, FaUserPlus } from 'react-icons/fa';
import Inicio from '../seguridad/Inicio';
import CustomAlert from '../Alert';

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
  }, []);

  // Filtrar búsqueda
  const filteredUsers = users.filter((u) =>
    ['usuario', 'id_usuario'].some((field) =>
      String(u[field]).toLowerCase().includes(searchText.toLowerCase())
    )
  );

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
      form.setFieldsValue({
        usuario: user.usuario,
        contrasena: user.contrasena,
        estado: user.estado,
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
        await axios.post(`${API_URL}/usuarios`, values);
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