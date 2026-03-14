const request = require('supertest');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const app = require('../../src/app');

let authToken;
let playerId;

beforeAll(async () => {
  const email = `reports-${Date.now()}@test.com`;
  await request(app).post('/api/auth/register').send({
    name: 'Reports Test',
    email,
    password: '123456',
  });
  const loginRes = await request(app).post('/api/auth/login').send({
    email,
    password: '123456',
  });
  authToken = loginRes.body.token;
  // Obtener un player_id existente (lista devuelve al menos 1 si hay seed, o creamos uno)
  const playersRes = await request(app)
    .get('/api/players?limit=1')
    .set('Authorization', `Bearer ${authToken}`);
  if (playersRes.body.data && playersRes.body.data[0]) {
    playerId = playersRes.body.data[0].id;
  } else {
    const createRes = await request(app)
      .post('/api/players')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ name: 'Jugador Test Report', position: 'Delantero', team: 'Test FC' });
    playerId = createRes.body.data?.id || 1;
  }
});

describe('GET /api/reports', () => {
  it('sin token responde 401', async () => {
    const res = await request(app).get('/api/reports');
    expect(res.status).toBe(401);
  });

  it('con token válido responde 200 y array con meta', async () => {
    const res = await request(app)
      .get('/api/reports?limit=5')
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.meta).toBeDefined();
  });
});

describe('POST /api/reports', () => {
  it('con token y body válido crea reporte y responde 201', async () => {
    const res = await request(app)
      .post('/api/reports')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        player_id: playerId,
        overall_rating: 8,
        strengths: 'Velocidad',
        weaknesses: 'Defensa',
        recommendation: 'Fichar',
      });
    expect(res.status).toBe(201);
    expect(res.body.ok).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.overall_rating).toBe(8);
    expect(res.body.data.player_id).toBe(playerId);
  });

  it('sin token responde 401', async () => {
    const res = await request(app).post('/api/reports').send({
      player_id: playerId,
      overall_rating: 5,
    });
    expect(res.status).toBe(401);
  });

  it('con body inválido (sin player_id) responde 400', async () => {
    const res = await request(app)
      .post('/api/reports')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        overall_rating: 5,
      });
    expect(res.status).toBe(400);
    expect(res.body.details).toBeDefined();
  });
});
