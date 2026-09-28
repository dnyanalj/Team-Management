import { describe, it, expect } from 'vitest';
import { isValidEmail, getPasswordIssues, isRequired } from './validators';
import { getPageItems } from './pagination';
import { canEditTask } from './permissions';
import { isOverdue } from './dateFormat';

describe('validators', () => {
  it('validates emails', () => {
    expect(isValidEmail('a@b.co')).toBe(true);
    expect(isValidEmail('not-an-email')).toBe(false);
  });

  it('lists every missing password rule', () => {
    expect(getPasswordIssues('Secret@123')).toEqual([]);
    expect(getPasswordIssues('abc')).toEqual([
      'at least 8 characters',
      'an uppercase letter',
      'a number',
      'a special character',
    ]);
  });

  it('treats whitespace-only values as missing', () => {
    expect(isRequired('  ')).toBe(false);
    expect(isRequired(0)).toBe(true);
  });
});

describe('getPageItems', () => {
  it('shows every page when there are few', () => {
    expect(getPageItems(1, 3)).toEqual([1, 2, 3]);
  });

  it('collapses distant pages into gaps', () => {
    expect(getPageItems(5, 10)).toEqual([1, 'gap-4', 4, 5, 6, 'gap-10', 10]);
  });
});

describe('canEditTask', () => {
  const task = { createdBy: { _id: 'creator' }, assignedTo: { _id: 'assignee' } };

  it('allows the creator, the assignee and admins', () => {
    expect(canEditTask(task, { id: 'creator', role: 'user' })).toBe(true);
    expect(canEditTask(task, { id: 'assignee', role: 'user' })).toBe(true);
    expect(canEditTask(task, { id: 'someone', role: 'admin' })).toBe(true);
  });

  it('blocks everyone else', () => {
    expect(canEditTask(task, { id: 'someone', role: 'user' })).toBe(false);
    expect(canEditTask(task, null)).toBe(false);
  });
});

describe('isOverdue', () => {
  it('flags past due dates unless the task is completed', () => {
    const yesterday = new Date(Date.now() - 86400000).toISOString();
    expect(isOverdue(yesterday, 'Pending')).toBe(true);
    expect(isOverdue(yesterday, 'Completed')).toBe(false);
  });
});
