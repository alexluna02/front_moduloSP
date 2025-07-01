import React, { useEffect, useState } from 'react';
import axios from 'axios';
//import './auditoria.css';
import { Table, Button, Input, Modal, Form, Spin } from 'antd';
import { FaSearch, FaEdit, FaTrash } from 'react-icons/fa';
import CustomAlert from '../Alert';

const API_URL = 'https://aplicacion-de-seguridad-v2.onrender.com/api';

const AuditList = () => {
  const [audits, setAudits] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [alert, setAlert] = useState({ type: '', message: '', description: '' });
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [editingAudit, setEditingAudit] = useState(null);
  const [selectedDetails, setSelectedDetails] = useState(null);
  const [form] = Form.useForm();

  // Obtener auditorías
  const fetchAudits = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/auditoria`);
      setAudits(res.data);
    } catch (error) {
      setAlert({
        type: 'error',
        message: 'Error al cargar auditorías',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAudits();
  }, []);

  // Filtrar búsqueda
  const filteredAudits = audits.filter((a) =>
    ['id', 'accion', 'modulo', 'tabla', 'nombre_rol'].some((field) =>
      String(a[field]).toLowerCase().includes(searchText.toLowerCase())
    )
  );

  // Eliminar auditoría
  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta auditoría?')) {
      setLoading(true);
      try {
        await axios.delete(`${API_URL}/auditoria/${id}`);
        setAlert({
          type: 'success',
          message: 'Auditoría eliminada',
          description: 'La auditoría ha sido eliminada correctamente.',
        });
        fetchAudits();
      } catch (error) {
        setAlert({
          type: 'error',
          message: 'Error al eliminar auditoría',
          description: error.message,
        });
      } finally {
        setLoading(false);
      }
    }
  };

  // Abrir modal para editar
  const openModal = (audit = null) => {
    setEditingAudit(audit);
    if (audit) {
      form.setFieldsValue({
        id: audit.id,
        accion: audit.accion,
        modulo: audit.modulo,
        tabla: audit.tabla,
        id_usuario: audit.id_usuario,
        timestamp: new Date(audit.timestamp).toLocaleString(),
        nombre_rol: audit.nombre_rol,
      });
    } else {
      form.resetFields();
    }
    setModalOpen(true);
  };

  // Guardar (simulado, no se envía porque es solo lectura)
  const handleModalSubmit = () => {
    setAlert({
      type: 'info',
      message: 'Información de auditoría',
      description: 'Las auditorías son de solo lectura y no se pueden modificar.',
    });
    setModalOpen(false);
  };

  // Abrir modal de detalles
  const openDetailsModal = (audit) => {
    setSelectedDetails(audit.details);
    setDetailsModalOpen(true);
  };

  // Convierte el objeto de detalles en un arreglo de pares clave-valor
  const detailsToRows = (details) => {
    if (!details || typeof details !== 'object') return [];
    return Object.entries(details).map(([key, value]) => ({
      key,
      value: typeof value === 'object' ? JSON.stringify(value) : String(value),
    }));
  };

  const columns = [
    
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      render: (id) => `#${id.toString().padStart(3, '0')}`,
    },
    {
      title: 'Acción',
      dataIndex: 'accion',
      key: 'accion',
    },
    {
      title: 'Módulo',
      dataIndex: 'modulo',
      key: 'modulo',
    },
    {
      title: 'Tabla',
      dataIndex: 'tabla',
      key: 'tabla',
    },
    {
      title: 'ID Usuario',
      dataIndex: 'id_usuario',
      key: 'id_usuario',
      render: (id) => id || 'Sin usuario',
    },
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (timestamp) => new Date(timestamp).toLocaleString(),
    },
    {
      title: 'Rol',
      dataIndex: 'nombre_rol',
      key: 'nombre_rol',
    },
    {
      title: 'Detalles',
      key: 'detalles',
      render: (_, record) => (
        <Button onClick={() => openDetailsModal(record)}>Ver</Button>
      ),
    },
  ];

  return (
    <div style={{ padding: 20 }}>
      <h2>Administra las auditorías del sistema</h2>

      <CustomAlert
        type={alert.type}
        message={alert.message}
        description={alert.description}
        onClose={() => setAlert({ type: '', message: '', description: '' })}
      />

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <Input
          placeholder="Buscar..."
          prefix={<FaSearch />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 300 }}
        />
      </div>

      <Table
        dataSource={filteredAudits}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{ showSizeChanger: true }}
      />

      <Modal
        title={editingAudit ? 'Editar Auditoría' : 'Nueva Auditoría'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleModalSubmit}
        okText="Cerrar"
        destroyOnHidden
      >
        <Spin spinning={loading}>
          <Form form={form} layout="vertical">
            <Form.Item label="ID" name="id">
              <Input disabled />
            </Form.Item>
            <Form.Item label="Acción" name="accion">
              <Input disabled />
            </Form.Item>
            <Form.Item label="Módulo" name="modulo">
              <Input disabled />
            </Form.Item>
            <Form.Item label="Tabla" name="tabla">
              <Input disabled />
            </Form.Item>
            <Form.Item label="ID Usuario" name="id_usuario">
              <Input disabled />
            </Form.Item>
            <Form.Item label="Timestamp" name="timestamp">
              <Input disabled />
            </Form.Item>
            <Form.Item label="Rol" name="nombre_rol">
              <Input disabled />
            </Form.Item>
          </Form>
        </Spin>
      </Modal>

      <Modal
        title="Detalles de la Auditoría"
        open={detailsModalOpen}
        onCancel={() => setDetailsModalOpen(false)}
        onOk={() => setDetailsModalOpen(false)}
        okText="Cerrar"
        destroyOnHidden
      >
        <Spin spinning={loading}>
          <Table
            dataSource={detailsToRows(selectedDetails)}
            columns={[
              { title: 'Campo', dataIndex: 'key', key: 'key' },
              { title: 'Valor', dataIndex: 'value', key: 'value' },
            ]}
            pagination={false}
            size="small"
            rowKey="key"
            locale={{ emptyText: 'Sin detalles' }}
          />
        </Spin>
      </Modal>
    </div>
  );
};

export default AuditList;