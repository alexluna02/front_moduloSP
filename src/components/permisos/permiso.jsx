import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Button, Input, Modal, Form, Select, Spin } from 'antd';
import { FaSearch, FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import CustomAlert from '../Alert';

const { Option } = Select;
const API_URL = 'https://aplicacion-de-seguridad-v2.onrender.com/api';

const PermisosList = () => {
  const [permisos, setPermisos] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [alert, setAlert] = useState({ type: '', message: '', description: '' });
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPermiso, setEditingPermiso] = useState(null);
  const [form] = Form.useForm();

  const fetchPermisos = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/permisos`);
      setPermisos(res.data);
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

  const filteredPermisos = permisos.filter((permiso) =>
    ['nombre_permiso', 'descripcion'].some((field) =>
      permiso[field].toLowerCase().includes(searchText.toLowerCase())
    )
  );

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este permiso?')) {
      setLoading(true);
      try {
        await axios.delete(`${API_URL}/permisos/${id}`);
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
      values.estado = values.estado === true || values.estado === 'true';

      setLoading(true);
      if (editingPermiso) {
        await axios.put(`${API_URL}/permisos/${editingPermiso.id_permiso}`, values);
        setAlert({
          type: 'success',
          message: 'Permiso actualizado',
          description: 'El permiso fue actualizado correctamente.',
        });
      } else {
        await axios.post(`${API_URL}/permisos`, values);
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
          <Button icon={<FaEdit />} onClick={() => openModal(record)} style={{ marginRight: 8 }} />
          <Button icon={<FaTrash />} danger onClick={() => handleDelete(record.id_permiso)} />
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
      title: 'Estado',
      dataIndex: 'estado',
      key: 'estado',
      render: (estado) => (
        <span className={estado ? 'status active' : 'status inactive'}>
          {estado ? 'Activo' : 'Inactivo'}
        </span>
      ),
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
        <Button type="primary" icon={<FaPlus />} onClick={() => openModal()}>
          Nuevo Permiso
        </Button>
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
        destroyOnHidden
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
                    label="Estado"
                    name="estado"
                    initialValue={true}
                    getValueFromEvent={(value) => value === true || value === 'true'} // 🔁 convierte string a boolean
                >
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

export default PermisosList;
