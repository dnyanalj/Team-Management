import { memo, useCallback } from 'react';
import { useDebouncedSearch } from '../../hooks/useDebouncedSearch';
import { TASK_STATUSES, TASK_PRIORITIES } from '../../utils/constants';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Button } from '../common/Button';

function TaskFiltersBase({ filters, onChange, onReset, showStatus = true, showSort = true }) {
  const handleSearchCommit = useCallback((value) => onChange({ search: value }), [onChange]);
  const [searchValue, handleSearchChange] = useDebouncedSearch(filters.search, 400, handleSearchCommit);

  const handleFieldChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      onChange({ [name]: value });
    },
    [onChange]
  );

  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
      <div className="sm:w-64">
        <Input
          id="search"
          label="Search by title"
          value={searchValue}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Search tasks..."
        />
      </div>

      {showStatus && (
        <div className="sm:w-44">
          <Select id="status" name="status" label="Status" value={filters.status} onChange={handleFieldChange}>
            <option value="">All statuses</option>
            {TASK_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </div>
      )}

      <div className="sm:w-44">
        <Select id="priority" name="priority" label="Priority" value={filters.priority} onChange={handleFieldChange}>
          <option value="">All priorities</option>
          {TASK_PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </Select>
      </div>

      {showSort && (
        <>
          <div className="sm:w-44">
            <Select id="sortBy" name="sortBy" label="Sort by" value={filters.sortBy} onChange={handleFieldChange}>
              <option value="dueDate">Due date</option>
              <option value="createdAt">Created date</option>
              <option value="priority">Priority</option>
              <option value="title">Title</option>
            </Select>
          </div>

          <div className="sm:w-36">
            <Select id="order" name="order" label="Order" value={filters.order} onChange={handleFieldChange}>
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </Select>
          </div>
        </>
      )}

      <Button type="button" variant="ghost" onClick={onReset}>
        Reset
      </Button>
    </div>
  );
}

export const TaskFilters = memo(TaskFiltersBase);
