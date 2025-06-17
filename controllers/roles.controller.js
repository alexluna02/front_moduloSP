const pool = require('../db');

// Obtener todos los roles
const getAllRoles = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM roles');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error del servidor');
  }
};

// Obtener rol por ID
const getRolById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM roles WHERE id_rol = $1', [id]);
    if (result.rows.length === 0) return res.status(404).send('Rol no encontrado');
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error del servidor');
  }
};

// Crear rol
const createRol = async (req, res) => {
  const { nombre_rol, descripcion } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO roles (nombre_rol, descripcion) VALUES ($1, $2) RETURNING *',
      [nombre_rol, descripcion]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    if (err.code === '23505') {
      res.status(400).send('El nombre del rol ya existe');
    } else {
      res.status(500).send('Error del servidor');
    }
  }
};

// Actualizar rol
const updateRol = async (req, res) => {
  const { id } = req.params;
  const { nombre_rol, descripcion } = req.body;
  try {
    const result = await pool.query(
      'UPDATE roles SET nombre_rol = $1, descripcion = $2 WHERE id_rol = $3 RETURNING *',
      [nombre_rol, descripcion, id]
    );
    if (result.rows.length === 0) return res.status(404).send('Rol no encontrado');
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    if (err.code === '23505') {
      res.status(400).send('El nombre del rol ya existe');
    } else {
      res.status(500).send('Error del servidor');
    }
  }
};

// Eliminar rol
const deleteRol = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'DELETE FROM roles WHERE id_rol = $1 RETURNING *',
      [id]
    );
    if (result.rows.length === 0) return res.status(404).send('Rol no encontrado');
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