'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FileText, Plus, Pencil, Trash2, X, Save } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { extractVariables } from '@smsflow/shared';

interface Template { id: string; name: string; body: string; variables: string[]; category?: string; }

export default function TemplatesPage() {
  const [editing, setEditing] = useState<Partial<Template> | null>(null);
  const queryClient = useQueryClient();

  const { data: templates = [], isLoading } = useQuery<Template[]>({
    queryKey: ['templates'],
    queryFn: () => apiClient.get('/templates').then((r) => r.data),
  });

  const saveMutation = useMutation({
    mutationFn: (t: Partial<Template>) =>
      t.id
        ? apiClient.patch(`/templates/${t.id}`, t).then((r) => r.data)
        : apiClient.post('/templates', t).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      setEditing(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/templates/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['templates'] }),
  });

  const preview = editing?.body ?? '';
  const variables = extractVariables(preview);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-dark-900">Templates</h1>
          <p className="text-sm text-dark-500 mt-0.5">Reusable SMS templates with dynamic variables.</p>
        </div>
        <button
          onClick={() => setEditing({ name: '', body: '' })}
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-md transition-colors"
        >
          <Plus className="w-4 h-4" />
          New template
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24" />)}
        </div>
      ) : templates.length === 0 ? (
        <Card className="py-12 text-center">
          <FileText className="w-10 h-10 text-dark-300 mx-auto mb-3" />
          <h3 className="font-semibold text-dark-800 mb-1">No templates yet</h3>
          <p className="text-sm text-dark-400">Create templates with {"{{variable}}"} placeholders.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {templates.map((t) => (
            <Card key={t.id} className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    <h3 className="font-semibold text-dark-900 text-sm">{t.name}</h3>
                    {t.category && <Badge variant="gray">{t.category}</Badge>}
                  </div>
                  <p className="text-sm text-dark-600 font-mono">{t.body}</p>
                  {t.variables.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {t.variables.map((v) => (
                        <Badge key={v} variant="green" className="font-mono text-[10px]">{'{{' + v + '}}'}</Badge>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => setEditing(t)}
                    className="p-1.5 rounded hover:bg-surface-warm text-dark-400 hover:text-dark-700 transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteMutation.mutate(t.id)}
                    className="p-1.5 rounded hover:bg-red-50 text-dark-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Edit / Create Dialog */}
      {editing !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-dark-900">
                {editing.id ? 'Edit Template' : 'New Template'}
              </h2>
              <button onClick={() => setEditing(null)} className="p-1 rounded hover:bg-surface-warm">
                <X className="w-5 h-5 text-dark-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-dark-600 mb-1">Name *</label>
                <input
                  type="text"
                  value={editing.name ?? ''}
                  onChange={(e) => setEditing((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Order Confirmation"
                  className="w-full px-3 py-2 text-sm border border-surface-cool rounded-md outline-none focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-dark-600 mb-1">Category</label>
                <input
                  type="text"
                  value={editing.category ?? ''}
                  onChange={(e) => setEditing((p) => ({ ...p, category: e.target.value }))}
                  placeholder="Marketing, Alerts, OTP..."
                  className="w-full px-3 py-2 text-sm border border-surface-cool rounded-md outline-none focus:border-brand-500"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-dark-600">Body *</label>
                  <span className="text-xs text-dark-400">{preview.length} chars</span>
                </div>
                <textarea
                  rows={4}
                  value={editing.body ?? ''}
                  onChange={(e) => setEditing((p) => ({ ...p, body: e.target.value }))}
                  placeholder="Hello {{name}}, your order {{orderId}} is confirmed!"
                  className="w-full px-3 py-2 text-sm border border-surface-cool rounded-md outline-none focus:border-brand-500 resize-none font-mono"
                />
                {variables.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    <span className="text-xs text-dark-400">Variables:</span>
                    {variables.map((v) => (
                      <Badge key={v} variant="green" className="font-mono text-[10px]">{'{{' + v + '}}'}</Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button onClick={() => setEditing(null)} className="flex-1 py-2 border border-surface-cool rounded-md text-sm font-medium text-dark-700 hover:bg-surface-warm">
                Cancel
              </button>
              <button
                onClick={() => saveMutation.mutate(editing)}
                disabled={!editing.name || !editing.body || saveMutation.isPending}
                className="flex-1 flex items-center justify-center gap-2 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-md disabled:opacity-60"
              >
                <Save className="w-4 h-4" />
                {saveMutation.isPending ? 'Saving...' : 'Save Template'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
