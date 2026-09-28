import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTaskStats } from '../store/slices/tasksSlice';

export function useTaskStats() {
  const dispatch = useDispatch();
  const { stats, statsStatus, error } = useSelector((state) => state.tasks);

  useEffect(() => {
    dispatch(fetchTaskStats());
  }, [dispatch]);

  return { stats, statsStatus, error };
}
