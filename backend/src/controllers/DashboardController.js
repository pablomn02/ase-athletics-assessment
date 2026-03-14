const DashboardModel = require('../models/DashboardModel');

const getStats = async (req, res) => {
  try {
    const filters = {};
    if (req.query.team?.trim()) filters.team = req.query.team.trim();
    if (req.query.position?.trim()) filters.position = req.query.position.trim();
    if (req.query.minAge !== undefined && req.query.minAge !== '') filters.minAge = req.query.minAge;
    if (req.query.maxAge !== undefined && req.query.maxAge !== '') filters.maxAge = req.query.maxAge;
    const stats = await DashboardModel.getDashboardStats(filters);

    return res.json({
      ok: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error al obtener estadísticas del dashboard:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error interno del servidor al obtener estadísticas',
    });
  }
};

module.exports = {
  getStats,
};

