const pool = require('../db'); // Asume que tienes un archivo de configuración de DB

const getAllUsuarios = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM usuarios');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error del servidor');
  }
};

const getUsuarioById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM usuarios WHERE id_usuario = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).send('Usuario no encontrado');
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error del servidor');
  }
};

// Crear usuario
const createUsuario = async (req, res) => {
  const { usuario, contrasena, estado } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO usuarios (usuario, contrasena, estado) VALUES ($1, $2, $3) RETURNING *',
      [usuario, contrasena, estado ?? true]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    if (err.code === '23505') { // Unique violation
      res.status(400).send('El usuario ya existe');
    } else {
      res.status(500).send('Error del servidor');
    }
  }
};

// Actualizar usuario
const updateUsuario = async (req, res) => {
  const { id } = req.params;
  const { usuario, contrasena, estado } = req.body;
  try {
    const result = await pool.query(
      'UPDATE usuarios SET usuario = $1, contrasena = $2, estado = $3 WHERE id_usuario = $4 RETURNING *',
      [usuario, contrasena, estado, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).send('Usuario no encontrado');
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    if (err.code === '23505') {
      res.status(400).send('El usuario ya existe');
    } else {
      res.status(500).send('Error del servidor');
    }
  }
};

// Eliminar usuario
const deleteUsuario = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'DELETE FROM usuarios WHERE id_usuario = $1 RETURNING *',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).send('Usuario no encontrado');
    }
    res.json({ mensaje: 'Usuario eliminado correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error del servidor');
  }
};

module.exports = {
  getAllUsuarios,
  getUsuarioById,
  createUsuario,
  updateUsuario,
  deleteUsuario
};