const pool = require('../db');

// Obtener todos los roles de un usuario
const getRolesByUsuario = async (req, res) => {
  const { id_usuario } = req.params;
  try {
    const result = await pool.query(
      `SELECT r.* FROM usuarios_roles ur
       JOIN roles r ON ur.id_rol = r.id_rol
       WHERE ur.id_usuario = $1`, [id_usuario]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error del servidor');
  }
};

// Asignar un rol a un usuario
const addRolToUsuario = async (req, res) => {
  const { id_usuario, id_rol } = req.body;
  try {
    await pool.query(
      'INSERT INTO usuarios_roles (id_usuario, id_rol) VALUES ($1, $2)',
      [id_usuario, id_rol]
    );
    res.status(201).json({ mensaje: 'Rol asignado al usuario' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error del servidor');
  }
};

// Quitar un rol a un usuario
const removeRolFromUsuario = async (req, res) => {
  const { id_usuario, id_rol } = req.body;
  try {
    const result = await pool.query(
      'DELETE FROM usuarios_roles WHERE id_usuario = $1 AND id_rol = $2 RETURNING *',
      [id_usuario, id_rol]
    );
    if (result.rows.length === 0) return res.status(404).send('Relación no encontrada');
    res.json({ mensaje: 'Rol quitado del usuario' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error del servidor');
  }
};

module.exports = {
  getRolesByUsuario,
  addRolToUsuario,
  removeRolFromUsuario
};