import { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { DndContext, DragOverlay, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { useTasks } from '../hooks/useTasks';
import { useAuth } from '../hooks/useAuth';
import { TASK_STATUSES } from '../utils/constants';
import { canEditTask } from '../utils/permissions';
import { TaskFilters } from '../components/tasks/TaskFilters';
import { BoardColumn } from '../components/board/BoardColumn';
import { BoardCardContent } from '../components/board/BoardCard';
import { PageLoader } from '../components/common/PageLoader';
import { Button } from '../components/common/Button';

const titleOf = (active) => active.data.current?.task?.title ?? 'Task';

// Screen-reader announcements that name the task instead of its database id.
const announcements = {
  onDragStart: ({ active }) => `Picked up ${titleOf(active)}.`,
  onDragOver: ({ active, over }) => (over ? `${titleOf(active)} is over ${over.id}.` : `${titleOf(active)} is not over a column.`),
  onDragEnd: ({ active, over }) => (over ? `${titleOf(active)} was moved to ${over.id}.` : `${titleOf(active)} was dropped.`),
  onDragCancel: ({ active }) => `Moving ${titleOf(active)} was cancelled.`,
};

export default function BoardPage() {
  const { tasks, filters, status, updateFilters, clearFilters, editTask, setStatusLocally } = useTasks({
    paginated: false,
  });
  const { user } = useAuth();
  const [activeTask, setActiveTask] = useState(null);

  // A small drag distance keeps plain clicks on the card's title link working.
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  const columns = useMemo(() => {
    const grouped = Object.fromEntries(TASK_STATUSES.map((s) => [s, []]));
    tasks.forEach((task) => grouped[task.status]?.push(task));
    return grouped;
  }, [tasks]);

  const canMoveTask = useCallback((task) => canEditTask(task, user), [user]);

  const handleDragStart = useCallback(({ active }) => setActiveTask(active.data.current.task), []);
  const handleDragCancel = useCallback(() => setActiveTask(null), []);

  const handleDragEnd = useCallback(
    async ({ active, over }) => {
      setActiveTask(null);
      const task = active.data.current.task;
      const nextStatus = over?.id;
      if (!nextStatus || nextStatus === task.status) return;

      const previousStatus = task.status;
      setStatusLocally(task._id, nextStatus);
      const result = await editTask(task._id, { status: nextStatus });
      if (result.error) setStatusLocally(task._id, previousStatus);
    },
    [editTask, setStatusLocally]
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Board</h1>
          <p className="text-sm text-gray-500">Drag a task to another column to change its status.</p>
        </div>
        <Link to="/tasks/new">
          <Button>New Task</Button>
        </Link>
      </div>

      <TaskFilters filters={filters} onChange={updateFilters} onReset={clearFilters} showStatus={false} showSort={false} />

      {status === 'loading' && !tasks.length ? (
        <PageLoader />
      ) : (
        <DndContext
          sensors={sensors}
          accessibility={{ announcements }}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {TASK_STATUSES.map((s) => (
              <BoardColumn key={s} status={s} tasks={columns[s]} canMoveTask={canMoveTask} />
            ))}
          </div>
          <DragOverlay>{activeTask ? <BoardCardContent task={activeTask} dragging /> : null}</DragOverlay>
        </DndContext>
      )}
    </div>
  );
}
