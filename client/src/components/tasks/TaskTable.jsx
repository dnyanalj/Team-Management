import { memo } from 'react';
import { TaskRow } from './TaskRow';
import { EmptyState } from '../common/EmptyState';

function TaskTableBase({ tasks, onDelete }) {
  if (!tasks.length) {
    return <EmptyState title="No tasks found" description="Try adjusting your search or filters, or create a new task." />;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
      <table className="min-w-full divide-y divide-gray-200 text-left">
        <thead className="bg-gray-50">
          <tr className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            <th className="px-4 py-3">Title</th>
            <th className="px-4 py-3">Priority</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Due date</th>
            <th className="px-4 py-3">Assigned to</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <TaskRow key={task._id} task={task} onDelete={onDelete} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export const TaskTable = memo(TaskTableBase);
