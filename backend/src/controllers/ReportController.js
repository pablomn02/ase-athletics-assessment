const Joi = require('joi');
const ReportModel = require('../models/ReportModel');

const reportSchema = Joi.object({
  player_id: Joi.number().integer().positive().required(),
  scout_id: Joi.number().integer().positive().allow(null),
  match_date: Joi.date().iso().allow(null),
  overall_rating: Joi.number().integer().min(1).max(10).required(),
  strengths: Joi.string().allow('', null),
  weaknesses: Joi.string().allow('', null),
  recommendation: Joi.string().allow('', null),
});

const getReport = async (req, res) => {
  const id = Number(req.params.id);
  if (!id || Number.isNaN(id)) {
    return res.status(400).json({
      ok: false,
      message: 'ID de reporte no válido',
    });
  }
  try {
    const report = await ReportModel.getReportById(id);
    if (!report) {
      return res.status(404).json({
        ok: false,
        message: 'Reporte no encontrado',
      });
    }
    return res.json({
      ok: true,
      data: report,
    });
  } catch (error) {
    console.error('Error al obtener reporte:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error interno del servidor al obtener el reporte',
    });
  }
};

const listReports = async (req, res) => {
  const page = Number(req.query.page) > 0 ? Number(req.query.page) : 1;
  const limit = Number(req.query.limit) > 0 ? Number(req.query.limit) : 20;
  const playerId = req.query.playerId;
  const scoutId = req.query.scoutId;

  try {
    const { reports, total } = await ReportModel.listReports({
      page,
      limit,
      playerId,
      scoutId,
    });

    return res.json({
      ok: true,
      data: reports,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    console.error('Error al listar reportes:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error interno del servidor al listar reportes',
    });
  }
};

const createReport = async (req, res) => {
  const { error, value } = reportSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    return res.status(400).json({
      ok: false,
      message: 'Datos de entrada no válidos',
      details: error.details.map((d) => d.message),
    });
  }

  try {
    const report = await ReportModel.createReport(value);

    return res.status(201).json({
      ok: true,
      message: 'Reporte creado correctamente',
      data: report,
    });
  } catch (err) {
    console.error('Error al crear reporte:', err);
    return res.status(500).json({
      ok: false,
      message: 'Error interno del servidor al crear reporte',
    });
  }
};

const updateReport = async (req, res) => {
  const id = Number(req.params.id);

  if (!id || Number.isNaN(id)) {
    return res.status(400).json({
      ok: false,
      message: 'ID de reporte no válido',
    });
  }

  const { error, value } = reportSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    return res.status(400).json({
      ok: false,
      message: 'Datos de entrada no válidos',
      details: error.details.map((d) => d.message),
    });
  }

  try {
    const report = await ReportModel.updateReport(id, value);

    if (!report) {
      return res.status(404).json({
        ok: false,
        message: 'Reporte no encontrado',
      });
    }

    return res.json({
      ok: true,
      message: 'Reporte actualizado correctamente',
      data: report,
    });
  } catch (err) {
    console.error('Error al actualizar reporte:', err);
    return res.status(500).json({
      ok: false,
      message: 'Error interno del servidor al actualizar reporte',
    });
  }
};

const deleteReport = async (req, res) => {
  const id = Number(req.params.id);

  if (!id || Number.isNaN(id)) {
    return res.status(400).json({
      ok: false,
      message: 'ID de reporte no válido',
    });
  }

  try {
    const deleted = await ReportModel.deleteReport(id);

    if (!deleted) {
      return res.status(404).json({
        ok: false,
        message: 'Reporte no encontrado',
      });
    }

    return res.status(204).send();
  } catch (err) {
    console.error('Error al eliminar reporte:', err);
    return res.status(500).json({
      ok: false,
      message: 'Error interno del servidor al eliminar reporte',
    });
  }
};

module.exports = {
  getReport,
  listReports,
  createReport,
  updateReport,
  deleteReport,
};

