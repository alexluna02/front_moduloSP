import React, { useState, useEffect } from 'react';
import './RoleAdmin.css';
import { FaEdit, FaTrash, FaInfoCircle, FaSearch, FaLock } from 'react-icons/fa';
import { Button, Table, Spin, Modal, Input, Form, Select, Checkbox, List } from 'antd';
import 'antd/dist/reset.css';
import CustomAlert from '../Alert.js';
import { useNavigate } from 'react-router-dom';

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

export const listarPermisos = async () => {
    try {
        const res = await fetch('/api/permisos');
        const data = await res.json();
        return data;
    } catch (err) {
        console.error('Error al cargar permisos:', err);
        throw err;
    }
};

export const asignarPermisosRol = async (roleId, permisos) => {
    try {
        const res = await fetch(`/api/roles_permisos/roles/${roleId}/permisos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ permisos }),
        });

        if (!res.ok) {
            throw new Error('Error al asignar permisos');
        }

        const data = await res.json();
        return { success: true, data };
    } catch (error) {
        console.error('Error al asignar permisos:', error);
        return { success: false, error };
    }
};

const RoleAdmin = () => {
        const navigate = useNavigate();

    // Redirección si no hay token válido
    useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
        navigate('/login');
    }
    }, [navigate]);

    const [form] = Form.useForm();
    const [estado, setEstado] = useState(true);
    const [roles, setRoles] = useState([]);
    const [editingRoleId, setEditingRoleId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPermisosModalOpen, setIsPermisosModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [alert, setAlert] = useState({
        type: '',
        message: '',
        description: '',
    });
    const [searchText, setSearchText] = useState('');
    const [permisos, setPermisos] = useState([]);
    const [selectedPermisos, setSelectedPermisos] = useState([]);
    const [loadingPermisos, setLoadingPermisos] = useState(false);

    // Obtener permisos desde localStorage
    const permiso = JSON.parse(localStorage.getItem('permisos') || '[]');

    // Buscar el permiso para este módulo (Roles)
    const permisoRoles = permisos.find(p => p.nombre_permiso?.toLowerCase() === 'roles');

    // Funciones para saber si tiene permiso para cada acción
    const puedeLeer = permisoRoles?.descripcion.includes('R');
    const puedeCrear = permisoRoles?.descripcion.includes('C');
    const puedeEditar = permisoRoles?.descripcion.includes('U');
    const puedeEliminar = permisoRoles?.descripcion.includes('D');

    const filteredRoles = roles.filter((item) =>
        Object.values(item).some((value) =>
            String(value).toLowerCase().includes(searchText.toLowerCase())
        )
    );

    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const fetchRoles = () => {
        setLoading(true);
        fetch('/api/roles')
            .then((res) => res.json())
            .then((data) => {
                setRoles(data);
            })
            .catch((err) => {
                console.error('Error al cargar roles:', err);
                setAlert({
                    type: 'error',
                    message: '¡Operación fallida!',
                    description: 'Error al cargar roles.',
                });
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const fetchPermisos = async () => {
        try {
            const data = await listarPermisos();
            setPermisos(data);
        } catch (err) {
            setAlert({
                type: 'error',
                message: '¡Operación fallida!',
                description: 'Error al cargar permisos.',
            });
        }
    };

    useEffect(() => {
        fetchRoles();
        fetchPermisos();
    }, []);

    const handleSubmit = async (values) => {
        setLoading(true);

        const roleData = {
            nombre_rol: values.nombreRol,
            descripcion: values.descripcion,
            estado,
        };

        try {
            if (editingRoleId) {
                const res = await fetch(`/api/roles/${editingRoleId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(roleData),
                });
                if (!res.ok) throw new Error('Error al actualizar el rol');
                setAlert({
                    type: 'success',
                    message: '¡Operación exitosa!',
                    description: 'El rol fue actualizado correctamente.',
                });
            } else {
                const { success, data } = await crearRol(roleData);
                if (!success) throw new Error('Error al crear el rol');
                setEditingRoleId(data.id_rol); // Set role ID for permissions assignment
                setAlert({
                    type: 'success',
                    message: '¡Operación exitosa!',
                    description: 'El rol fue creado correctamente.',
                });
            }
            form.resetFields();
            setIsModalOpen(false);
            fetchRoles();
        } catch (error) {
            console.error('Error en la operación del rol:', error);
            setAlert({
                type: 'error',
                message: '¡Operación fallida!',
                description: 'Error en la operación del rol.',
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
            fetchRoles();
        } catch (error) {
            console.error('Error al asignar permisos:', error);
            setAlert({
                type: 'error',
                message: '¡Operación fallida!',
                description: 'Error al asignar permisos.',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (id) => {
        if (window.confirm('¿Estás seguro de eliminar este rol?')) {
            fetch(`/api/roles/${id}`, { method: 'DELETE' })
                .then((res) => res.json())
                .then(() => {
                    setAlert({
                        type: 'success',
                        message: '¡Operación exitosa!',
                        description: 'El rol fue eliminado correctamente.',
                    });
                    fetchRoles();
                })
                .catch((error) => {
                    console.error('Error al eliminar el rol:', error);
                    setAlert({
                        type: 'error',
                        message: '¡Operación fallida!',
                        description: 'Error al eliminar el rol.',
                    });
                });
        }
    };

    const handleEdit = async (role) => {
        setEditingRoleId(role.id_rol);
        form.setFieldsValue({
            nombreRol: role.nombre_rol,
            descripcion: role.descripcion,
        });
        setEstado(role.estado);
        setIsModalOpen(true);
        setLoadingPermisos(true);
        try {
            const res = await fetch(`/api/roles_permisos/roles/${role.id_rol}/permisos`);
            if (res.ok) {
                const data = await res.json();
                setSelectedPermisos(data.map((p) => p.id_permiso));
            } else {
                setSelectedPermisos([]);
            }
        } catch (e) {
            console.error('Error al cargar permisos:', e);
            setSelectedPermisos([]);
        } finally {
            setLoadingPermisos(false);
        }
    };

    const openPermisosModal = () => {
        if (!editingRoleId) {
            setSelectedPermisos([]); // Ensure no permissions are selected for new role
        }
        setIsPermisosModalOpen(true);
    };

    const openModal = () => {
        setEditingRoleId(null);
        form.resetFields();
        setEstado(true);
        setSelectedPermisos([]); // Reset selected permissions for new role
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingRoleId(null);
        form.resetFields();
        setSelectedPermisos([]);
    };

    const closePermisosModal = () => {
        setIsPermisosModalOpen(false);
    };

    const [detalleVisible, setDetalleVisible] = useState(false);
    const [detalleRol, setDetalleRol] = useState(null);
    const [detallePermisos, setDetallePermisos] = useState([]);

    const handleDetails = async (role) => {
        setDetalleRol(role);
        setDetallePermisos([]);
        setDetalleVisible(true);
        setLoadingPermisos(true);
        try {
            const res = await fetch(`/api/roles_permisos/roles/${role.id_rol}/permisos`);
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
                
                
                <div className="flex space-x-2">
                    {puedeEditar && (
                    <Button
                        icon={<FaEdit size={20} className="text-black" />}
                        onClick={() => handleEdit(role)}
                    />)}
                    {puedeEliminar && (
                    <Button
                        icon={<FaTrash size={20} className="text-red-500" />}
                        onClick={() => handleDelete(role.id_rol)}
                    />)}
                    
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
                    className="flex items-center"
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
                    className={estado ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}
                >
                    {estado ? 'Activo' : 'Inactivo'}
                </span>
            ),
        },
    ];

    return (
        
        <div className="p-5">
            <h2 className="text-2xl font-bold mb-4">Lista de Roles</h2>

            <CustomAlert
                type={alert.type}
                message={alert.message}
                description={alert.description}
                onClose={() => setAlert({ type: '', message: '', description: '' })}
            />

            <div className="flex justify-between items-center mb-4">
                {puedeCrear && (
                <Button type="primary" onClick={openModal} className="ml-2">
                    Crear
                </Button>)}
                <Input
                    placeholder="Buscar..."
                    prefix={<FaSearch />}
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    className="w-64 mr-2"
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
                    showTotal: (total, range) =>
                        `${range[0]}-${range[1]} de ${total} elementos`,
                }}
            />

            <Modal
                title={editingRoleId ? 'Editar Rol' : 'Crear Nuevo Rol'}
                open={isModalOpen}
                onCancel={closeModal}
                footer={null}
                destroyOnClose
            >
                <Spin spinning={loading} tip="Guardando...">
                    <Form form={form} layout="vertical" onFinish={handleSubmit}>
                        <Form.Item
                            label="Nombre del Rol"
                            name="nombreRol"
                            rules={[
                                { required: true, message: 'El nombre es obligatorio' },
                                {
                                    pattern: /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/,
                                    message: 'Solo se permiten letras y espacios',
                                },
                            ]}
                        >
                            <Input
                                placeholder="Ingresa el nombre del rol"
                                className="w-full"
                            />
                        </Form.Item>

                        <Form.Item label="Descripción" name="descripcion">
                            <Input.TextArea
                                placeholder="Ingresa una descripción (opcional)"
                                className="w-full"
                            />
                        </Form.Item>

                        <Form.Item label="Estado">
                            <Select
                                value={estado}
                                onChange={(value) => setEstado(value)}
                                className="w-full"
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
                                className="flex items-center"
                            >
                                Permisos
                            </Button>
                            <div className="flex gap-2">
                                <Button onClick={closeModal}>Cancelar</Button>
                                <Button type="primary" htmlType="submit">
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
                    <Button key="cancel" onClick={closePermisosModal}>
                        Cancelar
                    </Button>,
                    <Button key="submit" type="primary" onClick={handlePermisosSubmit}>
                        Guardar
                    </Button>,
                ]}
                destroyOnClose
            >
                <Spin spinning={loadingPermisos} tip="Cargando permisos...">
                    <List
                        dataSource={permisos}
                        renderItem={(permiso) => (
                            <List.Item>
                                <Checkbox
                                    checked={selectedPermisos.includes(permiso.id_permiso)}
                                    onChange={(e) => {
                                        setSelectedPermisos((prev) =>
                                            e.target.checked
                                                ? [...prev, permiso.id_permiso]
                                                : prev.filter((id) => id !== permiso.id_permiso)
                                        );
                                    }}
                                >
                                    {permiso.nombre_permiso} ({permiso.nombre_modulo})
                                </Checkbox>
                            </List.Item>
                        )}
                    />
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
                        <div className="mt-4">
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
