'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { MessageSquare, Filter, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate } from '@/lib/utils';

const STATUS_BADGE: Record<string, 'green' | 'warning' | 'error' | 'gray'> = {
  DELIVERED: 'green',
  SENT: 'green',
  DISPATCHED: 'green',
  PENDING: 'warning',
  QUEUED: 'warning',
  FAILED: 'error',
  EXPIRED: 'gray',
};

export default function MessagesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [direction, setDirection] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['messages', page, search, status, direction],
    queryFn: () =>
      apiClient
        .get('/messages', { params: { page, limit: 20, search, status, direction } })
        .then((r) => r.data),
  });

  const messages = data?.data ?? [];
  const meta = data?.meta ?? { total: 0, totalPages: 1 };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-dark-900">Messages</h1>
        <p className="text-sm text-dark-500 mt-0.5">All sent and received SMS messages.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
          <input
            type="text"
            placeholder="Search phone or message..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-3 py-2 text-sm border border-surface-cool rounded-md outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10"
          />
        </div>
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="px-3 py-2 text-sm border border-surface-cool rounded-md outline-none focus:border-brand-500 bg-white"
        >
          <option value="">All statuses</option>
          <option value="PENDING">Pending</option>
          <option value="SENT">Sent</option>
          <option value="DELIVERED">Delivered</option>
          <option value="FAILED">Failed</option>
        </select>
        <select
          value={direction}
          onChange={(e) => { setDirection(e.target.value); setPage(1); }}
          className="px-3 py-2 text-sm border border-surface-cool rounded-md outline-none focus:border-brand-500 bg-white"
        >
          <option value="">All directions</option>
          <option value="OUTBOUND">Outbound</option>
          <option value="INBOUND">Inbound</option>
        </select>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-semibold text-dark-500 uppercase tracking-wide border-b border-surface-cool bg-surface-soft">
                <th className="px-5 py-3">Phone</th>
                <th className="px-5 py-3">Message</th>
                <th className="px-5 py-3">Direction</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Device</th>
                <th className="px-5 py-3">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-cool">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="px-5 py-3">
                      <Skeleton className="h-5 w-full" />
                    </td>
                  </tr>
                ))
              ) : messages.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-sm text-dark-400">
                    No messages found.
                  </td>
                </tr>
              ) : (
                messages.map((msg: any) => (
                  <tr key={msg.id} className="hover:bg-surface-soft transition-colors">
                    <td className="px-5 py-3.5 text-sm font-mono text-dark-700">{msg.phoneNumber}</td>
                    <td className="px-5 py-3.5 text-sm text-dark-600 max-w-xs">
                      <span className="line-clamp-1">{msg.body}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge variant={msg.direction === 'OUTBOUND' ? 'info' : 'dark'}>
                        {msg.direction}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge variant={STATUS_BADGE[msg.status] ?? 'gray'}>{msg.status}</Badge>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-dark-500">
                      {msg.device?.name ?? '-'}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-dark-400">
                      {formatDate(msg.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-surface-cool bg-surface-soft">
            <p className="text-xs text-dark-500">
              {meta.total} total messages
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1 rounded hover:bg-surface-warm disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs text-dark-600 font-medium">
                {page} / {meta.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                disabled={page === meta.totalPages}
                className="p-1 rounded hover:bg-surface-warm disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
