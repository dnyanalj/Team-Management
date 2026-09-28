import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTaskStats } from '../hooks/useTaskStats';
import { useRecentTasks } from '../hooks/useRecentTasks';
import { StatCard } from '../components/dashboard/StatCard';
import { CountBarChart } from '../components/dashboard/CountBarChart';
import { RecentTasksList } from '../components/dashboard/RecentTasksList';
import { PageLoader } from '../components/common/PageLoader';
import { Button } from '../components/common/Button';

export default function DashboardPage() {
  const { stats, statsStatus } = useTaskStats();
  const { recent, recentStatus } = useRecentTasks();

  const cards = useMemo(() => {
    if (!stats) return [];
    return [
      { label: 'Total Tasks', value: stats.total, color: 'indigo' },
      { label: 'Pending', value: stats.pending, color: 'yellow' },
      { label: 'In Progress', value: stats.inProgress, color: 'blue' },
      { label: 'Completed', value: stats.completed, color: 'green' },
      { label: 'Overdue', value: stats.overdue ?? 0, color: 'red' },
    ];
  }, [stats]);

  const statusData = useMemo(
    () =>
      stats
        ? [
            { name: 'Pending', value: stats.pending },
            { name: 'In Progress', value: stats.inProgress },
            { name: 'Completed', value: stats.completed },
          ]
        : [],
    [stats]
  );

  const priorityData = useMemo(
    () =>
      stats
        ? [
            { name: 'High', value: stats.byPriority.High },
            { name: 'Medium', value: stats.byPriority.Medium },
            { name: 'Low', value: stats.byPriority.Low },
          ]
        : [],
    [stats]
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <Link to="/tasks/new">
          <Button>New Task</Button>
        </Link>
      </div>

      {statsStatus === 'loading' && !stats ? (
        <PageLoader />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {cards.map((card) => (
              <StatCard key={card.label} label={card.label} value={card.value} color={card.color} />
            ))}
          </div>

          {stats && stats.total > 0 && (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <CountBarChart title="Tasks by status" data={statusData} />
              <CountBarChart title="Tasks by priority" data={priorityData} />
            </div>
          )}
        </>
      )}

      <div>
        <h2 className="mb-3 text-lg font-semibold text-gray-900">Recent Tasks</h2>
        {recentStatus === 'loading' && !recent.length ? <PageLoader /> : <RecentTasksList tasks={recent} />}
      </div>
    </div>
  );
}
