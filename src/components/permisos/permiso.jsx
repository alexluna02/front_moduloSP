import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Button, Input, Modal, Form, Spin, Select,Tag } from 'antd';
import { FaSearch, FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import CustomAlert from '../Alert';
import { useNavigate } from 'react-router-dom';
import { validarAutorizacion } from '../utils/authUtils';

const { Option } = Select;
const API_URL = 'https://aplicacion-de-seguridad-v2.onrender.com/api';

const PermisosList = () => {
  const navigate = useNavigate();

  const [permisos, setPermisos] = useState([]);
  const [modulos, setModulos] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [alert, setAlert] = useState({ type: '', message: '', description: '' });
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPermiso, setEditingPermiso] = useState(null);
  const [form] = Form.useForm();
  const [permisoPermisos, setPermisoPermisos] = useState(null);

  useEffect(() => {
    const checkToken = async () => {
      const { valido } = await validarAutorizacion();
      if (!valido) navigate('/login');
    };
    checkToken();
  }, [navigate]);

  const fetchPermisos = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/permisos`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = res.data.data || res.data;
      setPermisos(data);
      const permiso = data.find(p => p.nombre_permiso?.toLowerCase() === 'permisos');
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

  // Extrae solo las letras A–Z de un string (p.ej. '{"{"R"}","C"}')
const parseLetters = text => text?.match(/[A-Z]/g) || [];

// Renderiza cada tag con únicamente su valor (C, R, U, D)
const tagRender = props => {
  const { value, closable, onClose } = props;
  return (
    <Tag closable={closable} onClose={onClose} style={{ marginRight: 3 }}>
      {value}
    </Tag>
  );
};

  const fetchModulos = async () => {
    try {
      const res = await axios.get(`${API_URL}/modulos`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setModulos(res.data.data || res.data);
    } catch (error) {
      setAlert({
        type: 'error',
        message: 'Error al cargar módulos',
        description: error.message,
      });
    }
  };

  useEffect(() => {
    fetchPermisos();
    fetchModulos();
  }, []);

  const puedeCrear = permisoPermisos?.descripcion?.includes('C') || false;
  const puedeEditar = permisoPermisos?.descripcion?.includes('U') || false;
  const puedeEliminar = permisoPermisos?.descripcion?.includes('D') || false;

  const filteredPermisos = permisos.filter((permiso) =>
    ['nombre_permiso', 'descripcion', 'url_permiso', 'id_modulo'].some((field) =>
      permiso[field]?.toString().toLowerCase().includes(searchText.toLowerCase())
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
       // convertimos '{"{"R"}","C"}' → ['R','C']
    form.setFieldsValue({
      ...permiso,
     descripcion: parseLetters(permiso.descripcion)
   });

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
    title: 'Descripcion',
    dataIndex: 'descripcion',
    key: 'descripcion',
   render: texto => {
  const letras = (texto.match(/[A-Z]/g) || []);
  const ordenCRUD = ['C','R','U','D'];
  // Filtra y ordena según CRUD
  const sorted = ordenCRUD.filter(letter => letras.includes(letter));
  // Devuelve cadena separada por comas
  return sorted.join(', ');

}

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
      render: (id) => {
        const modulo = modulos.find((m) => m.id_modulo === id);
        return modulo ? `${modulo.nombre_modulo} (#${id})` : `#${id}`;
      },
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
        okText={editingPermiso ? 'Guardar' : 'Crear'}
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

 <Select
   mode="multiple"
   placeholder="Seleccione operación"
   tagRender={tagRender}
   allowClear
 >
    <Option value="C">Crear (C)</Option>
    <Option value="R">Leer (R)</Option>
    <Option value="U">Actualizar (U)</Option>
    <Option value="D">Eliminar (D)</Option>
  </Select>
</Form.Item>

            <Form.Item
              label="URL Permiso"
              name="url_permiso"
              rules={[{ required: true, message: 'La URL es obligatoria' }]}
            >
              <Input placeholder="Ej: /usuarios/crear" />
            </Form.Item>

            <Form.Item
              label="Módulo"
              name="id_modulo"
              rules={[{ required: true, message: 'El módulo es obligatorio' }]}
            >
              <Select placeholder="Seleccione un módulo">
                {modulos.map((modulo) => (
                  <Option key={modulo.id_modulo} value={modulo.id_modulo}>
                    {modulo.nombre_modulo}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Form>
        </Spin>
      </Modal>
    </div>
  );
};

export default PermisosList;
