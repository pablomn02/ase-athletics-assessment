/**
 * Prueba de integración: flujo completo desde registro hasta crear un reporte.
 * Demuestra que un ojeador puede registrarse, iniciar sesión y crear su primer reporte.
 */
const request = require('supertest');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const app = require('../../src/app');

const uniqueEmail = () => `flow-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@test.com`;

describe('Flujo integración: Registro → Login → Crear reporte', () => {
  it('registra usuario, hace login y crea un reporte de scouting', async () => {
    const email = uniqueEmail();
    const password = 'demo123';

    // 1. Registro
    const registerRes = await request(app).post('/api/auth/register').send({
      name: 'Ojeador Demo',
      email,
      password,
    });
    expect(registerRes.status).toBe(201);
    expect(registerRes.body.ok).toBe(true);
    expect(registerRes.body.user.email).toBe(email);

    // 2. Login
    const loginRes = await request(app).post('/api/auth/login').send({
      email,
      password,
    });
    expect(loginRes.status).toBe(200);
    expect(loginRes.body.token).toBeDefined();
    const token = loginRes.body.token;

    // 3. Listar jugadores (comprobar que el token funciona)
    const playersRes = await request(app)
      .get('/api/players?limit=1')
      .set('Authorization', `Bearer ${token}`);
    expect(playersRes.status).toBe(200);
    expect(playersRes.body.data).toBeDefined();
    const firstPlayerId = playersRes.body.data[0]?.id;
    expect(firstPlayerId).toBeDefined();

    // 4. Crear reporte de scouting
    const reportRes = await request(app)
      .post('/api/reports')
      .set('Authorization', `Bearer ${token}`)
      .send({
        player_id: firstPlayerId,
        match_date: '2025-03-01',
        overall_rating: 7,
        strengths: 'Buena visión de juego',
        weaknesses: 'Por mejorar en defensa',
        recommendation: 'Monitorear',
      });
    expect(reportRes.status).toBe(201);
    expect(reportRes.body.data.id).toBeDefined();
    expect(reportRes.body.data.overall_rating).toBe(7);
    expect(reportRes.body.data.player_id).toBe(firstPlayerId);
  });
});
