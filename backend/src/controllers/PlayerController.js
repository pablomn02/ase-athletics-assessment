const Joi = require('joi');
const PlayerModel = require('../models/PlayerModel');

const listPlayers = async (req, res) => {
  const page = Number(req.query.page) > 0 ? Number(req.query.page) : 1;
  const rawLimit = Number(req.query.limit);
  const limit = rawLimit >= 20 && rawLimit <= 30 ? rawLimit : 25;

  const filters = {
    position: req.query.position,
    team: req.query.team,
    nationality: req.query.nationality,
    minAge: req.query.minAge,
    maxAge: req.query.maxAge,
    minMarketValue: req.query.minMarketValue,
    maxMarketValue: req.query.maxMarketValue,
  };

  try {
    const { players, total } = await PlayerModel.getPlayers({
      page,
      limit,
      filters,
    });

    return res.json({
      ok: true,
      data: players,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    console.error('Error al listar jugadores:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error interno del servidor al listar jugadores',
    });
  }
};

const getPlayer = async (req, res) => {
  const id = Number(req.params.id);

  if (!id || Number.isNaN(id)) {
    return res.status(400).json({
      ok: false,
      message: 'ID de jugador no válido',
    });
  }

  try {
    const player = await PlayerModel.getPlayerById(id);

    if (!player) {
      return res.status(404).json({
        ok: false,
        message: 'Jugador no encontrado',
      });
    }

    return res.json({
      ok: true,
      data: player,
    });
  } catch (error) {
    console.error('Error al obtener jugador:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error interno del servidor al obtener jugador',
    });
  }
};

const createPlayerSchema = Joi.object({
  name: Joi.string().min(2).max(150).required(),
  position: Joi.string().max(50).allow(null, ''),
  age: Joi.number().integer().min(10).max(60).allow(null),
  team: Joi.string().max(100).allow(null, ''),
  nationality: Joi.string().max(100).allow(null, ''),
  height: Joi.number().precision(2).allow(null),
  weight: Joi.number().precision(2).allow(null),
  goals: Joi.number().integer().min(0).allow(null),
  assists: Joi.number().integer().min(0).allow(null),
  appearances: Joi.number().integer().min(0).allow(null),
  contract_salary: Joi.number().precision(2).allow(null),
  contract_end: Joi.date().iso().allow(null),
  market_value: Joi.number().precision(2).allow(null),
  attributes: Joi.object({
    pace: Joi.number().integer().min(1).max(10),
    shooting: Joi.number().integer().min(1).max(10),
    passing: Joi.number().integer().min(1).max(10),
    defending: Joi.number().integer().min(1).max(10),
    dribbling: Joi.number().integer().min(1).max(10),
    physicality: Joi.number().integer().min(1).max(10),
  }).optional(),
});

const createPlayer = async (req, res) => {
  const { error, value } = createPlayerSchema.validate(req.body, {
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
    const player = await PlayerModel.createPlayer(value);

    return res.status(201).json({
      ok: true,
      message: 'Jugador creado correctamente',
      data: player,
    });
  } catch (err) {
    console.error('Error al crear jugador:', err);
    return res.status(500).json({
      ok: false,
      message: 'Error interno del servidor al crear jugador',
    });
  }
};

const updatePlayer = async (req, res) => {
  const id = Number(req.params.id);

  if (!id || Number.isNaN(id)) {
    return res.status(400).json({
      ok: false,
      message: 'ID de jugador no válido',
    });
  }

  const { error, value } = createPlayerSchema.validate(req.body, {
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
    const player = await PlayerModel.updatePlayer(id, value);

    if (!player) {
      return res.status(404).json({
        ok: false,
        message: 'Jugador no encontrado',
      });
    }

    return res.json({
      ok: true,
      message: 'Jugador actualizado correctamente',
      data: player,
    });
  } catch (err) {
    console.error('Error al actualizar jugador:', err);
    return res.status(500).json({
      ok: false,
      message: 'Error interno del servidor al actualizar jugador',
    });
  }
};

const deletePlayer = async (req, res) => {
  const id = Number(req.params.id);

  if (!id || Number.isNaN(id)) {
    return res.status(400).json({
      ok: false,
      message: 'ID de jugador no válido',
    });
  }

  try {
    const deleted = await PlayerModel.deletePlayer(id);

    if (!deleted) {
      return res.status(404).json({
        ok: false,
        message: 'Jugador no encontrado',
      });
    }

    return res.status(204).send();
  } catch (err) {
    console.error('Error al eliminar jugador:', err);
    return res.status(500).json({
      ok: false,
      message: 'Error interno del servidor al eliminar jugador',
    });
  }
};

const searchPlayers = async (req, res) => {
  const q = (req.query.q || '').trim();
  const page = Number(req.query.page) > 0 ? Number(req.query.page) : 1;
  const rawLimit = Number(req.query.limit);
  const limit = rawLimit >= 20 && rawLimit <= 30 ? rawLimit : 25;

  if (!q) {
    return res.status(400).json({
      ok: false,
      message: 'Parámetro de búsqueda "q" requerido',
    });
  }

  const filters = {
    position: req.query.position,
    team: req.query.team,
    nationality: req.query.nationality,
    minAge: req.query.minAge,
    maxAge: req.query.maxAge,
    minMarketValue: req.query.minMarketValue,
    maxMarketValue: req.query.maxMarketValue,
  };

  try {
    const { players, total } = await PlayerModel.searchPlayers({
      q,
      page,
      limit,
      filters,
    });

    return res.json({
      ok: true,
      data: players,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
        q,
      },
    });
  } catch (error) {
    console.error('Error al buscar jugadores:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error interno del servidor al buscar jugadores',
    });
  }
};

module.exports = {
  listPlayers,
  getPlayer,
  createPlayer,
  updatePlayer,
  deletePlayer,
  searchPlayers,
};

