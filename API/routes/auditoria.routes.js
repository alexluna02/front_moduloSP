const express = require('express');
const router = express.Router();
const auditoriaController = require('../controllers/auditoria.controller');

// Endpoints para auditoría
router.get('/', auditoriaController.getAllAuditoria);
router.get('/:id', auditoriaController.getAuditoriaById);
router.post('/', auditoriaController.createAuditoria);
router.delete('/:id', auditoriaController.deleteAuditoria);

module.exports = router;