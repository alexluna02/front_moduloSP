// src/components/RoleAdmin.js
import React, { useState, useEffect } from 'react';
import './RoleAdmin.css';  // Aseg�rate de que la ruta sea correcta
import { FaEdit, FaTrash, FaInfoCircle, FaSearch } from 'react-icons/fa';
import { Button, Table, Spin, Modal, Input, Form } from 'antd';
import 'antd/dist/reset.css';
import CustomAlert from '../Alert.js';
import { Select } from 'antd';
import Inicio from '../seguridad/Inicio.js'
const { Option } = Select;
export const listarRoles = async () => {
    try {
        const res = await fetch('/api/roles');
        const data = await res.json();
        return data;
    } catch (err) {
        console.error('Error al cargar roles:', err);
        throw err; // así puedes manejar el error donde la llames
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
        return { success: true, data }; // éxito
    } catch (error) {
        console.error('Error al crear el rol:', error);
        return { success: false, error }; // error
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
        type: '', // 'success', 'error', 'info', 'warning'
        message: '',
        description: '',
    });

    const [errorNombre, setErrorNombre] = useState('');
    const [searchText, setSearchText] = useState('');

    const validarNombre = (valor) => {
        if (!valor || typeof valor !== 'string') return 'El nombre es obligatorio';
        if (!valor.trim()) return 'El nombre es obligatorio';
        if (!/^[A-Za-z������������\s]+$/.test(valor.trim())) {
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

    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedRoles = roles.slice(startIndex, endIndex);


    /*   const handleChangeNombre = (e) => {
           const valor = e.target.value;
           setNombreRol(valor);
           setErrorNombre(validarNombre(valor));
       };
       */
    // Funci�n para traer el listado de roles
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
                    message: '�Operaci�n fallida!',
                    description: 'Error al cargar roles.',
                });
            }).finally(() => {
                setLoading(false); // �importante!
            })
    };

    useEffect(() => {
        fetchRoles();
    }, []);

    const handleSubmit = (e) => {
        setLoading(true);
        e.preventDefault();

        const error = validarNombre(nombreRol);
        setErrorNombre(error);

        if (error) return; // Detiene el env�o si hay error

        const roleData = {
            nombre_rol: nombreRol,
            descripcion,
        };
        if (editingRoleId) {
            fetch(`/api/roles/${editingRoleId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(roleData),
            })
                .then((res) => res.json())
                .then((data) => {
                    setMessage('�Rol actualizado correctamente!');
                    setAlert({
                        type: 'success',
                        message: '�Operaci�n exitosa!',
                        description: 'El rol fue actualizado correctamente.',
                    });
                    setNombreRol('');
                    setDescripcion('');
                    setEditingRoleId(null);
                    setIsModalOpen(false); // Cierra la modal al actualizar
                    fetchRoles();
                })
                .catch((error) => {
                    console.error('Error al actualizar el rol:', error);
                    setMessage('Error al actualizar el rol.');
                    setAlert({
                        type: 'error',
                        message: '�Operaci�n fallida!',
                        description: 'Error al actualizar el rol.',
                    });
                }).finally(() => {
                    setLoading(false);
                });

            ;
        } else {
            fetch('/api/roles', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(roleData),
            })
                .then((res) => res.json())
                .then((data) => {
                    setMessage('�Rol creado correctamente!');
                    setAlert({
                        type: 'success',
                        message: '�Operaci�n exitosa!',
                        description: 'El rol fue creado correctamente.',
                    });
                    setNombreRol('');
                    setDescripcion('');
                    setIsModalOpen(false); // Cierra la modal al crear el rol
                    fetchRoles();
                })
                .catch((error) => {
                    console.error('Error al crear el rol:', error);
                    setMessage('Error al crear el rol.');
                    setAlert({
                        type: 'error',
                        message: '�Operaci�n fallida!',
                        description: 'Error al crear el rol.',
                    });
                });
        }
    };

    const handleDelete = (id) => {
        if (window.confirm('�Est�s seguro de eliminar este rol?')) {
            fetch(`/api/roles/${id}`, { method: 'DELETE' })
                .then((res) => res.json())
                .then((data) => {
                    setMessage('�Rol eliminado correctamente!');
                    setAlert({
                        type: 'success',
                        message: '�Operaci�n exitosa!',
                        description: 'El rol fue eliminado correctamente.',
                    });
                    fetchRoles();
                })
                .catch((error) => {
                    console.error('Error al eliminar el rol:', error);
                    setMessage('Error al eliminar el rol.');
                    setAlert({
                        type: 'error',
                        message: '�Operaci�n fallida!',
                        description: 'Error al eliminar el rol.',
                    });
                });
        }
    };

    const handleEdit = (role) => {
        setEditingRoleId(role.id_rol);
        setNombreRol(role.nombre_rol);
        setDescripcion(role.descripcion);
        setIsModalOpen(true); // Abre la modal cuando se edita
    };

    const openModal = () => {
        // Resetea los valores cuando se abre la modal
        setEditingRoleId(null);
        setNombreRol('');
        setDescripcion('');
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingRoleId(null);
        setNombreRol('');
        setDescripcion('');
    };

    const handleDetails = (role) => {
        window.confirm(
            `Detalles del rol:\nNombre: ${role.nombre_rol}\nDescripci�n: ${role.descripcion}`
        );
    };


    const columns = [{
        title: 'Acciones',
        key: 'acciones',
        render: (_, role) => (
            <>
                <Button
                    icon={<FaEdit size={20} color="#007bff" />}
                    onClick={() => handleEdit(role)}
                    style={{ marginRight: 8 }}
                />

                <Button
                    icon={<FaInfoCircle size={20} color="#28a745" />}
                    onClick={() => handleDetails(role)}
                    style={{ marginRight: 8 }}
                />
                <Button
                    icon={<FaTrash size={20} color="#dc3545" />}
                    onClick={() => handleDelete(role.id_rol)}
                />
            </>
        ),
    }, { title: 'ID', dataIndex: 'id_rol', key: 'id_rol', sorter: (a, b) => a.id - b.id },
    { title: 'Roles', dataIndex: 'nombre_rol', key: 'nombre_rol', sorter: (a, b) => a.name.localeCompare(b.name) },
    { title: 'Descripci�n', dataIndex: 'descripcion', key: 'descripcion', sorter: (a, b) => a.name.localeCompare(b.name) },
    {
        title: 'Estado', dataIndex: 'estado', key: 'estado', render: (estado) => (<span style={{
            color: estado ? 'green' : 'red',
            fontWeight: 'bold'
        }}>
            {estado ? 'Activo' : 'Inactivo'}
        </span>
        )
    }

    ]

    return (
        <div style={{ padding: 20 }}>
            <h2 className='titulo'>Lista de Roles</h2>

            <CustomAlert
                type={alert.type}
                message={alert.message}
                description={alert.description}
                onClose={() => setAlert({ type: '', message: '', description: '' })}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div style={{ marginLeft: 10 }} >
                    <Button type="primary" onClick={openModal}>
                        Create New
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

            <Table dataSource={filteredRoles} columns={columns} rowKey="id_rol" loading={loading} pagination={{
                current: currentPage,
                pageSize,
                total: roles.length,
                onChange: (page, pageSize) => {
                    setCurrentPage(page);
                    setPageSize(pageSize);
                },
                showSizeChanger: true,
                pageSizeOptions: ['10', '20', '30', '50'],
                showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} elementos`
            }}

            />

            {/* Ventana Modal */}
            <Modal
                title={editingRoleId ? 'Editar Rol' : 'Crear Nuevo Rol'}
                open={isModalOpen}
                onCancel={closeModal}
                footer={null}
                destroyOnHidden
            >
                <Spin spinning={loading} tip="Guardando...">
                    <Form layout="vertical">
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
                                <p style={{ color: 'red', marginTop: 4 }}>{errorNombre}</p>
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
                            <Select value={estado} onChange={(value) => setEstado(value)}>
                                <Option value={true}>Activo</Option>
                                <Option value={false}>Inactivo</Option>
                            </Select>
                        </Form.Item>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                            <Button onClick={closeModal} className="modal-action-button">Cancelar</Button> {}
                            <Button type="primary" onClick={handleSubmit} className="modal-action-button"> {}
                                {editingRoleId ? 'Actualizar Rol' : 'Guardar'} {}
                            </Button>
                        </div>


                    </Form>
                </Spin>
            </Modal>

        </div>
    );

};

export default RoleAdmin;