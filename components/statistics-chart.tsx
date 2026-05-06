'use client';

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

interface DailyData {
  date: string;
  displayDate?: string;
  dayOfWeek?: string;
  value: number;
}

interface StatisticsChartProps {
  title: string;
  data: DailyData[];
  type: 'bar' | 'line';
  goal?: number;
  metric: string;
  unit?: string;
}

export function StatisticsChart({
  title,
  data,
  type,
  goal,
  metric,
  unit = '',
}: StatisticsChartProps) {
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 h-96 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 font-medium">{title}</p>
          <p className="text-gray-400 text-sm mt-2">데이터가 없습니다</p>
        </div>
      </div>
    );
  }

  const chartData = data.map((item) => ({
    ...item,
    value: item.value || 0,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-300 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-800">
            {data.displayDate ? `${data.displayDate}일` : data.date}
          </p>
          <p className="text-sm text-blue-600 font-semibold">
            {metric}: {payload[0].value}
            {unit}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        {type === 'bar' ? (
          <BarChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="displayDate"
              tick={{ fontSize: 12 }}
              stroke="#888"
            />
            <YAxis tick={{ fontSize: 12 }} stroke="#888" />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" fill="#3b82f6" name={metric} radius={[8, 8, 0, 0]} />
            {goal && <ReferenceLine y={goal} stroke="#f59e0b" strokeDasharray="5 5" label={`목표: ${goal}`} />}
          </BarChart>
        ) : (
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="displayDate"
              tick={{ fontSize: 12 }}
              stroke="#888"
            />
            <YAxis tick={{ fontSize: 12 }} stroke="#888" />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ fill: '#10b981', r: 4 }}
              activeDot={{ r: 6 }}
              name={metric}
            />
            {goal && <ReferenceLine y={goal} stroke="#f59e0b" strokeDasharray="5 5" label={`목표: ${goal}`} />}
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
