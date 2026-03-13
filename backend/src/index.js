const express = require('express');
const cors = require('cors');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '../.env') });

const authRoutes = require('./routes/authRoutes');
const playerRoutes = require('./routes/playerRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const reportRoutes = require('./routes/reportRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

// Autenticación
app.use('/api/auth', authRoutes);

// Gestión de jugadores (todas protegidas con authMiddleware dentro del router)
app.use('/api/players', playerRoutes);

// Dashboard de análisis
app.use('/api/dashboard', dashboardRoutes);

// Reportes de scouting
app.use('/api/reports', reportRoutes);

// Si llega aquí, ninguna ruta coincidió (útil para depurar 404)
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    console.warn('[404] Ruta no encontrada:', req.method, req.originalUrl);
  }
  res.status(404).json({ ok: false, message: 'Ruta no encontrada' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`API escuchando en puerto ${PORT}`);
});

