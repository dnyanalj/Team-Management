import { useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTaskById, createTask, updateTask, clearCurrentTask, clearTaskError } from '../store/slices/tasksSlice';
import { TaskForm } from '../components/tasks/TaskForm';
import { PageLoader } from '../components/common/PageLoader';

export default function TaskFormPage() {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentTask, status, mutationStatus, error } = useSelector((state) => state.tasks);

  useEffect(() => {
    if (isEditMode) dispatch(fetchTaskById(id));
    return () => {
      dispatch(clearCurrentTask());
      dispatch(clearTaskError());
    };
  }, [dispatch, id, isEditMode]);

  const handleSubmit = useCallback(
    async (values) => {
      const action = isEditMode
        ? updateTask({ id, payload: values })
        : createTask(values);
      const result = await dispatch(action);
      if (!result.error) {
        const savedId = result.payload._id;
        navigate(`/tasks/${savedId}`);
      }
    },
    [dispatch, id, isEditMode, navigate]
  );

  const handleCancel = useCallback(() => navigate(-1), [navigate]);

  if (isEditMode && (status === 'loading' || !currentTask)) {
    return <PageLoader />;
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">{isEditMode ? 'Edit Task' : 'New Task'}</h1>
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <TaskForm
          initialValues={isEditMode ? currentTask : undefined}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          submitting={mutationStatus === 'loading'}
          serverError={error}
        />
      </div>
    </div>
  );
}
