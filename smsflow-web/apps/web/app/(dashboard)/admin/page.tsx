'use client';

import { useQuery } from '@tanstack/react-query';
import { Users, MessageSquare, Smartphone, CreditCard, UserCheck, Clock } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

function StatCard({ label, value, icon: Icon, color }: { label: string; value: number | string; icon: any; color: string }) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-2xl font-bold text-dark-900">{value?.toLocaleString?.() ?? value}</p>
          <p className="text-sm text-dark-500">{label}</p>
        </div>
      </div>
    </Card>
  );
}

export default function AdminPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => apiClient.get('/admin/stats').then((r) => r.data),
  });

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <h1 className="text-xl font-bold text-dark-900">Admin Overview</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="h-24" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-dark-900">Admin Overview</h1>
        <p className="text-sm text-dark-500 mt-0.5">Platform-wide statistics and management.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label="Total Users" value={stats?.totalUsers ?? 0} icon={Users} color="bg-blue-50 text-blue-600" />
        <StatCard label="Active Subscriptions" value={stats?.activeSubscriptions ?? 0} icon={CreditCard} color="bg-brand-50 text-brand-600" />
        <StatCard label="Trial Users" value={stats?.trialUsers ?? 0} icon={Clock} color="bg-amber-50 text-amber-600" />
        <StatCard label="Total Messages" value={stats?.totalMessages ?? 0} icon={MessageSquare} color="bg-purple-50 text-purple-600" />
        <StatCard label="Total Devices" value={stats?.totalDevices ?? 0} icon={Smartphone} color="bg-cyan-50 text-cyan-600" />
        <StatCard label="Online Devices" value={stats?.onlineDevices ?? 0} icon={UserCheck} color="bg-green-50 text-green-600" />
      </div>
    </div>
  );
}
