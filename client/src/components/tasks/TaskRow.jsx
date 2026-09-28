import { memo } from 'react';
import { Link } from 'react-router-dom';
import { formatDate, isOverdue } from '../../utils/dateFormat';
import { StatusBadge } from './StatusBadge';
import { PriorityBadge } from './PriorityBadge';
import { Button } from '../common/Button';

function TaskRowBase({ task, onDelete }) {
  const overdue = isOverdue(task.dueDate, task.status);

  return (
    <tr className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
      <td className="px-4 py-3">
        <Link to={`/tasks/${task._id}`} className="font-medium text-gray-900 hover:text-indigo-600">
          {task.title}
        </Link>
      </td>
      <td className="px-4 py-3">
        <PriorityBadge priority={task.priority} />
      </td>
      <td className="px-4 py-3">
        <StatusBadge status={task.status} />
      </td>
      <td className={`px-4 py-3 text-sm ${overdue ? 'font-semibold text-red-600' : 'text-gray-600'}`}>
        {formatDate(task.dueDate)}
      </td>
      <td className="px-4 py-3 text-sm text-gray-600">{task.assignedTo?.name || '—'}</td>
      <td className="px-4 py-3 text-right">
        <div className="flex justify-end gap-2">
          <Link to={`/tasks/${task._id}/edit`}>
            <Button variant="secondary">Edit</Button>
          </Link>
          <Button variant="danger" onClick={() => onDelete(task)}>
            Delete
          </Button>
        </div>
      </td>
    </tr>
  );
}

export const TaskRow = memo(TaskRowBase);
