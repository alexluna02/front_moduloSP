const express = require('express');
const router = express.Router();
const rolesController = require('../controllers/roles.controller');

// Endpoints para roles
router.get('/', rolesController.getAllRoles);
router.get('/:id', rolesController.getRolById);
router.post('/', rolesController.createRol);
router.put('/:id', rolesController.updateRol);
router.delete('/:id', rolesController.deleteRol);

module.exports = router;