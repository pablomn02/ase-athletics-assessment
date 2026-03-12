const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { getStats } = require('../controllers/DashboardController');

const router = express.Router();

// GET /api/dashboard/stats
router.get('/stats', authMiddleware, getStats);

module.exports = router;

