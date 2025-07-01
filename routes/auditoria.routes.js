const express = require('express');
const router = express.Router();
const auditoriaController = require('../controllers/auditoria.controller');

// Endpoints para auditoría
router.get('/', auditoriaController.getAllAuditoria);
router.get('/:id', auditoriaController.getAuditoriaById);
//Export
module.exports = router;