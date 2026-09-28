import { describe, it, expect } from 'vitest';
import reducer, { setFilters, resetFilters, setTaskStatusLocally, fetchTasks, deleteTask } from './tasksSlice';

const initial = reducer(undefined, { type: '@@init' });

describe('tasksSlice', () => {
  it('resets to page 1 when a filter changes', () => {
    const onPage3 = reducer(initial, setFilters({ page: 3 }));
    expect(onPage3.filters.page).toBe(3);

    const filtered = reducer(onPage3, setFilters({ status: 'Pending' }));
    expect(filtered.filters).toMatchObject({ status: 'Pending', page: 1 });
  });

  it('restores default filters', () => {
    const changed = reducer(initial, setFilters({ search: 'abc', page: 2 }));
    expect(reducer(changed, resetFilters()).filters).toEqual(initial.filters);
  });

  it('stores tasks and pagination from a fetch', () => {
    const payload = { items: [{ _id: '1' }], pagination: { page: 2, limit: 10, total: 11, totalPages: 2 } };
    const state = reducer(initial, fetchTasks.fulfilled(payload, 'req', {}));

    expect(state.items).toEqual(payload.items);
    expect(state.pagination).toEqual(payload.pagination);
  });

  it('changes a task status locally for optimistic board moves', () => {
    const loaded = { ...initial, items: [{ _id: '1', status: 'Pending' }] };
    const state = reducer(loaded, setTaskStatusLocally({ id: '1', status: 'Completed' }));
    expect(state.items[0].status).toBe('Completed');
  });

  it('removes a deleted task and decrements the total', () => {
    const loaded = {
      ...initial,
      items: [{ _id: '1' }, { _id: '2' }],
      recent: [{ _id: '1' }],
      pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
    };
    const state = reducer(loaded, deleteTask.fulfilled('1', 'req', '1'));

    expect(state.items).toEqual([{ _id: '2' }]);
    expect(state.recent).toEqual([]);
    expect(state.pagination.total).toBe(1);
  });
});
