'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { TrendingUp, MessageSquare, CheckCircle, XCircle, Clock } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const RANGES = [
  { label: '7 days', value: '7d' },
  { label: '30 days', value: '30d' },
  { label: '90 days', value: '90d' },
];

const PIE_COLORS = ['#059669', '#F59E0B', '#EF4444', '#6B7280'];

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  color: string;
}

function StatCard({ label, value, sub, icon, color }: StatCardProps) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-dark-500 uppercase tracking-wide mb-1">{label}</p>
          <p className="text-2xl font-bold text-dark-900">{value}</p>
          {sub && <p className="text-xs text-dark-400 mt-0.5">{sub}</p>}
        </div>
        <div className={`p-2.5 rounded-lg ${color}`}>{icon}</div>
      </div>
    </Card>
  );
}

export default function AnalyticsPage() {
  const [range, setRange] = useState('7d');

  const { data, isLoading } = useQuery({
    queryKey: ['analytics', range],
    queryFn: () =>
      apiClient.get('/analytics', { params: { range } }).then((r) => r.data),
  });

  const stats = data?.stats ?? {
    totalSent: 0,
    delivered: 0,
    failed: 0,
    pending: 0,
    deliveryRate: 0,
  };

  const timeSeries = data?.timeSeries ?? [];
  const deviceBreakdown = data?.deviceBreakdown ?? [];
  const statusBreakdown = data?.statusBreakdown ?? [
    { name: 'Delivered', value: stats.delivered },
    { name: 'Pending', value: stats.pending },
    { name: 'Failed', value: stats.failed },
    { name: 'Other', value: 0 },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-dark-900">Analytics</h1>
          <p className="text-sm text-dark-500 mt-0.5">SMS delivery performance and trends.</p>
        </div>
        <div className="flex items-center gap-1 bg-surface-soft border border-surface-cool rounded-lg p-1">
          {RANGES.map((r) => (
            <button
              key={r.value}
              onClick={() => setRange(r.value)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                range === r.value
                  ? 'bg-white text-dark-900 shadow-sm'
                  : 'text-dark-500 hover:text-dark-700'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stat cards */}
      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Sent"
            value={stats.totalSent.toLocaleString()}
            sub={`Last ${range}`}
            icon={<MessageSquare className="w-5 h-5 text-brand-600" />}
            color="bg-brand-50"
          />
          <StatCard
            label="Delivered"
            value={stats.delivered.toLocaleString()}
            sub={`${stats.deliveryRate.toFixed(1)}% rate`}
            icon={<CheckCircle className="w-5 h-5 text-brand-600" />}
            color="bg-brand-50"
          />
          <StatCard
            label="Failed"
            value={stats.failed.toLocaleString()}
            sub={stats.totalSent > 0 ? `${((stats.failed / stats.totalSent) * 100).toFixed(1)}% rate` : '—'}
            icon={<XCircle className="w-5 h-5 text-red-500" />}
            color="bg-red-50"
          />
          <StatCard
            label="Pending"
            value={stats.pending.toLocaleString()}
            sub="In queue"
            icon={<Clock className="w-5 h-5 text-amber-500" />}
            color="bg-amber-50"
          />
        </div>
      )}

      {/* Volume over time */}
      <Card className="p-5">
        <h3 className="text-sm font-semibold text-dark-800 mb-4">Message Volume</h3>
        {isLoading ? (
          <Skeleton className="h-56" />
        ) : (
          <ResponsiveContainer width="100%" height={224}>
            <AreaChart data={timeSeries} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#059669" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorDelivered" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#34D399" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#34D399" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: '#6B7280' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#6B7280' }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  fontSize: 12,
                  border: '1px solid #E5E7EB',
                  borderRadius: 8,
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.08)',
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Area
                type="monotone"
                dataKey="sent"
                name="Sent"
                stroke="#059669"
                strokeWidth={2}
                fill="url(#colorSent)"
              />
              <Area
                type="monotone"
                dataKey="delivered"
                name="Delivered"
                stroke="#34D399"
                strokeWidth={2}
                fill="url(#colorDelivered)"
              />
              <Area
                type="monotone"
                dataKey="failed"
                name="Failed"
                stroke="#EF4444"
                strokeWidth={2}
                fill="none"
                strokeDasharray="4 2"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Messages by device */}
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-dark-800 mb-4">Messages by Device</h3>
          {isLoading ? (
            <Skeleton className="h-48" />
          ) : deviceBreakdown.length === 0 ? (
            <div className="h-48 flex items-center justify-center">
              <p className="text-sm text-dark-400">No device data available.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={192}>
              <BarChart
                data={deviceBreakdown}
                margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fontSize: 11, fill: '#6B7280' }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  tick={{ fontSize: 11, fill: '#6B7280' }}
                  axisLine={false}
                  tickLine={false}
                  width={80}
                />
                <Tooltip
                  contentStyle={{
                    fontSize: 12,
                    border: '1px solid #E5E7EB',
                    borderRadius: 8,
                  }}
                />
                <Bar dataKey="count" name="Messages" fill="#059669" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Status breakdown */}
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-dark-800 mb-4">Delivery Status</h3>
          {isLoading ? (
            <Skeleton className="h-48" />
          ) : (
            <div className="flex items-center gap-6">
              <ResponsiveContainer width="50%" height={192}>
                <PieChart>
                  <Pie
                    data={statusBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {statusBreakdown.map((_: any, index: number) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      fontSize: 12,
                      border: '1px solid #E5E7EB',
                      borderRadius: 8,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {statusBreakdown.map((entry: any, index: number) => (
                  <div key={entry.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-sm shrink-0"
                        style={{ background: PIE_COLORS[index % PIE_COLORS.length] }}
                      />
                      <span className="text-xs text-dark-600">{entry.name}</span>
                    </div>
                    <span className="text-xs font-semibold text-dark-800">
                      {entry.value.toLocaleString()}
                    </span>
                  </div>
                ))}
                {stats.totalSent > 0 && (
                  <div className="pt-2 border-t border-surface-cool mt-2">
                    <div className="flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-brand-500" />
                      <span className="text-xs font-semibold text-brand-600">
                        {stats.deliveryRate.toFixed(1)}% delivery rate
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
