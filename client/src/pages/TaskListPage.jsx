import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTasks } from '../hooks/useTasks';
import { TaskFilters } from '../components/tasks/TaskFilters';
import { TaskTable } from '../components/tasks/TaskTable';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { PageLoader } from '../components/common/PageLoader';
import { Button } from '../components/common/Button';
import { Pagination } from '../components/common/Pagination';

export default function TaskListPage() {
  const { tasks, filters, pagination, status, mutationStatus, refetch, updateFilters, clearFilters, setPage, removeTask } =
    useTasks();
  const [taskToDelete, setTaskToDelete] = useState(null);

  const handleDeleteRequest = useCallback((task) => setTaskToDelete(task), []);
  const handleCancelDelete = useCallback(() => setTaskToDelete(null), []);

  const handleConfirmDelete = useCallback(async () => {
    if (!taskToDelete) return;
    const result = await removeTask(taskToDelete._id);
    setTaskToDelete(null);
    if (result.error) return;
    // Refill the page from the server; step back if we just emptied the last page.
    if (tasks.length === 1 && filters.page > 1) setPage(filters.page - 1);
    else refetch();
  }, [taskToDelete, removeTask, tasks.length, filters.page, setPage, refetch]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
        <Link to="/tasks/new">
          <Button>New Task</Button>
        </Link>
      </div>

      <TaskFilters filters={filters} onChange={updateFilters} onReset={clearFilters} />

      {status === 'loading' && !tasks.length ? (
        <PageLoader />
      ) : (
        <>
          <TaskTable tasks={tasks} onDelete={handleDeleteRequest} />
          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            total={pagination.total}
            limit={pagination.limit}
            onPageChange={setPage}
          />
        </>
      )}

      <ConfirmDialog
        open={Boolean(taskToDelete)}
        title="Delete task"
        description={`Are you sure you want to delete "${taskToDelete?.title}"? This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        loading={mutationStatus === 'loading'}
      />
    </div>
  );
}
