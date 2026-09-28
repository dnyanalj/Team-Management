import { memo } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { StatusBadge } from '../tasks/StatusBadge';
import { BoardCard } from './BoardCard';

function BoardColumnBase({ status, tasks, canMoveTask }) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <section
      ref={setNodeRef}
      aria-label={`${status} column`}
      className={`flex min-h-64 flex-col rounded-lg border p-3 transition-colors ${
        isOver ? 'border-indigo-300 bg-indigo-50' : 'border-gray-200 bg-gray-100/60'
      }`}
    >
      <header className="mb-3 flex items-center justify-between px-1">
        <StatusBadge status={status} />
        <span className="text-xs font-medium text-gray-500">{tasks.length}</span>
      </header>

      {tasks.length ? (
        <ul className="flex flex-col gap-2">
          {tasks.map((task) => (
            <BoardCard key={task._id} task={task} canMove={canMoveTask(task)} />
          ))}
        </ul>
      ) : (
        <p className="flex flex-1 items-center justify-center rounded-md border border-dashed border-gray-300 p-4 text-xs text-gray-400">
          Drop tasks here
        </p>
      )}
    </section>
  );
}

export const BoardColumn = memo(BoardColumnBase);
