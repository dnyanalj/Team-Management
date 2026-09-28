import { memo } from 'react';
import { Badge } from '../common/Badge';

const STATUS_COLORS = {
  Pending: 'gray',
  'In Progress': 'blue',
  Completed: 'green',
};

function StatusBadgeBase({ status }) {
  return <Badge color={STATUS_COLORS[status] || 'gray'}>{status}</Badge>;
}

export const StatusBadge = memo(StatusBadgeBase);
