const jwt = require('jsonwebtoken');
const path = require('path');

// Carga variables de entorno desde backend/.env
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

/**
 * Middleware para proteger rutas con JWT.
 * Espera el token en el header Authorization: Bearer <token>
 */
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      ok: false,
      message: 'No se proporcionó token de autenticación',
    });
  }

  const token = authHeader.split(' ')[1];
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    console.error('JWT_SECRET no está definido en el archivo .env');
    return res.status(500).json({
      ok: false,
      message: 'Configuración JWT no disponible',
    });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    // Adjuntamos los datos del usuario al request para uso posterior
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      name: decoded.name,
    };
    next();
  } catch (error) {
    console.error('Error al verificar token JWT:', error);
    return res.status(401).json({
      ok: false,
      message: 'Token no válido o expirado',
    });
  }
};

module.exports = authMiddleware;

