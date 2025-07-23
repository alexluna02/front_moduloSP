import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Button, Input, Modal, Form, Spin, Select, Tag } from 'antd';
import { FaSearch, FaEdit, FaTrash, FaPlus, FaFilePdf } from 'react-icons/fa';
import CustomAlert from '../Alert';
import { useNavigate } from 'react-router-dom';
import { validarAutorizacion } from '../utils/authUtils';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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

  const parseLetters = text => {
    try {
      const parsed = JSON.parse(text);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch (e) {
      console.error('Error al parsear descripcion:', e);
      return text?.match(/[A-Z]/g) || [];
    }
  };

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

  // Parsear permisos desde permisoPermisos.descripcion
  let parsedPermisos = [];
  try {
    if (permisoPermisos?.descripcion) {
      parsedPermisos = JSON.parse(permisoPermisos.descripcion);
      if (!Array.isArray(parsedPermisos)) {
        parsedPermisos = [parsedPermisos];
      }
    }
  } catch (e) {
    console.error('Error al parsear permisoPermisos.descripcion:', e);
    parsedPermisos = [];
  }

  const puedeCrear = parsedPermisos.includes('C');
  const puedeEditar = parsedPermisos.includes('U');
  const puedeEliminar = parsedPermisos.includes('D');
  const puedeLeer = parsedPermisos.includes('R');

  const filteredPermisos = permisos.filter((permiso) =>
    ['nombre_permiso', 'descripcion', 'url_permiso', 'id_modulo'].some((field) =>
      permiso[field]?.toString().toLowerCase().includes(searchText.toLowerCase())
    )
  );

  const handleDelete = async (id) => {
    if (!puedeEliminar) {
      setAlert({
        type: 'error',
        message: '¡Acceso denegado!',
        description: 'No tienes permisos para eliminar permisos.',
      });
      return;
    }
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

  const generatePDF = () => {
    if (!puedeLeer) {
      setAlert({
        type: 'error',
        message: '¡Acceso denegado!',
        description: 'No tienes permisos para generar reportes.',
      });
      return;
    }
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Reporte de Permisos', 14, 22);

    const tableData = filteredPermisos.map(permiso => {
      const modulo = modulos.find(m => m.id_modulo === permiso.id_modulo);
      const letras = parseLetters(permiso.descripcion);
      const ordenCRUD = ['C', 'R', 'U', 'D'];
      const sorted = ordenCRUD.filter(letter => letras.includes(letter)).join(', ');
      return [
        `#${permiso.id_permiso.toString().padStart(3, '0')}`,
        permiso.nombre_permiso,
        sorted,
        permiso.url_permiso,
        modulo ? `${modulo.nombre_modulo} (#${permiso.id_modulo})` : `#${permiso.id_modulo}`
      ];
    });

    autoTable(doc, {
      head: [['ID', 'Nombre', 'Descripción', 'URL Permiso', 'Módulo']],
      body: tableData,
      startY: 30,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [22, 160, 133] },
    });

    doc.save('Reporte_Permisos.pdf');
  };

  const openModal = (permiso = null) => {
    if (!puedeCrear && !permiso) {
      setAlert({
        type: 'error',
        message: '¡Acceso denegado!',
        description: 'No tienes permisos para crear permisos.',
      });
      return;
    }
    if (!puedeEditar && permiso) {
      setAlert({
        type: 'error',
        message: '¡Acceso denegado!',
        description: 'No tienes permisos para editar permisos.',
      });
      return;
    }
    setEditingPermiso(permiso);
    if (permiso) {
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
    if (!puedeCrear && !editingPermiso) {
      setAlert({
        type: 'error',
        message: '¡Acceso denegado!',
        description: 'No tienes permisos para crear permisos.',
      });
      return;
    }
    if (!puedeEditar && editingPermiso) {
      setAlert({
        type: 'error',
        message: '¡Acceso denegado!',
        description: 'No tienes permisos para editar permisos.',
      });
      return;
    }
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
        <div style={{ display: 'flex', gap: 8 }}>
          {puedeEditar && (
            <Button icon={<FaEdit />} onClick={() => openModal(record)} />
          )}
          {puedeEliminar && (
            <Button icon={<FaTrash />} danger onClick={() => handleDelete(record.id_permiso)} />
          )}
        </div>
      ),
    },
    {
      title: 'ID',
      dataIndex: 'id_permiso',
      key: 'id_permiso',
      render: (id) => `#${id.toString().padStart(3, '0')}`,
      sorter: (a, b) => a.id_permiso - b.id_permiso,
    },
    {
      title: 'Nombre',
      dataIndex: 'nombre_permiso',
      key: 'nombre_permiso',
      sorter: (a, b) => a.nombre_permiso.localeCompare(b.nombre_permiso),
    },
    {
      title: 'Descripción',
      dataIndex: 'descripcion',
      key: 'descripcion',
      render: texto => {
        const letras = parseLetters(texto);
        const ordenCRUD = ['C', 'R', 'U', 'D'];
        const sorted = ordenCRUD.filter(letter => letras.includes(letter)).join(', ');
        return sorted;
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
      sorter: (a, b) => a.id_modulo - b.id_modulo,
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
        <div>
          {puedeCrear && (
            <Button type="primary" icon={<FaPlus />} onClick={() => openModal()} style={{ marginRight: 8 }}>
              Nuevo Permiso
            </Button>
          )}
          {puedeLeer && (
            <Button type="default" icon={<FaFilePdf />} onClick={generatePDF}>
              Generar Reporte
            </Button>
          )}
        </div>
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