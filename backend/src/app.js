const express = require('express');
const cors = require('cors');

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

app.use('/api/auth', authRoutes);
app.use('/api/players', playerRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportRoutes);

app.use((req, res) => {
  if (req.path.startsWith('/api/')) {
    console.warn('[404] Ruta no encontrada:', req.method, req.originalUrl);
  }
  res.status(404).json({ ok: false, message: 'Ruta no encontrada' });
});

module.exports = app;
