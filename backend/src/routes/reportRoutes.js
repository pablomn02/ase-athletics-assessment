const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const {
  listReports,
  getReport,
  createReport,
  updateReport,
  deleteReport,
} = require('../controllers/ReportController');

const router = express.Router();

// Log todas las peticiones a /api/reports para depurar
router.use((req, res, next) => {
  console.log('[reports]', req.method, req.originalUrl);
  next();
});

// Ruta de prueba SIN auth: GET /api/reports/ping → responde { ok: true }
router.get('/ping', (req, res) => {
  res.json({ ok: true, message: 'Reports router OK' });
});

// GET /api/reports        - Listado de reportes (filtros por jugador/scout)
router.get('/', authMiddleware, listReports);

// GET /api/reports/detail/:id - Detalle de un reporte (para edición)
router.get('/detail/:id', authMiddleware, getReport);

// GET /api/reports/:id    - Detalle (alternativa; algunos clientes usan esta)
router.get('/:id', authMiddleware, getReport);

// POST /api/reports       - Crear reporte nuevo
router.post('/', authMiddleware, createReport);

// PUT /api/reports/:id    - Actualizar reporte
router.put('/:id', authMiddleware, updateReport);

// DELETE /api/reports/:id - Eliminar reporte
router.delete('/:id', authMiddleware, deleteReport);

module.exports = router;

