import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsers } from '../../store/slices/usersSlice';
import { Select } from '../common/Select';

export function UserSelect({ id, name, value, onChange, error, label = 'Assigned to' }) {
  const dispatch = useDispatch();
  const { list, status } = useSelector((state) => state.users);

  useEffect(() => {
    if (status === 'idle') dispatch(fetchUsers());
  }, [dispatch, status]);

  const sortedUsers = useMemo(() => [...list].sort((a, b) => a.name.localeCompare(b.name)), [list]);

  return (
    <Select id={id} name={name} label={label} value={value} onChange={onChange} error={error}>
      <option value="">Select a user...</option>
      {sortedUsers.map((user) => (
        <option key={user._id} value={user._id}>
          {user.name} ({user.email})
        </option>
      ))}
    </Select>
  );
}
