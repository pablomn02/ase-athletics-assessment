const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const {
  listPlayers,
  getPlayer,
  createPlayer,
  updatePlayer,
  deletePlayer,
  searchPlayers,
} = require('../controllers/PlayerController');

const router = express.Router();

// GET /api/players        - Listado paginado con filtros
router.get('/', authMiddleware, listPlayers);

// GET /api/players/search - Búsqueda por texto
router.get('/search', authMiddleware, searchPlayers);

// GET /api/players/:id    - Detalle de jugador
router.get('/:id', authMiddleware, getPlayer);

// POST /api/players       - Crear nuevo jugador
router.post('/', authMiddleware, createPlayer);

// PUT /api/players/:id    - Actualizar jugador existente
router.put('/:id', authMiddleware, updatePlayer);

// DELETE /api/players/:id - Eliminar jugador
router.delete('/:id', authMiddleware, deletePlayer);

module.exports = router;
