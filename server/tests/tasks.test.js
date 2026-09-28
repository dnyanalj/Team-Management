import { describe, it, expect, beforeEach } from 'vitest';
import { api, createUser, createTask, taskPayload } from './helpers.js';

const auth = (user) => ({ Authorization: `Bearer ${user.token}` });

describe('tasks API', () => {
  let owner;

  beforeEach(async () => {
    owner = await createUser({ name: 'Owner' });
  });

  describe('POST /api/tasks', () => {
    it('creates a task with the caller as creator', async () => {
      const res = await api().post('/api/tasks').set(auth(owner)).send(taskPayload({ assignedTo: owner.id }));

      expect(res.status).toBe(201);
      expect(res.body.data).toMatchObject({ title: 'Write tests', status: 'Pending' });
      expect(res.body.data.createdBy._id).toBe(owner.id);
    });

    it('requires title, dueDate and assignedTo', async () => {
      const res = await api().post('/api/tasks').set(auth(owner)).send({});

      expect(res.status).toBe(400);
      expect(res.body.errors.map((e) => e.field)).toEqual(expect.arrayContaining(['title', 'dueDate', 'assignedTo']));
    });

    it('requires authentication', async () => {
      expect((await api().post('/api/tasks').send(taskPayload())).status).toBe(401);
    });
  });

  describe('GET /api/tasks', () => {
    beforeEach(async () => {
      await createTask(owner, { title: 'Alpha task', priority: 'Low', status: 'Pending' });
      await createTask(owner, { title: 'Beta task', priority: 'High', status: 'Completed' });
      await createTask(owner, { title: 'Gamma (special) task', priority: 'Medium', status: 'In Progress' });
    });

    it('accepts empty filter values (as sent by the UI) and returns everything', async () => {
      const res = await api()
        .get('/api/tasks?search=&status=&priority=&sortBy=createdAt&order=desc')
        .set(auth(owner));

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(3);
      expect(res.body.pagination).toEqual({ page: 1, limit: 3, total: 3, totalPages: 1 });
    });

    it('paginates and reports totals', async () => {
      const page1 = await api().get('/api/tasks?page=1&limit=2&sortBy=title&order=asc').set(auth(owner));
      const page2 = await api().get('/api/tasks?page=2&limit=2&sortBy=title&order=asc').set(auth(owner));

      expect(page1.body.data.map((t) => t.title)).toEqual(['Alpha task', 'Beta task']);
      expect(page2.body.data.map((t) => t.title)).toEqual(['Gamma (special) task']);
      expect(page1.body.pagination).toEqual({ page: 1, limit: 2, total: 3, totalPages: 2 });
    });

    it('rejects an invalid limit', async () => {
      const res = await api().get('/api/tasks?limit=1000').set(auth(owner));
      expect(res.status).toBe(400);
    });

    it('filters by status and priority', async () => {
      const res = await api().get('/api/tasks?status=Completed&priority=High').set(auth(owner));
      expect(res.body.data.map((t) => t.title)).toEqual(['Beta task']);
    });

    it('searches titles case-insensitively, treating regex characters literally', async () => {
      const res = await api().get('/api/tasks').query({ search: '(SPECIAL)' }).set(auth(owner));

      expect(res.status).toBe(200);
      expect(res.body.data.map((t) => t.title)).toEqual(['Gamma (special) task']);
    });

    it('sorts by priority weight, with pagination', async () => {
      const res = await api().get('/api/tasks?sortBy=priority&order=desc&page=1&limit=2').set(auth(owner));

      expect(res.body.data.map((t) => t.priority)).toEqual(['High', 'Medium']);
      expect(res.body.data[0].assignedTo.name).toBe('Owner');
      expect(res.body.pagination.total).toBe(3);
    });
  });

  describe('GET /api/tasks/stats', () => {
    it('counts tasks by status, priority and overdue', async () => {
      const yesterday = new Date(Date.now() - 86400000).toISOString();
      await createTask(owner, { status: 'Pending', priority: 'High', dueDate: yesterday });
      await createTask(owner, { status: 'Completed', priority: 'Low', dueDate: yesterday });
      await createTask(owner, { status: 'In Progress', priority: 'High' });

      const res = await api().get('/api/tasks/stats').set(auth(owner));

      expect(res.body.data).toEqual({
        total: 3,
        pending: 1,
        inProgress: 1,
        completed: 1,
        overdue: 1,
        byPriority: { Low: 1, Medium: 0, High: 2 },
      });
    });
  });

  describe('permissions', () => {
    let assignee;
    let outsider;
    let admin;
    let task;

    beforeEach(async () => {
      assignee = await createUser({ name: 'Assignee' });
      outsider = await createUser({ name: 'Outsider' });
      admin = await createUser({ name: 'Admin', role: 'admin' });
      task = await createTask(owner, { assignedTo: assignee.id });
    });

    it('lets the assignee update the task', async () => {
      const res = await api().put(`/api/tasks/${task._id}`).set(auth(assignee)).send({ status: 'In Progress' });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('In Progress');
    });

    it('blocks an unrelated user from updating', async () => {
      const res = await api().put(`/api/tasks/${task._id}`).set(auth(outsider)).send({ status: 'Completed' });
      expect(res.status).toBe(403);
    });

    it('lets an admin update any task', async () => {
      const res = await api().put(`/api/tasks/${task._id}`).set(auth(admin)).send({ priority: 'High' });
      expect(res.status).toBe(200);
    });

    it('only lets the creator or an admin delete', async () => {
      expect((await api().delete(`/api/tasks/${task._id}`).set(auth(assignee))).status).toBe(403);
      expect((await api().delete(`/api/tasks/${task._id}`).set(auth(owner))).status).toBe(200);
      expect((await api().get(`/api/tasks/${task._id}`).set(auth(owner))).status).toBe(404);
    });

    it('returns 400 for a malformed task id', async () => {
      expect((await api().get('/api/tasks/not-an-id').set(auth(owner))).status).toBe(400);
    });
  });
});
