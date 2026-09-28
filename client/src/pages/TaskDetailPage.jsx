import { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTaskById, clearCurrentTask } from '../store/slices/tasksSlice';
import { TaskDetail } from '../components/tasks/TaskDetail';
import { PageLoader } from '../components/common/PageLoader';
import { EmptyState } from '../components/common/EmptyState';
import { Button } from '../components/common/Button';

export default function TaskDetailPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentTask, status, error } = useSelector((state) => state.tasks);

  useEffect(() => {
    dispatch(fetchTaskById(id));
    return () => dispatch(clearCurrentTask());
  }, [dispatch, id]);

  if (status === 'loading' || !currentTask) {
    if (error) {
      return <EmptyState title="Task not found" description={error} action={<Button onClick={() => navigate('/tasks')}>Back to tasks</Button>} />;
    }
    return <PageLoader />;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Link to="/tasks" className="text-sm text-indigo-600 hover:underline">
          &larr; Back to tasks
        </Link>
        <Link to={`/tasks/${id}/edit`}>
          <Button variant="secondary">Edit Task</Button>
        </Link>
      </div>
      <TaskDetail task={currentTask} />
    </div>
  );
}
