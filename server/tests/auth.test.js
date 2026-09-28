import { describe, it, expect } from 'vitest';
import { api, createUser } from './helpers.js';
import { User } from '../models/User.js';

describe('POST /api/auth/register', () => {
  const valid = { name: 'Jane Doe', email: 'jane@example.com', password: 'Secret@123' };

  it('creates a user, hashes the password and returns a token', async () => {
    const res = await api().post('/api/auth/register').send(valid);

    expect(res.status).toBe(201);
    expect(res.body.data.token).toEqual(expect.any(String));
    expect(res.body.data.user).toMatchObject({ name: 'Jane Doe', email: 'jane@example.com', role: 'user' });
    expect(res.body.data.user.password).toBeUndefined();

    const stored = await User.findOne({ email: valid.email }).select('+password');
    expect(stored.password).not.toBe(valid.password);
    expect(await stored.comparePassword(valid.password)).toBe(true);
  });

  it('rejects a weak password with field errors', async () => {
    const res = await api().post('/api/auth/register').send({ ...valid, password: 'weak' });

    expect(res.status).toBe(400);
    expect(res.body.errors.map((e) => e.field)).toContain('password');
  });

  it('rejects a duplicate email', async () => {
    await api().post('/api/auth/register').send(valid);
    const res = await api().post('/api/auth/register').send(valid);

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/already exists/);
  });

  it('returns 400 for a malformed JSON body', async () => {
    const res = await api().post('/api/auth/register').set('Content-Type', 'application/json').send('{"name":');

    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/login', () => {
  it('logs in with valid credentials', async () => {
    const user = await createUser();
    const res = await api().post('/api/auth/login').send({ email: user.email, password: user.password });

    expect(res.status).toBe(200);
    expect(res.body.data.token).toEqual(expect.any(String));
  });

  it('rejects a wrong password', async () => {
    const user = await createUser();
    const res = await api().post('/api/auth/login').send({ email: user.email, password: 'Wrong@123' });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Invalid email or password');
  });
});

describe('GET /api/auth/me', () => {
  it('returns the current user for a valid token', async () => {
    const user = await createUser();
    const res = await api().get('/api/auth/me').set('Authorization', `Bearer ${user.token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe(user.email);
  });

  it('rejects requests without a token or with a bad token', async () => {
    expect((await api().get('/api/auth/me')).status).toBe(401);
    expect((await api().get('/api/auth/me').set('Authorization', 'Bearer nope')).status).toBe(401);
  });
});
