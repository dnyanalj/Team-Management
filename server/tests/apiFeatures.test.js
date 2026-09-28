import { describe, it, expect } from 'vitest';
import { buildTaskFilter, parsePagination } from '../utils/apiFeatures.js';

describe('buildTaskFilter', () => {
  it('ignores empty values', () => {
    expect(buildTaskFilter({ search: '', status: '', priority: '' })).toEqual({});
  });

  it('builds a case-insensitive title search with regex characters escaped', () => {
    const filter = buildTaskFilter({ search: 'fix (urgent).*' });
    const regex = new RegExp(filter.title.$regex, filter.title.$options);

    expect(regex.test('Fix (URGENT).* now')).toBe(true);
    expect(regex.test('fix urgent anything')).toBe(false);
  });

  it('adds status and priority filters', () => {
    expect(buildTaskFilter({ status: 'Pending', priority: 'High' })).toEqual({ status: 'Pending', priority: 'High' });
  });
});

describe('parsePagination', () => {
  it('returns null when neither page nor limit is given (or both are empty)', () => {
    expect(parsePagination({})).toBeNull();
    expect(parsePagination({ page: '', limit: '' })).toBeNull();
  });

  it('computes skip from page and limit', () => {
    expect(parsePagination({ page: '3', limit: '5' })).toEqual({ page: 3, limit: 5, skip: 10 });
  });

  it('defaults the limit to 10 and caps it at 100', () => {
    expect(parsePagination({ page: '2' })).toEqual({ page: 2, limit: 10, skip: 10 });
    expect(parsePagination({ limit: '500' }).limit).toBe(100);
  });
});
