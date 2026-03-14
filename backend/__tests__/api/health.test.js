const request = require('supertest');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const app = require('../../src/app');

describe('GET /health', () => {
  it('responde 200 con { ok: true }', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });
});
