import React, { useState, useEffect } from 'react';
import './RoleAdmin.css';
import { FaEdit, FaTrash, FaInfoCircle, FaSearch } from 'react-icons/fa';
import { Button, Table, Spin, Modal, Input, Form, Select } from 'antd';
import 'antd/dist/reset.css';
import CustomAlert from '../Alert.js';
import Inicio from '../seguridad/Inicio.js';

const { Option } = Select;

export const listarRoles = async () => {
    try {
        const res = await fetch('/api/roles');
        const data = await res.json();
        return data;
    } catch (err) {
        console.error('Error al cargar roles:', err);
        throw err;
    }
};

export const crearRol = async (roleData) => {
    try {
        const res = await fetch('/api/roles', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(roleData),
        });

        if (!res.ok) {
            throw new Error('Error en la respuesta del servidor');
        }

        const data = await res.json();
        return { success: true, data };
    } catch (error) {
        console.error('Error al crear el rol:', error);
        return { success: false, error };
    }
};

const RoleAdmin = () => {
    const [estado, setEstado] = useState(true);
    const [roles, setRoles] = useState([]);
    const [nombreRol, setNombreRol] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [message, setMessage] = useState('');
    const [editingRoleId, setEditingRoleId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [alert, setAlert] = useState({
        type: '',
        message: '',
        description: '',
    });

    const [errorNombre, setErrorNombre] = useState('');
    const [searchText, setSearchText] = useState('');

    const validarNombre = (valor) => {
        if (!valor || typeof valor !== 'string') return 'El nombre es obligatorio';
        if (!valor.trim()) return 'El nombre es obligatorio';
        if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(valor.trim())) {
            return 'Solo se permiten letras y espacios';
        }
        return '';
    };

    const filteredRoles = roles.filter((item) =>
        Object.values(item).some((value) =>
            String(value).toLowerCase().includes(searchText.toLowerCase())
        )
    );

    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const fetchRoles = () => {
        fetch('/api/roles')
            .then((res) => res.json())
            .then((data) => {
                setRoles(data);
            })
            .catch((err) => {
                console.error('Error al cargar roles:', err);
                setMessage('Error al cargar roles.');
                setAlert({
                    type: 'error',
                    message: '¡Operación fallida!',
                    description: 'Error al cargar roles.',
                });
            }).finally(() => {
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchRoles();
    }, []);

    const handleSubmit = (e) => {
        setLoading(true);
        e.preventDefault();

        const error = validarNombre(nombreRol);
        setErrorNombre(error);

        if (error) {
            setLoading(false);
            return;
        }

        const roleData = {
            nombre_rol: nombreRol,
            descripcion,
            estado,
        };

        if (editingRoleId) {
            fetch(`/api/roles/${editingRoleId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(roleData),
            })
                .then((res) => res.json())
                .then((data) => {
                    setMessage('¡Rol actualizado correctamente!');
                    setAlert({
                        type: 'success',
                        message: '¡Operación exitosa!',
                        description: 'El rol fue actualizado correctamente.',
                    });
                    setNombreRol('');
                    setDescripcion('');
                    setEditingRoleId(null);
                    setIsModalOpen(false);
                    fetchRoles();
                })
                .catch((error) => {
                    console.error('Error al actualizar el rol:', error);
                    setMessage('Error al actualizar el rol.');
                    setAlert({
                        type: 'error',
                        message: '¡Operación fallida!',
                        description: 'Error al actualizar el rol.',
                    });
                })
                .finally(() => {
                    setLoading(false);
                });
        } else {
            fetch('/api/roles', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(roleData),
            })
                .then((res) => res.json())
                .then((data) => {
                    setMessage('¡Rol creado correctamente!');
                    setAlert({
                        type: 'success',
                        message: '¡Operación exitosa!',
                        description: 'El rol fue creado correctamente.',
                    });
                    setNombreRol('');
                    setDescripcion('');
                    setIsModalOpen(false);
                    fetchRoles();
                })
                .catch((error) => {
                    console.error('Error al crear el rol:', error);
                    setMessage('Error al crear el rol.');
                    setAlert({
                        type: 'error',
                        message: '¡Operación fallida!',
                        description: 'Error al crear el rol.',
                    });
                })
                .finally(() => {
                    setLoading(false);
                });
        }
    };

    const handleDelete = (id) => {
        if (window.confirm('¿Estás seguro de eliminar este rol?')) {
            fetch(`/api/roles/${id}`, { method: 'DELETE' })
                .then((res) => res.json())
                .then((data) => {
                    setMessage('¡Rol eliminado correctamente!');
                    setAlert({
                        type: 'success',
                        message: '¡Operación exitosa!',
                        description: 'El rol fue eliminado correctamente.',
                    });
                    fetchRoles();
                })
                .catch((error) => {
                    console.error('Error al eliminar el rol:', error);
                    setMessage('Error al eliminar el rol.');
                    setAlert({
                        type: 'error',
                        message: '¡Operación fallida!',
                        description: 'Error al eliminar el rol.',
                    });
                });
        }
    };

    const handleEdit = (role) => {
        setEditingRoleId(role.id_rol);
        setNombreRol(role.nombre_rol);
        setDescripcion(role.descripcion);
        setEstado(role.estado);
        setIsModalOpen(true);
    };

    const openModal = () => {
        setEditingRoleId(null);
        setNombreRol('');
        setDescripcion('');
        setEstado(true);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingRoleId(null);
        setNombreRol('');
        setDescripcion('');
        setErrorNombre('');
    };

    const [detalleVisible, setDetalleVisible] = useState(false);
    const [detalleRol, setDetalleRol] = useState(null);
    const [detallePermisos, setDetallePermisos] = useState([]);
    const [loadingPermisos, setLoadingPermisos] = useState(false);

    const handleDetails = async (role) => {
      setDetalleRol(role);
      setDetallePermisos([]);
      setDetalleVisible(true);
      setLoadingPermisos(true);
      try {
        const res = await fetch(`https://aplicacion-de-seguridad-v2.onrender.com/api/roles_permisos/roles/${role.id_rol}/permisos`);
        if (res.ok) {
          const data = await res.json();
          setDetallePermisos(data);
        } else {
          setDetallePermisos([]);
        }
      } catch (e) {
        console.error('Error al cargar permisos:', e);
        setDetallePermisos([]);
      } finally {
        setLoadingPermisos(false);
      }
    };

    const columns = [
        {
            title: 'Acciones',
            key: 'acciones',
            render: (_, role) => (
                <>
                    <Button
                        icon={<FaEdit size={20} color="#000000ff" />}
                        onClick={() => handleEdit(role)}
                        style={{ marginRight: 8 }}
                    />
                    <Button
                        icon={<FaTrash size={20} color="#ff4154ff" />}
                        onClick={() => handleDelete(role.id_rol)}
                    />
                </>
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
                >
                    Ver
                </Button>
            ),
        },
        {
            title: 'Estado',
            dataIndex: 'estado',
            key: 'estado',
            render: (estado) => (
                <span
                    style={{
                        color: estado ? 'green' : 'red',
                        fontWeight: 'bold',
                    }}
                >
                    {estado ? 'Activo' : 'Inactivo'}
                </span>
            ),
        },
    ];

    return (
        <div style={{ padding: 20 }}>
            <h2 className="titulo">Lista de Roles</h2>

            <CustomAlert
                type={alert.type}
                message={alert.message}
                description={alert.description}
                onClose={() => setAlert({ type: '', message: '', description: '' })}
            />

            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 16,
                }}
            >
                <div style={{ marginLeft: 10 }}>
                    <Button type="primary" onClick={openModal}>
                        Crear
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
                    showTotal: (total, range) =>
                        `${range[0]}-${range[1]} de ${total} elementos`,
                }}
            />

            <Modal
                title={editingRoleId ? 'Editar Rol' : 'Crear Nuevo Rol'}
                open={isModalOpen}
                onCancel={closeModal}
                footer={null}
                destroyOnHidden
            >
                <Spin spinning={loading} tip="Guardando...">
                    <Form layout="vertical" onSubmit={handleSubmit}>
                        <Form.Item label="Nombre del Rol" required>
                            <Input
                                value={nombreRol}
                                onChange={(e) => {
                                    setNombreRol(e.target.value);
                                    if (errorNombre) setErrorNombre('');
                                }}
                                placeholder="Ingresa el nombre del rol"
                            />
                            {errorNombre && (
                                <p style={{ color: 'red', marginTop: 4 }}>
                                    {errorNombre}
                                </p>
                            )}
                        </Form.Item>

                        <Form.Item label="Descripción">
                            <Input.TextArea
                                value={descripcion}
                                onChange={(e) => setDescripcion(e.target.value)}
                                placeholder="Ingresa una descripción (opcional)"
                            />
                        </Form.Item>

                        <Form.Item label="Estado">
                            <Select
                                value={estado}
                                onChange={(value) => setEstado(value)}
                            >
                                <Option value={true}>Activo</Option>
                                <Option value={false}>Inactivo</Option>
                            </Select>
                        </Form.Item>

                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'flex-end',
                                gap: '8px',
                            }}
                        >
                            <Button onClick={closeModal}>Cancelar</Button>
                            <Button type="primary" onClick={handleSubmit}>
                                {editingRoleId ? 'Guardar' : 'Guardar'}
                            </Button>
                        </div>
                    </Form>
                </Spin>
            </Modal>

            <Modal
                title="Detalles del Rol"
                open={detalleVisible}
                onCancel={() => setDetalleVisible(false)}
                footer={null}
            >
                {detalleRol && (
                    <div>
                        <p><strong>ID:</strong> {detalleRol.id_rol}</p>
                        <p><strong>Nombre:</strong> {detalleRol.nombre_rol}</p>
                        <p><strong>Descripción:</strong> {detalleRol.descripcion || 'Sin descripción'}</p>
                        <p><strong>Estado:</strong> {detalleRol.estado ? 'Activo' : 'Inactivo'}</p>
                        <div style={{ marginTop: 16 }}>
                            <strong>Permisos asociados:</strong>
                            {loadingPermisos ? (
                                <p>Cargando permisos...</p>
                            ) : detallePermisos.length > 0 ? (
                                <Table
                                    dataSource={detallePermisos}
                                    columns={[
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
                                        
                                    ]}
                                    pagination={false}
                                    rowKey="id_permiso"
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


