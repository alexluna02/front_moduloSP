import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Button, Input, Modal, Form, Spin } from 'antd';
import { FaSearch, FaFilePdf } from 'react-icons/fa';
import CustomAlert from '../Alert';
import { useNavigate } from 'react-router-dom';
import { validarAutorizacion } from '../utils/authUtils';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const API_URL = 'https://aplicacion-de-seguridad-v2.onrender.com/api';

const AuditList = () => {
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

  const [audits, setAudits] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [alert, setAlert] = useState({ type: '', message: '', description: '' });
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [editingAudit] = useState(null);
  const [selectedDetails, setSelectedDetails] = useState(null);
  const [form] = Form.useForm();

  // Obtener auditorías
  const fetchAudits = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/auditoria`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
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

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Reporte de Auditorías', 14, 22);

    const tableData = filteredAudits.map(audit => [
      `#${audit.id.toString().padStart(3, '0')}`,
      audit.accion,
      audit.modulo,
      audit.tabla,
      audit.id_usuario || 'Sin usuario',
      new Date(audit.timestamp).toLocaleString(),
      audit.nombre_rol,
      audit.details ? JSON.stringify(audit.details, null, 2) : 'Sin detalles'
    ]);

    autoTable(doc, {
      head: [['ID', 'Acción', 'Módulo', 'Tabla', 'ID Usuario', 'Timestamp', 'Rol', 'Detalles']],
      body: tableData,
      startY: 30,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [22, 160, 133] },
      columnStyles: {
        7: { cellWidth: 50 } // Ajustar ancho de la columna de detalles
      }
    });

    doc.save('Reporte_Auditorias.pdf');
  };

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

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Button
          type="default"
          onClick={generatePDF}
          icon={<FaFilePdf />}
          style={{ backgroundColor: '#f5f5f5', borderColor: '#d9d9d9' }}
        >
          Generar Reporte
        </Button>
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
        destroyOnClose
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
        destroyOnClose
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
