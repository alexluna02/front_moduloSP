import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Button, Input, Modal, Form, Spin } from 'antd';
import { FaSearch, FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import CustomAlert from '../Alert';
import { useNavigate } from 'react-router-dom';
import { validarAutorizacion } from '../utils/authUtils'; 
//const { Option } = Select;
const API_URL = 'https://aplicacion-de-seguridad-v2.onrender.com/api';

const PermisosList = () => {
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

  const [permisos, setPermisos] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [alert, setAlert] = useState({ type: '', message: '', description: '' });
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPermiso, setEditingPermiso] = useState(null);
  const [form] = Form.useForm();

  // Estado para almacenar los permisos procesados
  const [permisoPermisos, setPermisoPermisos] = useState(null);

  const fetchPermisos = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/permisos`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } // Asegúrate de enviar el token
      });
      setPermisos(res.data.data || res.data); // Ajusta según la estructura de la respuesta
      // Buscar el permiso para este módulo (Permisos) después de cargar los datos
      const permiso = (res.data.data || res.data).find(p => p.nombre_permiso?.toLowerCase() === 'permisos');
      setPermisoPermisos(permiso);
    } catch (error) {
      setAlert({
        type: 'error',
        message: 'Error al cargar permisos',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermisos();
  }, []);

  // Funciones para saber si tiene permiso para cada acción, basadas en permisoPermisos
  //const puedeLeer = permisoPermisos?.descripcion?.includes('R') || false;
  const puedeCrear = permisoPermisos?.descripcion?.includes('C') || false;
  const puedeEditar = permisoPermisos?.descripcion?.includes('U') || false;
  const puedeEliminar = permisoPermisos?.descripcion?.includes('D') || false;

  const filteredPermisos = permisos.filter((permiso) =>
    ['nombre_permiso', 'descripcion', 'url_permiso', 'id_modulo'].some((field) =>
      permiso[field] ? permiso[field].toString().toLowerCase().includes(searchText.toLowerCase()) : false
    )
  );

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este permiso?')) {
      setLoading(true);
      try {
        await axios.delete(`${API_URL}/permisos/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setAlert({
          type: 'success',
          message: 'Permiso eliminado',
          description: 'El permiso ha sido eliminado correctamente.',
        });
        fetchPermisos();
      } catch (error) {
        setAlert({
          type: 'error',
          message: 'Error al eliminar permiso',
          description: error.message,
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const openModal = (permiso = null) => {
    setEditingPermiso(permiso);
    if (permiso) {
      form.setFieldsValue(permiso);
    } else {
      form.resetFields();
    }
    setModalOpen(true);
  };

  const handleModalSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      if (editingPermiso) {
        await axios.put(`${API_URL}/permisos/${editingPermiso.id_permiso}`, values, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setAlert({
          type: 'success',
          message: 'Permiso actualizado',
          description: 'El permiso fue actualizado correctamente.',
        });
      } else {
        await axios.post(`${API_URL}/permisos`, values, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setAlert({
          type: 'success',
          message: 'Permiso creado',
          description: 'Nuevo permiso agregado correctamente.',
        });
      }
      fetchPermisos();
      setModalOpen(false);
    } catch (error) {
      console.error('Error en handleModalSubmit:', error);
      setAlert({
        type: 'error',
        message: 'Error al guardar permiso',
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
            <Button icon={<FaEdit />} onClick={() => openModal(record)} style={{ marginRight: 8 }} />
          )}
          {puedeEliminar && (
            <Button icon={<FaTrash />} danger onClick={() => handleDelete(record.id_permiso)} />
          )}
        </>
      ),
    },
    {
      title: 'ID',
      dataIndex: 'id_permiso',
      key: 'id_permiso',
      render: (id) => `#${id.toString().padStart(3, '0')}`,
    },
    {
      title: 'Nombre',
      dataIndex: 'nombre_permiso',
      key: 'nombre_permiso',
    },
    {
      title: 'Descripción',
      dataIndex: 'descripcion',
      key: 'descripcion',
    },
    {
      title: 'URL Permiso',
      dataIndex: 'url_permiso',
      key: 'url_permiso',
    },
    {
      title: 'ID Módulo',
      dataIndex: 'id_modulo',
      key: 'id_modulo',
    },
  ];

  return (
    <div style={{ padding: 20 }}>
      <h2>Gestión de Permisos</h2>

      <CustomAlert
        type={alert.type}
        message={alert.message}
        description={alert.description}
        onClose={() => setAlert({ type: '', message: '', description: '' })}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        {puedeCrear && (
          <Button type="primary" icon={<FaPlus />} onClick={() => openModal()}>
            Nuevo Permiso
          </Button>
        )}
        <Input
          placeholder="Buscar permisos..."
          prefix={<FaSearch />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 300 }}
        />
      </div>

      <Table
        dataSource={filteredPermisos}
        columns={columns}
        rowKey="id_permiso"
        loading={loading}
        pagination={{ showSizeChanger: true }}
      />

      <Modal
        title={editingPermiso ? 'Editar Permiso' : 'Nuevo Permiso'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleModalSubmit}
        okText={editingPermiso ? 'Actualizar' : 'Crear'}
        destroyOnClose
      >
        <Spin spinning={loading}>
          <Form form={form} layout="vertical">
            <Form.Item
              label="Nombre del Permiso"
              name="nombre_permiso"
              rules={[{ required: true, message: 'Este campo es obligatorio' }]}
            >
              <Input placeholder="Ej: crear_usuario" />
            </Form.Item>

            <Form.Item
              label="Descripción"
              name="descripcion"
              rules={[{ required: true, message: 'La descripción es obligatoria' }]}
            >
              <Input.TextArea placeholder="Ej: Permite crear un nuevo usuario" rows={3} />
            </Form.Item>
            <Form.Item
              label="URL Permiso"
              name="url_permiso"
              rules={[{ required: true, message: 'La URL es obligatoria' }]}
            >
              <Input placeholder="Ej: /usuarios/crear" />
            </Form.Item>
            <Form.Item
              label="ID Módulo"
              name="id_modulo"
              rules={[{ required: true, message: 'El ID del módulo es obligatorio' }]}
            >
              <Input placeholder="Ej: 1" />
            </Form.Item>
          </Form>
        </Spin>
      </Modal>
    </div>
  );
};

export default PermisosList;