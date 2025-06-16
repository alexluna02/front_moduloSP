const pool = require('../db');

// Obtener todos los registros de auditoría
const getAllAuditoria = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM auditoria');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error del servidor');
  }
};

// Obtener registro de auditoría por ID
const getAuditoriaById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM auditoria WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).send('Registro no encontrado');
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error del servidor');
  }
};

// Crear registro de auditoría
const createAuditoria = async (req, res) => {
  const { accion, tabla, id_usuario, id_rol, details, modulo } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO auditoria (accion, tabla, id_usuario, id_rol, details, modulo) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [accion, tabla, id_usuario, id_rol, details, modulo]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error del servidor');
  }
};

// Eliminar registro de auditoría
const deleteAuditoria = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'DELETE FROM auditoria WHERE id = $1 RETURNING *',
      [id]
    );
    if (result.rows.length === 0) return res.status(404).send('Registro no encontrado');
    res.json({ mensaje: 'Registro eliminado correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error del servidor');
  }
};

module.exports = {
  getAllAuditoria,
  getAuditoriaById,
  createAuditoria,
  deleteAuditoria
};