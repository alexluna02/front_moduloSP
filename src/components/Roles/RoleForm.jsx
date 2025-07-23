import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEdit, FaTrash, FaInfoCircle, FaSearch, FaLock, FaPlus, FaFilePdf } from 'react-icons/fa';
import { Button, Table, Spin, Modal, Input, Form, Select, Checkbox } from 'antd';
import axios from 'axios';
import CustomAlert from '../Alert.js';
import { validarAutorizacion } from '../utils/authUtils';
import './RoleAdmin.css';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const { Option } = Select;

const API_URL = 'https://aplicacion-de-seguridad-v2.onrender.com/api';

// API Functions
export const listarRoles = async () => {
  try {
    const res = await axios.get(`${API_URL}/roles`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (!res.data || !Array.isArray(res.data.data)) {
      throw new Error('Formato de respuesta inválido. No se encontró un array en "data".');
    }
    return res.data.data;
  } catch (err) {
    console.error('Error al cargar roles:', err);
    throw err;
  }
};

export const crearRol = async (roleData) => {
  try {
    const res = await axios.post(`${API_URL}/roles`, roleData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return { success: true, data: res.data };
  } catch (error) {
    console.error('Error al crear el rol:', error);
    return { success: false, error };
  }
};

export const listarPermisos = async () => {
  try {
    const res = await axios.get(`${API_URL}/permisos`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (!res.data || !Array.isArray(res.data.data)) {
      throw new Error('Formato de respuesta inválido. No se encontró un array en "data".');
    }
    return res.data.data;
  } catch (err) {
    console.error('Error al cargar permisos:', err);
    throw err;
  }
};

export const asignarPermisosRol = async (roleId, permisos) => {
  try {
    const res = await axios.post(`${API_URL}/roles_permisos/roles/${roleId}/permisos`, { permisos }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return { success: true, data: res.data };
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

  useEffect(() => {
    const checkToken = async () => {
      const { valido } = await validarAutorizacion();
      if (!valido) {
        navigate('/login');
      }
    };
    checkToken();
  }, [navigate]);

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

  const handleSubmit = async (values) => {
    setLoading(true);
    const roleData = { nombre_rol: values.nombreRol, descripcion: values.descripcion, estado };
    try {
      if (editingRoleId) {
        await axios.put(`${API_URL}/roles/${editingRoleId}`, roleData, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
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
        description: error.response?.data?.message || 'Error en la operación del rol.',
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
        description: error.response?.data?.message || 'Error al asignar permisos.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este rol?')) {
      try {
        await axios.delete(`${API_URL}/roles/${id}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
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
          description: error.response?.data?.message || 'Error al eliminar el rol.',
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
      const res = await axios.get(`${API_URL}/roles_permisos/roles/${role.id_rol}/permisos`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      setSelectedPermisos(res.data.data.map(p => p.id_permiso));
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
      const res = await axios.get(`${API_URL}/roles_permisos/roles/${role.id_rol}/permisos`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      setDetallePermisos(res.data.data || []);
    } catch (e) {
      console.error('Error al cargar permisos:', e);
      setDetallePermisos([]);
    } finally {
      setLoadingPermisos(false);
    }
  };

  const generatePDF = async () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Reporte de Roles', 14, 22);

    const tableData = await Promise.all(filteredRoles.map(async (role) => {
      try {
        const res = await axios.get(`${API_URL}/roles_permisos/roles/${role.id_rol}/permisos`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const permisosList = res.data.data.map(p => `${p.nombre_permiso} (${p.nombre_modulo})`).join(', ');
        return [
          role.id_rol,
          role.nombre_rol,
          role.descripcion || 'Sin descripción',
          role.estado ? 'Activo' : 'Inactivo',
          permisosList || 'Ningún permiso asociado'
        ];
      } catch (e) {
        console.error('Error al cargar permisos para el rol:', role.id_rol, e);
        return [
          role.id_rol,
          role.nombre_rol,
          role.descripcion || 'Sin descripción',
          role.estado ? 'Activo' : 'Inactivo',
          'Error al cargar permisos'
        ];
      }
    }));

    autoTable(doc, {
      head: [['ID', 'Nombre', 'Descripción', 'Estado', 'Permisos Asociados']],
      body: tableData,
      startY: 30,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [22, 160, 133] },
      columnStyles: {
        4: { cellWidth: 60 }
      }
    });

    doc.save('Reporte_Roles.pdf');
  };

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

  const puedeCrear = permisoRoles?.descripcion?.includes('C') || false;
  const puedeEditar = permisoRoles?.descripcion?.includes('U') || false;
  const puedeEliminar = permisoRoles?.descripcion?.includes('D') || false;

  const filteredRoles = roles.filter(item =>
    Object.values(item).some(value =>
      String(value).toLowerCase().includes(searchText.toLowerCase())
    )
  );

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

  const permisosColumns = [
    {
      title: 'Permiso',
      dataIndex: 'nombre_permiso',
      key: 'nombre_permiso',
    },
    {
      title: 'Módulo',
      dataIndex: 'nombre_modulo',
      key: 'nombre_modulo',
    },
    {
      title: 'Descripción',
      dataIndex: 'descripcion',
      key: 'descripcion',
      render: desc => desc || 'Sin descripción',
    },
    {
      title: 'Acción',
      key: 'accion',
      render: (_, permiso) => (
        <Button
          onClick={() => setSelectedPermisos(prev => prev.filter(pid => pid !== permiso.id_permiso))}
          className="text-red-500 hover:text-red-700 font-bold"
        >
          ×
        </Button>
      ),
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2>Administrar Roles del Sistema</h2>

      <CustomAlert
        type={alert.type}
        message={alert.message}
        description={alert.description}
        onClose={() => setAlert({ type: '', message: '', description: '' })}
      />

      <div className="flex justify-between items-center mb-6 w-full">
        <div>
          {puedeCrear && (
            <Button
              type="primary"
              onClick={openModal}
              icon={<FaPlus />}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded mr-2"
            >
              Nuevo Rol
            </Button>
          )}
          <Button
            type="default"
            onClick={generatePDF}
            icon={<FaFilePdf />}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded"
          >
            Generar Reporte
          </Button>
        </div>
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
        width={800}
      >
        <Spin spinning={loadingPermisos} tip="Cargando permisos...">
          <div className="space-y-4">
            <div>
              <p className="font-semibold text-gray-700 mb-2">Permisos actuales:</p>
              {selectedPermisos.length > 0 ? (
                <Table
                  dataSource={selectedPermisos.map(id => permisos.find(p => p.id_permiso === id))}
                  columns={permisosColumns}
                  rowKey="id_permiso"
                  pagination={false}
                  className="bg-white shadow-md rounded-lg"
                />
              ) : (
                <p className="text-gray-500">Ningún permiso asignado</p>
              )}
            </div>

            <div>
              <p className="font-semibold text-gray-700 mb-2">Agregar nuevo permiso:</p>
              <Select
                showSearch
                placeholder="Selecciona un permiso para agregar"
                className="w-full"
                onChange={(value) => {
                  if (value && !selectedPermisos.includes(value)) {
                    setSelectedPermisos([...selectedPermisos, value]);
                  }
                }}
                value={undefined}
                optionLabelProp="label"
                filterOption={(input, option) =>
                  option.children.props.children.toLowerCase().includes(input.toLowerCase())
                }
              >
                {permisos
                  .filter(p => !selectedPermisos.includes(p.id_permiso))
                  .map(permiso => (
                    <Option
                      key={permiso.id_permiso}
                      value={permiso.id_permiso}
                      label={`${permiso.nombre_permiso} (${permiso.nombre_modulo})`}
                    >
                      <div>
                        <strong>{permiso.nombre_permiso}</strong> ({permiso.nombre_modulo})
                        <br />
                        <span className="text-gray-500">{permiso.descripcion || 'Sin descripción'}</span>
                      </div>
                    </Option>
                  ))}
              </Select>
            </div>
          </div>
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
                    {
                      title: 'Descripción',
                      dataIndex: 'descripcion',
                      key: 'descripcion',
                      render: desc => desc || 'Sin descripción',
                    },
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