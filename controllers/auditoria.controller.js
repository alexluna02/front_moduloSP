const pool = require('../db');

async function registrarAuditoria({
  accion,
  modulo,
  tabla,
  id_usuario,
  details,
  nombre_rol = 'Sistema'
}) {
  const query = `
    INSERT INTO auditoria (
      accion, modulo, tabla, id_usuario, details, timestamp, nombre_rol
    ) VALUES ($1, $2, $3, $4, $5, NOW(), $6)
  `;
  const values = [
    accion,
    modulo,
    tabla,
    id_usuario, // Permitir null si no hay usuario
    details ? JSON.stringify(details) : null,
    nombre_rol
  ];

  try {
    await pool.query(query, values);
  } catch (error) {
    console.error('Error al registrar auditoría:', error.message);
    throw error; // Propagar el error al controlador que llama
  }
}

const getAllAuditoria = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM auditoria ORDER BY timestamp DESC');
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al obtener auditorías');
  }
};

const getAuditoriaById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM auditoria WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).send('Auditoría no encontrada');
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al obtener auditoría');
  }
};

const createAuditoria = async (req, res) => {
  const { accion, modulo, tabla, id_usuario, details, nombre_rol } = req.body;
  try {
    const query = `
      INSERT INTO auditoria (
        accion, modulo, tabla, id_usuario, details, timestamp, nombre_rol
      ) VALUES ($1, $2, $3, $4, $5, NOW(), $6) RETURNING *
    `;
    const values = [
      accion,
      modulo,
      tabla,
      id_usuario,
      details ? JSON.stringify(details) : null,
      nombre_rol || 'Sistema'
    ];
    const result = await pool.query(query, values);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al crear auditoría');
  }
};

const updateAuditoria = async (req, res) => {
  const { id } = req.params;
  const { accion, modulo, tabla, id_usuario, details, nombre_rol } = req.body;
  try {
    const query = `
      UPDATE auditoria SET accion=$1, modulo=$2, tabla=$3, id_usuario=$4, details=$5, nombre_rol=$6, timestamp=NOW()
      WHERE id=$7 RETURNING *
    `;
    const values = [
      accion,
      modulo,
      tabla,
      id_usuario,
      details ? JSON.stringify(details) : null,
      nombre_rol || 'Sistema',
      id
    ];
    const result = await pool.query(query, values);
    if (result.rows.length === 0) return res.status(404).send('Auditoría no encontrada');
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al actualizar auditoría');
  }
};

const deleteAuditoria = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM auditoria WHERE id=$1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).send('Auditoría no encontrada');
    res.json({ mensaje: 'Auditoría eliminada correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al eliminar auditoría');
  }
};

module.exports = {
  registrarAuditoria,
  getAllAuditoria,
  getAuditoriaById,
  createAuditoria,
  updateAuditoria,
  deleteAuditoria
};