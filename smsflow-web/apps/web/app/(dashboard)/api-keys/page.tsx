'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Key, Plus, Copy, Trash2, Eye, EyeOff, X, Check } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate } from '@/lib/utils';

interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  permissions: string[];
  lastUsedAt: string | null;
  createdAt: string;
  expiresAt: string | null;
}

const SCOPE_OPTIONS = [
  { value: 'messages:read', label: 'Messages Read' },
  { value: 'messages:write', label: 'Messages Write' },
  { value: 'contacts:read', label: 'Contacts Read' },
  { value: 'contacts:write', label: 'Contacts Write' },
  { value: 'devices:read', label: 'Devices Read' },
  { value: 'templates:read', label: 'Templates Read' },
  { value: 'templates:write', label: 'Templates Write' },
  { value: 'analytics:read', label: 'Analytics Read' },
];

export default function ApiKeysPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyScopes, setNewKeyScopes] = useState<string[]>(['messages:write']);
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [revealedKeys, setRevealedKeys] = useState<Set<string>>(new Set());
  const queryClient = useQueryClient();

  const { data: apiKeys = [], isLoading } = useQuery<ApiKey[]>({
    queryKey: ['api-keys'],
    queryFn: () => apiClient.get('/api-keys').then((r) => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (payload: { name: string; permissions: string[] }) =>
      apiClient.post('/api-keys', payload).then((r) => r.data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
      setCreatedKey(data.key);
      setShowCreate(false);
      setNewKeyName('');
      setNewKeyScopes(['messages:write']);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/api-keys/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['api-keys'] }),
  });

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleReveal = (id: string) => {
    setRevealedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleScope = (scope: string) => {
    setNewKeyScopes((prev) =>
      prev.includes(scope) ? prev.filter((s) => s !== scope) : [...prev, scope],
    );
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-dark-900">API Keys</h1>
          <p className="text-sm text-dark-500 mt-0.5">
            Authenticate programmatic access to the SMSFlow API.
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-md transition-colors"
        >
          <Plus className="w-4 h-4" />
          New API key
        </button>
      </div>

      {/* Revealed key banner */}
      {createdKey && (
        <div className="rounded-lg border border-brand-200 bg-brand-50 p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-brand-800 mb-1">
                Your new API key — copy it now, it won't be shown again.
              </p>
              <code className="block text-sm font-mono text-brand-700 break-all bg-brand-100 px-3 py-2 rounded-md">
                {createdKey}
              </code>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => copyToClipboard(createdKey)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-brand-700 bg-brand-100 hover:bg-brand-200 rounded-md transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
              <button
                onClick={() => setCreatedKey(null)}
                className="p-1 rounded hover:bg-brand-100 text-brand-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* API Keys list */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      ) : apiKeys.length === 0 ? (
        <Card className="py-12 text-center">
          <Key className="w-10 h-10 text-dark-300 mx-auto mb-3" />
          <h3 className="font-semibold text-dark-800 mb-1">No API keys yet</h3>
          <p className="text-sm text-dark-400">
            Create an API key to authenticate your applications.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {apiKeys.map((k) => (
            <Card key={k.id} className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Key className="w-4 h-4 text-dark-400 shrink-0" />
                    <h3 className="font-semibold text-dark-900 text-sm">{k.name}</h3>
                    {k.expiresAt && new Date(k.expiresAt) < new Date() && (
                      <Badge variant="error">Expired</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <code className="text-xs font-mono text-dark-500 bg-surface-soft px-2 py-0.5 rounded">
                      {k.keyPrefix}••••••••••••••••
                    </code>
                    <span className="text-[10px] text-dark-400 italic">
                      Full key shown only at creation
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {k.permissions.map((s) => (
                      <Badge key={s} variant="gray" className="text-[10px] font-mono">
                        {s}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-dark-400">
                    <span>Created {formatDate(k.createdAt)}</span>
                    {k.lastUsedAt ? (
                      <span>Last used {formatDate(k.lastUsedAt)}</span>
                    ) : (
                      <span>Never used</span>
                    )}
                    {k.expiresAt && <span>Expires {formatDate(k.expiresAt)}</span>}
                  </div>
                </div>
                <button
                  onClick={() => deleteMutation.mutate(k.id)}
                  className="p-1.5 rounded hover:bg-red-50 text-dark-400 hover:text-red-600 transition-colors shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Usage guide */}
      <Card className="p-5 bg-surface-soft border-surface-cool">
        <h3 className="text-sm font-semibold text-dark-800 mb-3">Using your API key</h3>
        <div className="space-y-2">
          <p className="text-xs text-dark-500">Include the key in the Authorization header:</p>
          <code className="block text-xs font-mono text-dark-700 bg-white border border-surface-cool px-3 py-2 rounded-md">
            Authorization: Bearer sk_live_xxxxxxxxxxxxxxxx
          </code>
          <p className="text-xs text-dark-500 mt-2">Example — send an SMS:</p>
          <code className="block text-xs font-mono text-dark-700 bg-white border border-surface-cool px-3 py-2.5 rounded-md leading-5 whitespace-pre">
            {`curl -X POST ${process.env.NEXT_PUBLIC_API_URL ?? 'https://api.smsflow.io'}/messages \\
  -H "Authorization: Bearer <YOUR_KEY>" \\
  -H "Content-Type: application/json" \\
  -d '{"phoneNumber":"+15551234567","body":"Hello world"}'`}
          </code>
        </div>
      </Card>

      {/* Create dialog */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-dark-900">New API Key</h2>
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
                  Key name *
                </label>
                <input
                  type="text"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="My application"
                  className="w-full px-3 py-2 text-sm border border-surface-cool rounded-md outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-dark-600 mb-2">
                  Permissions
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {SCOPE_OPTIONS.map((scope) => (
                    <label
                      key={scope.value}
                      className="flex items-center gap-2 p-2 rounded-md border border-surface-cool cursor-pointer hover:bg-surface-soft transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={newKeyScopes.includes(scope.value)}
                        onChange={() => toggleScope(scope.value)}
                        className="h-3.5 w-3.5 rounded text-brand-600 border-surface-cool focus:ring-brand-500"
                      />
                      <span className="text-xs text-dark-700 font-mono">{scope.value}</span>
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
                onClick={() =>
                  createMutation.mutate({ name: newKeyName, permissions: newKeyScopes })
                }
                disabled={!newKeyName || newKeyScopes.length === 0 || createMutation.isPending}
                className="flex-1 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-md disabled:opacity-60"
              >
                {createMutation.isPending ? 'Creating...' : 'Create key'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
