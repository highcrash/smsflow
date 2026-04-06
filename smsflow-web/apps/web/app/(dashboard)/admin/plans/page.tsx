'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit3, Trash2, X, Package } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

const emptyPlan = {
  id: '',
  name: '',
  stripePriceId: '',
  price: 0,
  interval: 'month',
  smsLimit: 500,
  deviceLimit: 1,
  contactLimit: 500,
  templateLimit: 50,
  webhookLimit: 5,
  teamLimit: 1,
  features: {},
  isActive: true,
};

function PlanForm({
  plan,
  onSave,
  onCancel,
  saving,
  isNew,
}: {
  plan: any;
  onSave: (data: any) => void;
  onCancel: () => void;
  saving: boolean;
  isNew: boolean;
}) {
  const [form, setForm] = useState({ ...plan });
  const set = (key: string, value: any) => setForm({ ...form, [key]: value });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-dark-900">{isNew ? 'Create Plan' : 'Edit Plan'}</h2>
          <button onClick={onCancel} className="p-1 rounded hover:bg-surface-warm text-dark-500">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase text-dark-600 mb-1">Plan ID</label>
              <input
                value={form.id}
                onChange={(e) => set('id', e.target.value.toUpperCase())}
                disabled={!isNew}
                placeholder="STARTER"
                className="w-full px-3 py-2 rounded-md border border-surface-cool text-sm outline-none focus:border-brand-500 disabled:bg-surface-soft disabled:text-dark-400"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-dark-600 mb-1">Name</label>
              <input
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="Starter"
                className="w-full px-3 py-2 rounded-md border border-surface-cool text-sm outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase text-dark-600 mb-1">Price (cents)</label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => set('price', Number(e.target.value))}
                className="w-full px-3 py-2 rounded-md border border-surface-cool text-sm outline-none focus:border-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-dark-600 mb-1">Interval</label>
              <select
                value={form.interval}
                onChange={(e) => set('interval', e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-surface-cool text-sm outline-none focus:border-brand-500 bg-white"
              >
                <option value="month">Monthly</option>
                <option value="year">Yearly</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-dark-600 mb-1">Stripe Price ID</label>
              <input
                value={form.stripePriceId}
                onChange={(e) => set('stripePriceId', e.target.value)}
                placeholder="price_xxx"
                className="w-full px-3 py-2 rounded-md border border-surface-cool text-sm outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <div className="border-t border-surface-cool pt-4">
            <p className="text-xs font-bold uppercase text-dark-600 mb-3">Limits</p>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-dark-500 mb-1">SMS / month</label>
                <input
                  type="number"
                  value={form.smsLimit}
                  onChange={(e) => set('smsLimit', Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-md border border-surface-cool text-sm outline-none focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs text-dark-500 mb-1">Devices</label>
                <input
                  type="number"
                  value={form.deviceLimit}
                  onChange={(e) => set('deviceLimit', Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-md border border-surface-cool text-sm outline-none focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs text-dark-500 mb-1">Contacts</label>
                <input
                  type="number"
                  value={form.contactLimit}
                  onChange={(e) => set('contactLimit', Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-md border border-surface-cool text-sm outline-none focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs text-dark-500 mb-1">Templates</label>
                <input
                  type="number"
                  value={form.templateLimit}
                  onChange={(e) => set('templateLimit', Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-md border border-surface-cool text-sm outline-none focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs text-dark-500 mb-1">Webhooks</label>
                <input
                  type="number"
                  value={form.webhookLimit}
                  onChange={(e) => set('webhookLimit', Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-md border border-surface-cool text-sm outline-none focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs text-dark-500 mb-1">Team Members</label>
                <input
                  type="number"
                  value={form.teamLimit}
                  onChange={(e) => set('teamLimit', Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-md border border-surface-cool text-sm outline-none focus:border-brand-500"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-dark-700 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => set('isActive', e.target.checked)}
                className="rounded border-surface-cool text-brand-600 focus:ring-brand-500"
              />
              Active
            </label>
          </div>

          <button
            onClick={() => onSave(form)}
            disabled={saving}
            className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-md transition-colors disabled:opacity-60"
          >
            {saving ? 'Saving...' : isNew ? 'Create Plan' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminPlansPage() {
  const queryClient = useQueryClient();
  const [editPlan, setEditPlan] = useState<any>(null);
  const [isNew, setIsNew] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ['admin-plans'],
    queryFn: () => apiClient.get('/admin/plans').then((r) => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (dto: any) => apiClient.post('/admin/plans', dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-plans'] });
      setEditPlan(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: any }) => apiClient.patch(`/admin/plans/${id}`, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-plans'] });
      setEditPlan(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/admin/plans/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-plans'] });
      setDeleteConfirm(null);
    },
  });

  const handleSave = (form: any) => {
    if (isNew) {
      createMutation.mutate(form);
    } else {
      const { id, ...dto } = form;
      updateMutation.mutate({ id, dto });
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-dark-900">Plans</h1>
          <p className="text-sm text-dark-500 mt-0.5">Manage subscription plans and pricing.</p>
        </div>
        <button
          onClick={() => {
            setEditPlan({ ...emptyPlan });
            setIsNew(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-md transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Plan
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-64" />)}
        </div>
      ) : plans.length === 0 ? (
        <Card className="py-16 text-center">
          <div className="w-14 h-14 rounded-full bg-brand-50 flex items-center justify-center mx-auto mb-4">
            <Package className="w-7 h-7 text-brand-500" />
          </div>
          <h3 className="font-semibold text-dark-800 mb-2">No plans yet</h3>
          <p className="text-sm text-dark-400 max-w-xs mx-auto mb-6">
            Create your first subscription plan to get started.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.map((plan: any) => (
            <Card key={plan.id} className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-dark-900">{plan.name}</h3>
                    <Badge variant={plan.isActive ? 'green' : 'gray'}>
                      {plan.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <p className="text-xs text-dark-400 mt-0.5">{plan.id}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-dark-900">
                    ${(plan.price / 100).toFixed(2)}
                  </p>
                  <p className="text-xs text-dark-400">/{plan.interval}</p>
                </div>
              </div>

              <div className="space-y-2 border-t border-surface-cool pt-3 mb-4">
                <div className="flex justify-between text-xs">
                  <span className="text-dark-500">SMS / month</span>
                  <span className="font-medium text-dark-700">{plan.smsLimit.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-dark-500">Devices</span>
                  <span className="font-medium text-dark-700">{plan.deviceLimit}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-dark-500">Contacts</span>
                  <span className="font-medium text-dark-700">{plan.contactLimit.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-dark-500">Templates</span>
                  <span className="font-medium text-dark-700">{plan.templateLimit}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-dark-500">Webhooks</span>
                  <span className="font-medium text-dark-700">{plan.webhookLimit}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-dark-500">Team Members</span>
                  <span className="font-medium text-dark-700">{plan.teamLimit}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setEditPlan(plan);
                    setIsNew(false);
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-surface-cool text-dark-700 text-xs font-semibold rounded-md hover:bg-surface-warm transition-colors"
                >
                  <Edit3 size={13} />
                  Edit
                </button>
                <button
                  onClick={() => setDeleteConfirm(plan.id)}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 border border-red-200 text-red-600 text-xs font-semibold rounded-md hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Plan Form Modal */}
      {editPlan && (
        <PlanForm
          plan={editPlan}
          isNew={isNew}
          onSave={handleSave}
          onCancel={() => setEditPlan(null)}
          saving={createMutation.isPending || updateMutation.isPending}
        />
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full">
            <h2 className="text-lg font-bold text-dark-900 mb-2">Delete Plan</h2>
            <p className="text-sm text-dark-500 mb-5">
              This plan will be permanently deleted. Plans with active subscriptions cannot be deleted.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 border border-surface-cool text-dark-700 text-sm font-semibold rounded-md hover:bg-surface-warm transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteMutation.mutate(deleteConfirm)}
                disabled={deleteMutation.isPending}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-md transition-colors disabled:opacity-60"
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
