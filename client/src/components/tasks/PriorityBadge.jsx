import { memo } from 'react';
import { Badge } from '../common/Badge';

const PRIORITY_COLORS = {
  Low: 'gray',
  Medium: 'yellow',
  High: 'red',
};

function PriorityBadgeBase({ priority }) {
  return <Badge color={PRIORITY_COLORS[priority] || 'gray'}>{priority}</Badge>;
}

export const PriorityBadge = memo(PriorityBadgeBase);
