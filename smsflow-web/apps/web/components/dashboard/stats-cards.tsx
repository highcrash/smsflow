import { TrendingUp, TrendingDown, Send, CheckCircle, Smartphone, BarChart3 } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
}

function StatCard({ title, value, change, changeType = 'neutral', icon }: StatCardProps) {
  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold text-dark-500 uppercase tracking-wide">{title}</p>
        <div className="w-9 h-9 rounded-sm bg-brand-50 flex items-center justify-center text-brand-600">
          {icon}
        </div>
      </div>
      <p className="text-3xl font-black text-dark-900 tracking-tight">{value}</p>
      {change && (
        <p
          className={`text-xs font-semibold mt-1 flex items-center gap-1 ${
            changeType === 'up'
              ? 'text-brand-600'
              : changeType === 'down'
                ? 'text-red-500'
                : 'text-dark-400'
          }`}
        >
          {changeType === 'up' && <TrendingUp size={12} />}
          {changeType === 'down' && <TrendingDown size={12} />}
          {change}
        </p>
      )}
    </div>
  );
}

export function StatsCards() {
  return (
    <div className="grid grid-cols-4 gap-4">
      <StatCard
        title="Total Sent"
        value="24,847"
        change="+12.5% from last month"
        changeType="up"
        icon={<Send size={18} />}
      />
      <StatCard
        title="Delivery Rate"
        value="98.2%"
        change="+0.8% improvement"
        changeType="up"
        icon={<CheckCircle size={18} />}
      />
      <StatCard
        title="Active Devices"
        value="3"
        change="of 5 connected"
        changeType="neutral"
        icon={<Smartphone size={18} />}
      />
      <StatCard
        title="SMS Balance"
        value="2,153"
        change="Renews in 12 days"
        changeType="neutral"
        icon={<BarChart3 size={18} />}
      />
    </div>
  );
}
