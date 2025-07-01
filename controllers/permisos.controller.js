const pool = require('../db');
const { registrarAuditoria } = require('../controllers/auditoria.controller');

// Obtener todos los permisos
const getAllPermisos = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM permisos ORDER BY id_permiso');

    await registrarAuditoria({
      accion: 'SELECT',
      modulo: 'seguridad',
      tabla: 'permisos',
      id_usuario: req.usuario?.id_usuario || null,
      details: { consulta: 'SELECT * FROM permisos' },
      nombre_rol: req.usuario?.nombre_rol || 'Sistema'
    });

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error del servidor');
  }
};

// Obtener permiso por ID
const getPermisoById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM permisos WHERE id_permiso = $1', [id]);
    if (result.rows.length === 0) return res.status(404).send('Permiso no encontrado');

    await registrarAuditoria({
      accion: 'SELECT',
      modulo: 'seguridad',
      tabla: 'permisos',
      id_usuario: req.usuario?.id_usuario || null,
      details: { consulta: 'SELECT * FROM permisos WHERE id_permiso = $1', parametros: [id] },
      nombre_rol: req.usuario?.nombre_rol || 'Sistema'
    });

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error del servidor');
  }
};

// Crear permiso
const createPermiso = async (req, res) => {
  const { nombre_permiso, descripcion, estado } = req.body;

  if (typeof estado !== 'boolean') {
    return res.status(400).send('El campo "estado" debe ser booleano');
  }

  try {
    const result = await pool.query(
      'INSERT INTO permisos (nombre_permiso, descripcion, estado) VALUES ($1, $2, $3) RETURNING *',
      [nombre_permiso, descripcion, estado]
    );

    await registrarAuditoria({
      accion: 'INSERT',
      modulo: 'seguridad',
      tabla: 'permisos',
      id_usuario: req.usuario?.id_usuario || null,
      details: result.rows[0],
      nombre_rol: req.usuario?.nombre_rol || 'Sistema'
    });

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    if (err.code === '23505') {
      res.status(400).send('El nombre del permiso ya existe');
    } else {
      res.status(500).send('Error del servidor');
    }
  }
};

// Actualizar permiso
const updatePermiso = async (req, res) => {
  const { id } = req.params;
  const { nombre_permiso, descripcion, estado } = req.body;

  if (typeof estado !== 'boolean') {
    return res.status(400).send('El campo "estado" debe ser booleano');
  }

  try {
    const result = await pool.query(
      'UPDATE permisos SET nombre_permiso = $1, descripcion = $2, estado = $3 WHERE id_permiso = $4 RETURNING *',
      [nombre_permiso, descripcion, estado, id]
    );
    if (result.rows.length === 0) return res.status(404).send('Permiso no encontrado');

    await registrarAuditoria({
      accion: 'UPDATE',
      modulo: 'seguridad',
      tabla: 'permisos',
      id_usuario: req.usuario?.id_usuario || null,
      details: result.rows[0],
      nombre_rol: req.usuario?.nombre_rol || 'Sistema'
    });

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    if (err.code === '23505') {
      res.status(400).send('El nombre del permiso ya existe');
    } else {
      res.status(500).send('Error del servidor');
    }
  }
};

// Eliminar permiso
const deletePermiso = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'DELETE FROM permisos WHERE id_permiso = $1 RETURNING *',
      [id]
    );
    if (result.rows.length === 0) return res.status(404).send('Permiso no encontrado');

    await registrarAuditoria({
      accion: 'DELETE',
      modulo: 'seguridad',
      tabla: 'permisos',
      id_usuario: req.usuario?.id_usuario || null,
      details: result.rows[0],
      nombre_rol: req.usuario?.nombre_rol || 'Sistema'
    });

    res.json({ mensaje: 'Permiso eliminado correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error del servidor');
  }
};

module.exports = {
  getAllPermisos,
  getPermisoById,
  createPermiso,
  updatePermiso,
  deletePermiso
};