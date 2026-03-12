const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');

// Carga variables de entorno desde backend/.env
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const register = async (req, res) => {
  const { name, email, password } = req.body || {};

  try {
    const client = await pool.connect();

    try {
      // Verificar si ya existe un usuario con ese email
      const existingUser = await client.query(
        'SELECT id FROM users WHERE email = $1',
        [email]
      );

      if (existingUser.rows.length > 0) {
        return res.status(409).json({
          ok: false,
          message: 'Ya existe un usuario registrado con ese email',
        });
      }

      // Cifrar la contraseña
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Guardar usuario en la base de datos
      const insertResult = await client.query(
        `INSERT INTO users (name, email, password_hash)
         VALUES ($1, $2, $3)
         RETURNING id, name, email`,
        [name, email, hashedPassword]
      );

      const newUser = insertResult.rows[0];

      return res.status(201).json({
        ok: true,
        message: 'Usuario registrado correctamente',
        user: newUser,
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error en registro de usuario:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error interno del servidor durante el registro',
    });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body || {};

  try {
    const client = await pool.connect();

    try {
      // Verificar si el usuario existe
      const userResult = await client.query(
        `SELECT id, name, email, password_hash
         FROM users
         WHERE email = $1`,
        [email]
      );

      if (userResult.rows.length === 0) {
        return res.status(401).json({
          ok: false,
          message: 'Credenciales inválidas',
        });
      }

      const user = userResult.rows[0];

      // Comparar contraseña ingresada con el hash guardado
      const isMatch = await bcrypt.compare(password, user.password_hash);

      if (!isMatch) {
        return res.status(401).json({
          ok: false,
          message: 'Credenciales inválidas',
        });
      }

      // Generar token JWT
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        console.error('JWT_SECRET no está definido en el archivo .env');
        return res.status(500).json({
          ok: false,
          message: 'Configuración JWT no disponible',
        });
      }

      const token = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          name: user.name,
        },
        jwtSecret,
        {
          expiresIn: process.env.JWT_EXPIRES_IN || '1h',
        }
      );

      return res.status(200).json({
        ok: true,
        message: 'Login exitoso',
        token,
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error en login de usuario:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error interno del servidor durante el login',
    });
  }
};

/**
 * Logout "stateless" con JWT.
 * En JWT el cliente normalmente borra el token en el front.
 * Este endpoint se incluye para cumplir el contrato del brief.
 */
const logout = async (_req, res) => {
  return res.status(200).json({
    ok: true,
    message: 'Logout exitoso. Por favor elimina el token en el cliente.',
  });
};

module.exports = {
  register,
  login,
  logout,
};

