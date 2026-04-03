'use client';

import { useQuery } from '@tanstack/react-query';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import {
  MessageSquare,
  CheckCircle,
  Smartphone,
  CreditCard,
  TrendingUp,
  Activity,
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  trend,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  trend?: number;
}) {
  return (
    <Card className="flex items-start gap-4">
      <div className="p-2.5 rounded-lg bg-brand-50 shrink-0">
        <Icon className="w-5 h-5 text-brand-600" />
      </div>
      <div className="min-w-0">
        <p className="text-sm text-dark-500 font-medium">{label}</p>
        <p className="text-2xl font-bold text-dark-900 mt-0.5">{value}</p>
        {sub && <p className="text-xs text-dark-400 mt-0.5">{sub}</p>}
      </div>
      {trend !== undefined && (
        <div className="ml-auto shrink-0">
          <span className={`text-xs font-medium ${trend >= 0 ? 'text-brand-600' : 'text-error'}`}>
            {trend >= 0 ? '+' : ''}{trend}%
          </span>
        </div>
      )}
    </Card>
  );
}

const STATUS_BADGE: Record<string, 'green' | 'warning' | 'error' | 'gray'> = {
  DELIVERED: 'green',
  SENT: 'green',
  DISPATCHED: 'green',
  PENDING: 'warning',
  QUEUED: 'warning',
  FAILED: 'error',
  EXPIRED: 'gray',
};

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['analytics', 'dashboard'],
    queryFn: () => apiClient.get('/analytics/dashboard').then((r) => r.data),
    refetchInterval: 30000,
  });

  const { data: chartData, isLoading: chartLoading } = useQuery({
    queryKey: ['analytics', 'chart'],
    queryFn: () => apiClient.get('/analytics/chart?days=7').then((r) => r.data),
  });

  const { data: messagesData } = useQuery({
    queryKey: ['messages', 'recent'],
    queryFn: () => apiClient.get('/messages?limit=5').then((r) => r.data),
  });

  const { data: devicesData } = useQuery({
    queryKey: ['devices'],
    queryFn: () => apiClient.get('/devices').then((r) => r.data),
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-dark-900">Dashboard</h1>
        <p className="text-sm text-dark-500 mt-0.5">Welcome back. Here&apos;s what&apos;s happening.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28" />)
        ) : (
          <>
            <StatCard
              label="Sent Today"
              value={stats?.sentToday ?? 0}
              icon={MessageSquare}
              sub="Outbound messages"
            />
            <StatCard
              label="Delivery Rate"
              value={`${stats?.deliveryRate ?? 0}%`}
              icon={CheckCircle}
              sub="Last 24 hours"
              trend={stats?.deliveryRate}
            />
            <StatCard
              label="Active Devices"
              value={stats?.activeDevices ?? 0}
              icon={Smartphone}
              sub="Currently online"
            />
            <StatCard
              label="SMS Balance"
              value={stats?.smsBalance ?? 0}
              icon={CreditCard}
              sub={`of ${stats?.smsLimit ?? 0} this month`}
            />
          </>
        )}
      </div>

      {/* Chart + Devices grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Bar chart */}
        <Card className="xl:col-span-2 p-0 overflow-hidden">
          <div className="px-6 py-4 border-b border-surface-cool flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-brand-600" />
            <h2 className="font-semibold text-dark-800 text-sm">Message volume (last 7 days)</h2>
          </div>
          <div className="p-6">
            {chartLoading ? (
              <Skeleton className="h-52 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
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
                      borderRadius: '8px',
                      border: '1px solid #E5E7EB',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="sent" name="Sent" fill="#10B981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="failed" name="Failed" fill="#EF4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        {/* Device status */}
        <Card className="p-0 overflow-hidden">
          <div className="px-6 py-4 border-b border-surface-cool flex items-center gap-2">
            <Activity className="w-4 h-4 text-brand-600" />
            <h2 className="font-semibold text-dark-800 text-sm">Devices</h2>
          </div>
          <div className="p-4 space-y-3 max-h-72 overflow-auto">
            {!devicesData || devicesData.length === 0 ? (
              <p className="text-sm text-dark-400 py-6 text-center">No devices connected</p>
            ) : (
              devicesData.map((device: any) => (
                <div key={device.id} className="flex items-center gap-3 p-3 rounded-lg bg-surface-soft border border-surface-cool">
                  <Smartphone className="w-4 h-4 text-dark-400 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-dark-800 truncate">{device.name}</p>
                    <p className="text-xs text-dark-400 truncate">{device.model}</p>
                  </div>
                  <Badge variant={device.status === 'ONLINE' ? 'green' : 'gray'}>
                    {device.status}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Recent messages */}
      <Card className="p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-surface-cool flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-brand-600" />
          <h2 className="font-semibold text-dark-800 text-sm">Recent messages</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-medium text-dark-500 uppercase tracking-wide border-b border-surface-cool">
                <th className="px-6 py-3">To</th>
                <th className="px-6 py-3">Message</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-cool">
              {!messagesData?.data || messagesData.data.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-sm text-dark-400">
                    No messages yet. Send your first SMS!
                  </td>
                </tr>
              ) : (
                messagesData.data.map((msg: any) => (
                  <tr key={msg.id} className="hover:bg-surface-soft transition-colors">
                    <td className="px-6 py-4 text-sm font-mono text-dark-700">{msg.phoneNumber}</td>
                    <td className="px-6 py-4 text-sm text-dark-600 max-w-xs truncate">{msg.body}</td>
                    <td className="px-6 py-4">
                      <Badge variant={STATUS_BADGE[msg.status] || 'gray'}>{msg.status}</Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-dark-400">
                      {new Date(msg.createdAt).toLocaleTimeString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
