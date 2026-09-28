import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRecentTasks } from '../store/slices/tasksSlice';

export function useRecentTasks() {
  const dispatch = useDispatch();
  const { recent, recentStatus } = useSelector((state) => state.tasks);

  useEffect(() => {
    dispatch(fetchRecentTasks());
  }, [dispatch]);

  return { recent, recentStatus };
}
