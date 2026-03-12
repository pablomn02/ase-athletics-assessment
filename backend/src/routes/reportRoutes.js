const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const {
  listReports,
  createReport,
  updateReport,
  deleteReport,
} = require('../controllers/ReportController');

const router = express.Router();

// GET /api/reports        - Listado de reportes (filtros por jugador/scout)
router.get('/', authMiddleware, listReports);

// POST /api/reports       - Crear reporte nuevo
router.post('/', authMiddleware, createReport);

// PUT /api/reports/:id    - Actualizar reporte
router.put('/:id', authMiddleware, updateReport);

// DELETE /api/reports/:id - Eliminar reporte
router.delete('/:id', authMiddleware, deleteReport);

module.exports = router;

