import { formatDate } from '../../utils/dateFormat';
import { StatusBadge } from './StatusBadge';
import { PriorityBadge } from './PriorityBadge';

export function TaskDetail({ task }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <h1 className="text-xl font-semibold text-gray-900">{task.title}</h1>
        <div className="flex gap-2">
          <PriorityBadge priority={task.priority} />
          <StatusBadge status={task.status} />
        </div>
      </div>

      <p className="mt-4 whitespace-pre-wrap text-sm text-gray-700">
        {task.description || 'No description provided.'}
      </p>

      <dl className="mt-6 grid grid-cols-1 gap-4 border-t border-gray-100 pt-4 text-sm sm:grid-cols-2">
        <div>
          <dt className="font-medium text-gray-500">Due date</dt>
          <dd className="text-gray-900">{formatDate(task.dueDate)}</dd>
        </div>
        <div>
          <dt className="font-medium text-gray-500">Assigned to</dt>
          <dd className="text-gray-900">{task.assignedTo?.name} ({task.assignedTo?.email})</dd>
        </div>
        <div>
          <dt className="font-medium text-gray-500">Created by</dt>
          <dd className="text-gray-900">{task.createdBy?.name} ({task.createdBy?.email})</dd>
        </div>
        <div>
          <dt className="font-medium text-gray-500">Created at</dt>
          <dd className="text-gray-900">{formatDate(task.createdAt)}</dd>
        </div>
      </dl>
    </div>
  );
}
