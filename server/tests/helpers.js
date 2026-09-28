import request from 'supertest';
import app from '../app.js';
import { User } from '../models/User.js';

export const api = () => request(app);

let counter = 0;

export async function createUser({ role = 'user', name } = {}) {
  counter += 1;
  const credentials = {
    name: name || `User ${counter}`,
    email: `user${counter}@example.com`,
    password: 'Secret@123',
  };
  const res = await api().post('/api/auth/register').send(credentials);
  if (role !== 'user') await User.updateOne({ email: credentials.email }, { role });
  return { ...credentials, id: res.body.data.user.id, token: res.body.data.token };
}

export function taskPayload(overrides = {}) {
  return {
    title: 'Write tests',
    description: 'Cover the API',
    priority: 'Medium',
    status: 'Pending',
    dueDate: new Date(Date.now() + 86400000).toISOString(),
    ...overrides,
  };
}

export async function createTask(user, overrides = {}) {
  const res = await api()
    .post('/api/tasks')
    .set('Authorization', `Bearer ${user.token}`)
    .send(taskPayload({ assignedTo: user.id, ...overrides }));
  return res.body.data;
}
