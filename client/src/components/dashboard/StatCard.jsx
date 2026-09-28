import { memo } from 'react';

function StatCardBase({ label, value, color = 'indigo' }) {
  const colors = {
    indigo: 'border-indigo-100 text-indigo-700',
    yellow: 'border-yellow-100 text-yellow-700',
    green: 'border-green-100 text-green-700',
    blue: 'border-blue-100 text-blue-700',
    red: 'border-red-100 text-red-700',
  };

  return (
    <div className={`rounded-lg border bg-white p-5 shadow-sm ${colors[color]}`}>
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
    </div>
  );
}

export const StatCard = memo(StatCardBase);
