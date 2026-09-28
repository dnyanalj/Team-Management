import { memo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LabelList } from 'recharts';

// Single-series horizontal bar chart: one hue, categories named on the axis, value at the bar tip.
const BAR_COLOR = '#2a78d6';
const AXIS_TEXT = '#6b7280';
const GRID = '#e5e7eb';
const BAR_THICKNESS = 20;

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0].payload;
  return (
    <div className="rounded-md border border-gray-200 bg-white px-3 py-2 text-xs shadow-md">
      <p className="font-medium text-gray-900">{name}</p>
      <p className="text-gray-600">
        {value} {value === 1 ? 'task' : 'tasks'}
      </p>
    </div>
  );
}

function CountBarChartBase({ title, data }) {
  const height = data.length * (BAR_THICKNESS + 24) + 32;

  return (
    <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="mb-3 text-sm font-semibold text-gray-900">{title}</h3>
      <div style={{ height }} role="img" aria-label={`${title}: ${data.map((d) => `${d.name} ${d.value}`).join(', ')}`}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 32, bottom: 0, left: 0 }}>
            <CartesianGrid horizontal={false} stroke={GRID} />
            <XAxis type="number" allowDecimals={false} tick={{ fill: AXIS_TEXT, fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis
              type="category"
              dataKey="name"
              width={88}
              tick={{ fill: AXIS_TEXT, fontSize: 12 }}
              axisLine={{ stroke: GRID }}
              tickLine={false}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: '#f3f4f6' }} />
            <Bar dataKey="value" fill={BAR_COLOR} barSize={BAR_THICKNESS} radius={[0, 4, 4, 0]} isAnimationActive={false}>
              <LabelList dataKey="value" position="right" fill="#374151" fontSize={12} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

export const CountBarChart = memo(CountBarChartBase);
