const express = require('express');
const router = express.Router();
const controller = require('../controllers/usuarios_roles.controller');

// Obtener todos los roles de un usuario
router.get('/:id_usuario', controller.getRolesByUsuario);

// Asignar un rol a un usuario
router.post('/', controller.addRolToUsuario);

// Quitar un rol a un usuario
router.delete('/', controller.removeRolFromUsuario);

module.exports = router;