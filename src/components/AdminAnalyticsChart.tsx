import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface AdminAnalyticsChartProps {
  data: Array<{ label: string; clicks: number }>;
  currentTheme: 'normal' | 'mono' | 'light';
  primaryColor: string;
  analyticsMetric: 'total' | 'unique';
}

export const AdminAnalyticsChart: React.FC<AdminAnalyticsChartProps> = ({
  data,
  currentTheme,
  primaryColor,
  analyticsMetric,
}) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 5, right: 10, left: -28, bottom: 0 }}>
        <defs>
          <linearGradient id="clickGradientTotal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#FF5500" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#FF5500" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="clickGradientUnique" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          vertical={false}
          stroke={currentTheme === 'light' ? '#f1f5f9' : '#1e293b'}
        />
        <XAxis
          dataKey="label"
          tick={{ fill: currentTheme === 'light' ? '#64748b' : '#94a3b8', fontSize: 8 }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fill: currentTheme === 'light' ? '#64748b' : '#94a3b8', fontSize: 8 }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: currentTheme === 'light' ? '#ffffff' : '#0f172a',
            borderColor: currentTheme === 'light' ? '#e2e8f0' : '#1e293b',
            borderRadius: '8px',
            color: currentTheme === 'light' ? '#0f172a' : '#ffffff',
            fontSize: '10px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
          }}
          labelStyle={{ fontWeight: 'bold', color: primaryColor, marginBottom: '2px' }}
          itemStyle={{ color: currentTheme === 'light' ? '#0f172a' : '#ffffff', padding: 0 }}
        />
        <Area
          type="monotone"
          dataKey="clicks"
          name={analyticsMetric === 'unique' ? 'Unique Clicks' : 'Total Clicks'}
          stroke={primaryColor}
          strokeWidth={1.8}
          fillOpacity={1}
          fill={analyticsMetric === 'unique' ? 'url(#clickGradientUnique)' : 'url(#clickGradientTotal)'}
          activeDot={{ r: 4, strokeWidth: 0, fill: primaryColor }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default AdminAnalyticsChart;
