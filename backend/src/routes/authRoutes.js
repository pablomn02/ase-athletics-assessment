const express = require('express');
const Joi = require('joi');
const { register, login, logout } = require('../controllers/AuthController');

const router = express.Router();

// Esquemas de validación con Joi
const registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(128).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(128).required(),
});

const validateBody = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });

  if (error) {
    return res.status(400).json({
      ok: false,
      message: 'Datos de entrada no válidos',
      details: error.details.map((d) => d.message),
    });
  }

  next();
};

// POST /api/auth/register
router.post('/register', validateBody(registerSchema), register);

// POST /api/auth/login
router.post('/login', validateBody(loginSchema), login);

// POST /api/auth/logout
router.post('/logout', logout);

module.exports = router;
