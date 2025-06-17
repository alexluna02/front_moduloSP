const express = require('express');
const router = express.Router();
const controller = require('../controllers/roles_permisos.controller');

// Obtener todos los permisos de un rol
router.get('/:id_rol', controller.getPermisosByRol);

// Asignar un permiso a un rol
router.post('/', controller.addPermisoToRol);

// Quitar un permiso de un rol
router.delete('/', controller.removePermisoFromRol);

module.exports = router;