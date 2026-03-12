const DashboardModel = require('../models/DashboardModel');

const getStats = async (_req, res) => {
  try {
    const stats = await DashboardModel.getDashboardStats();

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

