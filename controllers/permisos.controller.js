const pool = require('../db');

// Obtener todos los permisos
const getAllPermisos = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM permisos');
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
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error del servidor');
  }
};

// Crear permiso
const createPermiso = async (req, res) => {
  const { nombre_permiso, descripcion } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO permisos (nombre_permiso, descripcion) VALUES ($1, $2) RETURNING *',
      [nombre_permiso, descripcion]
    );
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
  const { nombre_permiso, descripcion } = req.body;
  try {
    const result = await pool.query(
      'UPDATE permisos SET nombre_permiso = $1, descripcion = $2 WHERE id_permiso = $3 RETURNING *',
      [nombre_permiso, descripcion, id]
    );
    if (result.rows.length === 0) return res.status(404).send('Permiso no encontrado');
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