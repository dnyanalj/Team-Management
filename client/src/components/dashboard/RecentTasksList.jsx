import { memo, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { formatDate } from '../../utils/dateFormat';
import { StatusBadge } from '../tasks/StatusBadge';
import { PriorityBadge } from '../tasks/PriorityBadge';
import { EmptyState } from '../common/EmptyState';

function RecentTasksListBase({ tasks }) {
  const recent = useMemo(
    () =>
      [...tasks]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5),
    [tasks]
  );

  if (!recent.length) {
    return <EmptyState title="No tasks yet" description="Create your first task to see it here." />;
  }

  return (
    <ul className="divide-y divide-gray-100 rounded-lg border border-gray-200 bg-white">
      {recent.map((task) => (
        <li key={task._id} className="flex items-center justify-between gap-4 px-4 py-3">
          <Link to={`/tasks/${task._id}`} className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-gray-900">{task.title}</p>
            <p className="text-xs text-gray-500">Due {formatDate(task.dueDate)}</p>
          </Link>
          <div className="flex shrink-0 items-center gap-2">
            <PriorityBadge priority={task.priority} />
            <StatusBadge status={task.status} />
          </div>
        </li>
      ))}
    </ul>
  );
}

export const RecentTasksList = memo(RecentTasksListBase);
