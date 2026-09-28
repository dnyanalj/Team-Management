import { useCallback, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchTasks,
  createTask,
  updateTask,
  deleteTask,
  setFilters,
  resetFilters,
  setTaskStatusLocally,
} from '../store/slices/tasksSlice';
import { TASKS_PAGE_SIZE } from '../utils/constants';

// `paginated: false` loads every matching task (used by the board, which groups by status).
export function useTasks({ paginated = true } = {}) {
  const dispatch = useDispatch();
  const { items, filters, pagination, status, mutationStatus, error } = useSelector((state) => state.tasks);

  const params = useMemo(() => {
    if (paginated) return { ...filters, limit: TASKS_PAGE_SIZE };
    const { page: _page, status: _status, ...rest } = filters;
    return rest;
  }, [filters, paginated]);

  const refetch = useCallback(() => dispatch(fetchTasks(params)), [dispatch, params]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const updateFilters = useCallback((patch) => dispatch(setFilters(patch)), [dispatch]);
  const clearFilters = useCallback(() => dispatch(resetFilters()), [dispatch]);
  const setPage = useCallback((page) => dispatch(setFilters({ page })), [dispatch]);

  const add = useCallback((payload) => dispatch(createTask(payload)), [dispatch]);
  const edit = useCallback((id, payload) => dispatch(updateTask({ id, payload })), [dispatch]);
  const remove = useCallback((id) => dispatch(deleteTask(id)), [dispatch]);
  const setStatusLocally = useCallback((id, nextStatus) => dispatch(setTaskStatusLocally({ id, status: nextStatus })), [dispatch]);

  return {
    tasks: items,
    filters,
    pagination,
    status,
    mutationStatus,
    error,
    refetch,
    updateFilters,
    clearFilters,
    setPage,
    addTask: add,
    editTask: edit,
    removeTask: remove,
    setStatusLocally,
  };
}
