import { useState, useCallback } from 'react';
import { TASK_STATUSES, TASK_PRIORITIES } from '../../utils/constants';
import { toDateInputValue } from '../../utils/dateFormat';
import { isRequired } from '../../utils/validators';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Button } from '../common/Button';
import { UserSelect } from './UserSelect';

const EMPTY_FORM = {
  title: '',
  description: '',
  priority: 'Medium',
  status: 'Pending',
  dueDate: '',
  assignedTo: '',
};

export function TaskForm({ initialValues, onSubmit, onCancel, submitting, serverError }) {
  const [form, setForm] = useState(() => ({
    ...EMPTY_FORM,
    ...initialValues,
    dueDate: toDateInputValue(initialValues?.dueDate) || '',
    assignedTo: initialValues?.assignedTo?._id || initialValues?.assignedTo || '',
  }));
  const [errors, setErrors] = useState({});

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  const validate = useCallback(() => {
    const next = {};
    if (!isRequired(form.title)) next.title = 'Title is required';
    else if (form.title.trim().length < 3) next.title = 'Title must be at least 3 characters';
    if (!isRequired(form.dueDate)) next.dueDate = 'Due date is required';
    if (!isRequired(form.assignedTo)) next.assignedTo = 'Please assign this task to a user';
    setErrors(next);
    return Object.keys(next).length === 0;
  }, [form]);

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (!validate()) return;
      onSubmit({ ...form, dueDate: new Date(form.dueDate).toISOString() });
    },
    [form, onSubmit, validate]
  );

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <Input id="title" name="title" label="Title" value={form.title} onChange={handleChange} error={errors.title} />

      <div className="flex flex-col gap-1">
        <label htmlFor="description" className="text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          value={form.description}
          onChange={handleChange}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Select id="priority" name="priority" label="Priority" value={form.priority} onChange={handleChange}>
          {TASK_PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </Select>

        <Select id="status" name="status" label="Status" value={form.status} onChange={handleChange}>
          {TASK_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          id="dueDate"
          name="dueDate"
          type="date"
          label="Due date"
          value={form.dueDate}
          onChange={handleChange}
          error={errors.dueDate}
        />
        <UserSelect
          id="assignedTo"
          name="assignedTo"
          value={form.assignedTo}
          onChange={handleChange}
          error={errors.assignedTo}
        />
      </div>

      {serverError && <p className="text-sm text-red-600">{serverError}</p>}

      <div className="mt-2 flex justify-end gap-3">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel} disabled={submitting}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Saving...' : 'Save task'}
        </Button>
      </div>
    </form>
  );
}
