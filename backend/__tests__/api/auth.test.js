const request = require('supertest');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const app = require('../../src/app');

const uniqueEmail = () => `test-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@test.com`;

describe('POST /api/auth/register', () => {
  it('con body válido responde 201 y devuelve user sin password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Usuario Test',
        email: uniqueEmail(),
        password: '123456',
      });
    expect(res.status).toBe(201);
    expect(res.body.ok).toBe(true);
    expect(res.body.user).toMatchObject({
      name: 'Usuario Test',
      email: expect.stringMatching(/@test\.com$/),
    });
    expect(res.body.user.password_hash).toBeUndefined();
  });

  it('con email duplicado responde 409', async () => {
    const email = uniqueEmail();
    await request(app).post('/api/auth/register').send({
      name: 'Uno',
      email,
      password: '123456',
    });
    const res = await request(app).post('/api/auth/register').send({
      name: 'Dos',
      email,
      password: '654321',
    });
    expect(res.status).toBe(409);
    expect(res.body.ok).toBe(false);
    expect(res.body.message).toMatch(/ya existe/i);
  });

  it('con body inválido (email mal formato) responde 400 con details', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test',
        email: 'no-es-email',
        password: '123456',
      });
    expect(res.status).toBe(400);
    expect(res.body.ok).toBe(false);
    expect(res.body.details).toBeDefined();
    expect(Array.isArray(res.body.details)).toBe(true);
  });
});

describe('POST /api/auth/login', () => {
  it('con credenciales correctas responde 200 y devuelve token', async () => {
    const email = uniqueEmail();
    await request(app).post('/api/auth/register').send({
      name: 'Login Test',
      email,
      password: 'secret123',
    });
    const res = await request(app).post('/api/auth/login').send({
      email,
      password: 'secret123',
    });
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(typeof res.body.token).toBe('string');
    expect(res.body.token.length).toBeGreaterThan(20);
  });

  it('con contraseña incorrecta responde 401', async () => {
    const email = uniqueEmail();
    await request(app).post('/api/auth/register').send({
      name: 'Login Test',
      email,
      password: 'goodpass',
    });
    const res = await request(app).post('/api/auth/login').send({
      email,
      password: 'wrongpass',
    });
    expect(res.status).toBe(401);
    expect(res.body.ok).toBe(false);
    expect(res.body.message).toMatch(/credenciales/i);
  });

  it('con body inválido responde 400', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'a@b.com' });
    expect(res.status).toBe(400);
    expect(res.body.details).toBeDefined();
  });
});
