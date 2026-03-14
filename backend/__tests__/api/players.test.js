const request = require('supertest');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const app = require('../../src/app');

let authToken;

beforeAll(async () => {
  const email = `players-${Date.now()}@test.com`;
  await request(app).post('/api/auth/register').send({
    name: 'Players Test',
    email,
    password: '123456',
  });
  const loginRes = await request(app).post('/api/auth/login').send({
    email,
    password: '123456',
  });
  authToken = loginRes.body.token;
});

describe('GET /api/players', () => {
  it('sin token responde 401', async () => {
    const res = await request(app).get('/api/players');
    expect(res.status).toBe(401);
  });

  it('con token válido responde 200 y array de jugadores con meta', async () => {
    const res = await request(app)
      .get('/api/players?page=1&limit=25')
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.meta).toBeDefined();
    expect(res.body.meta.page).toBe(1);
    expect(res.body.meta.limit).toBe(25);
    expect(typeof res.body.meta.total).toBe('number');
  });
});

describe('GET /api/players/search', () => {
  it('con token y query q responde 200', async () => {
    const res = await request(app)
      .get('/api/players/search?q=test&limit=10')
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});
