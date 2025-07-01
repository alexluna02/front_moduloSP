const pool = require('../db');
const { registrarAuditoria } = require('../controllers/auditoria.controller');

const getAllRoles = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM roles');

    await registrarAuditoria({
      accion: 'SELECT',
      modulo: 'seguridad',
      tabla: 'roles',
      id_usuario: req.usuario?.id_usuario || null,
      details: { consulta: 'SELECT * FROM roles' },
      nombre_rol: req.usuario?.nombre_rol || 'Sistema'
    });

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error del servidor');
  }
};

const getRolById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM roles WHERE id_rol = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).send('Rol no encontrado');
    }

    await registrarAuditoria({
      accion: 'SELECT',
      modulo: 'seguridad',
      tabla: 'roles',
      id_usuario: req.usuario?.id_usuario || null,
      details: { consulta: 'SELECT * FROM roles WHERE id_rol = $1', parametros: [id] },
      nombre_rol: req.usuario?.nombre_rol || 'Sistema'
    });

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error del servidor');
  }
};

const createRol = async (req, res) => {
  const { nombre_rol, descripcion, estado } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO roles (nombre_rol, descripcion, estado) VALUES ($1, $2, $3) RETURNING *',
      [nombre_rol, descripcion, estado ?? true]
    );

    await registrarAuditoria({
      accion: 'INSERT',
      modulo: 'seguridad',
      tabla: 'roles',
      id_usuario: req.usuario?.id_usuario || null,
      details: result.rows[0],
      nombre_rol: req.usuario?.nombre_rol || 'Sistema'
    });

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error del servidor');
  }
};

const updateRol = async (req, res) => {
  const { id } = req.params;
  const { nombre_rol, descripcion, estado } = req.body;
  try {
    const result = await pool.query(
      'UPDATE roles SET nombre_rol = $1, descripcion = $2, estado = $3 WHERE id_rol = $4 RETURNING *',
      [nombre_rol, descripcion, estado, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).send('Rol no encontrado');
    }

    await registrarAuditoria({
      accion: 'UPDATE',
      modulo: 'seguridad',
      tabla: 'roles',
      id_usuario: req.usuario?.id_usuario || null,
      details: result.rows[0],
      nombre_rol: req.usuario?.nombre_rol || 'Sistema'
    });

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error del servidor');
  }
};

const deleteRol = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'DELETE FROM roles WHERE id_rol = $1 RETURNING *',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).send('Rol no encontrado');
    }

    try {
      await registrarAuditoria({
        accion: 'DELETE',
        modulo: 'seguridad',
        tabla: 'roles',
        id_usuario: req.usuario?.id_usuario || null,
        details: result.rows[0],
        nombre_rol: req.usuario?.nombre_rol || 'Sistema'
      });
    } catch (auditError) {
      console.error('Error al registrar auditoría:', auditError.message);
    }

    res.json({ mensaje: 'Rol eliminado correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error del servidor');
  }
};

module.exports = {
  getAllRoles,
  getRolById,
  createRol,
  updateRol,
  deleteRol
};