'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Webhook, Plus, Trash2, RefreshCw, Play, CheckCircle, XCircle, X, ChevronDown, ChevronUp } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate } from '@/lib/utils';

interface WebhookItem {
  id: string;
  url: string;
  events: string[];
  isActive: boolean;
  secret: string;
  createdAt: string;
  lastDeliveryAt: string | null;
  failureCount: number;
}

interface WebhookLog {
  id: string;
  event: string;
  responseStatus: number | null;
  success: boolean;
  duration: number | null;
  createdAt: string;
}

const EVENT_OPTIONS = [
  'message.sent',
  'message.delivered',
  'message.failed',
  'message.received',
  'device.online',
  'device.offline',
  'contact.created',
  'contact.deleted',
];

export default function WebhooksPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [newUrl, setNewUrl] = useState('');
  const [newEvents, setNewEvents] = useState<string[]>(['message.sent', 'message.delivered', 'message.failed']);
  const queryClient = useQueryClient();

  const { data: webhooks = [], isLoading } = useQuery<WebhookItem[]>({
    queryKey: ['webhooks'],
    queryFn: () => apiClient.get('/webhooks').then((r) => r.data),
  });

  const { data: logs = [] } = useQuery<WebhookLog[]>({
    queryKey: ['webhook-logs', expandedId],
    queryFn: () => apiClient.get(`/webhooks/${expandedId}/logs`).then((r) => r.data),
    enabled: !!expandedId,
  });

  const createMutation = useMutation({
    mutationFn: (payload: { url: string; events: string[] }) =>
      apiClient.post('/webhooks', payload).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
      setShowCreate(false);
      setNewUrl('');
      setNewEvents(['message.sent', 'message.delivered', 'message.failed']);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/webhooks/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['webhooks'] }),
  });

  const rotateMutation = useMutation({
    mutationFn: (id: string) => apiClient.post(`/webhooks/${id}/rotate-secret`).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['webhooks'] }),
  });

  const testMutation = useMutation({
    mutationFn: (id: string) => apiClient.post(`/webhooks/${id}/test`).then((r) => r.data),
  });

  const toggleEvent = (event: string) => {
    setNewEvents((prev) =>
      prev.includes(event) ? prev.filter((e) => e !== event) : [...prev, event],
    );
  };

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-dark-900">Webhooks</h1>
          <p className="text-sm text-dark-500 mt-0.5">
            Receive real-time HTTP notifications for SMS events.
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-md transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add webhook
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : webhooks.length === 0 ? (
        <Card className="py-12 text-center">
          <Webhook className="w-10 h-10 text-dark-300 mx-auto mb-3" />
          <h3 className="font-semibold text-dark-800 mb-1">No webhooks configured</h3>
          <p className="text-sm text-dark-400">
            Add a webhook endpoint to receive event notifications.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {webhooks.map((wh) => (
            <Card key={wh.id} className="overflow-hidden">
              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={wh.isActive ? 'green' : 'gray'}>
                        {wh.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      {wh.failureCount > 0 && (
                        <Badge variant="error">{wh.failureCount} failures</Badge>
                      )}
                    </div>
                    <p className="text-sm font-mono text-dark-800 mb-2 break-all">{wh.url}</p>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {wh.events.map((e) => (
                        <Badge key={e} variant="gray" className="text-[10px] font-mono">
                          {e}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-dark-400">
                      <span>Created {formatDate(wh.createdAt)}</span>
                      {wh.lastDeliveryAt && <span>Last delivery {formatDate(wh.lastDeliveryAt)}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => testMutation.mutate(wh.id)}
                      disabled={testMutation.isPending}
                      title="Send test event"
                      className="p-1.5 rounded hover:bg-surface-warm text-dark-400 hover:text-dark-700 transition-colors"
                    >
                      <Play className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => rotateMutation.mutate(wh.id)}
                      disabled={rotateMutation.isPending}
                      title="Rotate secret"
                      className="p-1.5 rounded hover:bg-surface-warm text-dark-400 hover:text-dark-700 transition-colors"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteMutation.mutate(wh.id)}
                      className="p-1.5 rounded hover:bg-red-50 text-dark-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => toggleExpand(wh.id)}
                      className="p-1.5 rounded hover:bg-surface-warm text-dark-400 hover:text-dark-700 transition-colors"
                    >
                      {expandedId === wh.id ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Delivery logs */}
              {expandedId === wh.id && (
                <div className="border-t border-surface-cool bg-surface-soft px-5 py-4">
                  <h4 className="text-xs font-semibold text-dark-600 uppercase tracking-wide mb-3">
                    Recent Deliveries
                  </h4>
                  {logs.length === 0 ? (
                    <p className="text-sm text-dark-400">No deliveries yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {logs.map((log) => (
                        <div
                          key={log.id}
                          className="flex items-center gap-3 text-xs bg-white border border-surface-cool rounded-md px-3 py-2"
                        >
                          {log.success ? (
                            <CheckCircle className="w-3.5 h-3.5 text-brand-500 shrink-0" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                          )}
                          <span className="font-mono text-dark-600 flex-1">{log.event}</span>
                          <span
                            className={`font-mono font-semibold ${
                              log.responseStatus && log.responseStatus < 300
                                ? 'text-brand-600'
                                : 'text-red-600'
                            }`}
                          >
                            {log.responseStatus ?? 'timeout'}
                          </span>
                          {log.duration && (
                            <span className="text-dark-400">{log.duration}ms</span>
                          )}
                          <span className="text-dark-400">{formatDate(log.createdAt)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Security note */}
      <Card className="p-5 bg-surface-soft border-surface-cool">
        <h3 className="text-sm font-semibold text-dark-800 mb-2">Verifying webhook signatures</h3>
        <p className="text-xs text-dark-500 mb-2">
          Each request includes an{' '}
          <code className="font-mono bg-white px-1 py-0.5 rounded border border-surface-cool">
            X-SMSFlow-Signature
          </code>{' '}
          header. Verify it with your webhook secret:
        </p>
        <code className="block text-xs font-mono text-dark-700 bg-white border border-surface-cool px-3 py-2.5 rounded-md leading-5 whitespace-pre">
          {`const sig = req.headers['x-smsflow-signature'];
const expected = crypto
  .createHmac('sha256', WEBHOOK_SECRET)
  .update(JSON.stringify(req.body))
  .digest('hex');
if (sig !== expected) throw new Error('Invalid signature');`}
        </code>
      </Card>

      {/* Create dialog */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-dark-900">Add Webhook</h2>
              <button
                onClick={() => setShowCreate(false)}
                className="p-1 rounded hover:bg-surface-warm"
              >
                <X className="w-5 h-5 text-dark-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-dark-600 mb-1">
                  Endpoint URL *
                </label>
                <input
                  type="url"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="https://example.com/webhooks/smsflow"
                  className="w-full px-3 py-2 text-sm border border-surface-cool rounded-md outline-none focus:border-brand-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-dark-600 mb-2">
                  Events to listen for
                </label>
                <div className="space-y-1.5">
                  {EVENT_OPTIONS.map((event) => (
                    <label
                      key={event}
                      className="flex items-center gap-2.5 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={newEvents.includes(event)}
                        onChange={() => toggleEvent(event)}
                        className="h-3.5 w-3.5 rounded text-brand-600 border-surface-cool focus:ring-brand-500"
                      />
                      <span className="text-sm font-mono text-dark-700">{event}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setShowCreate(false)}
                className="flex-1 py-2 border border-surface-cool rounded-md text-sm font-medium text-dark-700 hover:bg-surface-warm"
              >
                Cancel
              </button>
              <button
                onClick={() => createMutation.mutate({ url: newUrl, events: newEvents })}
                disabled={!newUrl || newEvents.length === 0 || createMutation.isPending}
                className="flex-1 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-md disabled:opacity-60"
              >
                {createMutation.isPending ? 'Adding...' : 'Add webhook'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
