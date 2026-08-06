import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import type { ChartSpec } from '../../types/chat';
import { useUiStore } from '../../stores/useUiStore';

interface ChatChartProps {
  spec: ChartSpec;
}

const PIE_COLORS = ['#10a37f', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899', '#14b8a6'];

export const ChatChart: React.FC<ChatChartProps> = ({ spec }) => {
  const theme = useUiStore((s) => s.theme);
  const isDark =
    theme === 'dark' ||
    (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const gridColor = isDark ? '#262626' : '#e5e7eb';
  const textColor = isDark ? '#a3a3a3' : '#6b7280';
  const tooltipBg = isDark ? '#18181b' : '#ffffff';
  const tooltipBorder = isDark ? '#27272a' : '#e4e4e7';

  const renderChart = () => {
    switch (spec.type) {
      case 'line':
        return (
          <LineChart data={spec.data}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis dataKey={spec.xKey} stroke={textColor} fontSize={12} tickLine={false} />
            <YAxis stroke={textColor} fontSize={12} tickLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: tooltipBg,
                borderColor: tooltipBorder,
                borderRadius: '8px',
                color: isDark ? '#ececec' : '#111827',
              }}
            />
            <Legend wrapperStyle={{ paddingTop: '8px' }} />
            {spec.series.map((s, idx) => (
              <Line
                key={s.dataKey}
                type="monotone"
                dataKey={s.dataKey}
                name={s.name || s.dataKey}
                stroke={s.color || PIE_COLORS[idx % PIE_COLORS.length]}
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            ))}
          </LineChart>
        );

      case 'bar':
        return (
          <BarChart data={spec.data}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis dataKey={spec.xKey} stroke={textColor} fontSize={12} tickLine={false} />
            <YAxis stroke={textColor} fontSize={12} tickLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: tooltipBg,
                borderColor: tooltipBorder,
                borderRadius: '8px',
                color: isDark ? '#ececec' : '#111827',
              }}
            />
            <Legend wrapperStyle={{ paddingTop: '8px' }} />
            {spec.series.map((s, idx) => (
              <Bar
                key={s.dataKey}
                dataKey={s.dataKey}
                name={s.name || s.dataKey}
                fill={s.color || PIE_COLORS[idx % PIE_COLORS.length]}
                radius={[4, 4, 0, 0]}
              />
            ))}
          </BarChart>
        );

      case 'area':
        return (
          <AreaChart data={spec.data}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis dataKey={spec.xKey} stroke={textColor} fontSize={12} tickLine={false} />
            <YAxis stroke={textColor} fontSize={12} tickLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: tooltipBg,
                borderColor: tooltipBorder,
                borderRadius: '8px',
                color: isDark ? '#ececec' : '#111827',
              }}
            />
            <Legend wrapperStyle={{ paddingTop: '8px' }} />
            {spec.series.map((s, idx) => {
              const color = s.color || PIE_COLORS[idx % PIE_COLORS.length];
              return (
                <Area
                  key={s.dataKey}
                  type="monotone"
                  dataKey={s.dataKey}
                  name={s.name || s.dataKey}
                  stroke={color}
                  fill={color}
                  fillOpacity={0.2}
                />
              );
            })}
          </AreaChart>
        );

      case 'pie':
        const firstSeries = spec.series[0]?.dataKey || 'value';
        return (
          <PieChart>
            <Tooltip
              contentStyle={{
                backgroundColor: tooltipBg,
                borderColor: tooltipBorder,
                borderRadius: '8px',
                color: isDark ? '#ececec' : '#111827',
              }}
            />
            <Legend />
            <Pie
              data={spec.data}
              dataKey={firstSeries}
              nameKey={spec.xKey}
              cx="50%"
              cy="50%"
              outerRadius={90}
              innerRadius={45}
              paddingAngle={4}
              label
            >
              {spec.data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        );
      default:
        return null;
    }
  };

  return (
    <div className="my-4 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 shadow-xs">
      <h4 className="text-sm font-semibold mb-3 text-zinc-900 dark:text-zinc-100 flex items-center justify-between">
        <span>{spec.title}</span>
        <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
          {spec.type} chart
        </span>
      </h4>
      <div className="w-full h-64 sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart() || <div>Invalid Chart Spec</div>}
        </ResponsiveContainer>
      </div>
    </div>
  );
};
