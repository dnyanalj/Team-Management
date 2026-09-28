import { memo } from 'react';
import { Link } from 'react-router-dom';
import { useDraggable } from '@dnd-kit/core';
import { formatDate, isOverdue } from '../../utils/dateFormat';
import { PriorityBadge } from '../tasks/PriorityBadge';

export function BoardCardContent({ task, dragging = false }) {
  const overdue = isOverdue(task.dueDate, task.status);

  return (
    <div
      className={`rounded-md border bg-white p-3 text-left shadow-sm ${
        dragging ? 'border-indigo-300 shadow-lg ring-2 ring-indigo-200' : 'border-gray-200'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <Link to={`/tasks/${task._id}`} className="text-sm font-medium text-gray-900 hover:text-indigo-600">
          {task.title}
        </Link>
        <PriorityBadge priority={task.priority} />
      </div>
      <div className="mt-2 flex items-center justify-between text-xs">
        <span className={overdue ? 'font-semibold text-red-600' : 'text-gray-500'}>Due {formatDate(task.dueDate)}</span>
        <span className="truncate text-gray-500">{task.assignedTo?.name}</span>
      </div>
    </div>
  );
}

function BoardCardBase({ task, canMove }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: task._id,
    data: { task },
    disabled: !canMove,
  });

  return (
    <li
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      aria-roledescription={canMove ? 'Draggable task' : undefined}
      title={canMove ? undefined : 'Only the creator, assignee, or an admin can move this task'}
      className={`list-none ${canMove ? 'cursor-grab active:cursor-grabbing' : 'cursor-not-allowed opacity-75'} ${
        isDragging ? 'opacity-40' : ''
      }`}
    >
      <BoardCardContent task={task} />
    </li>
  );
}

export const BoardCard = memo(BoardCardBase);
