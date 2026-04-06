'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  UserCog,
  LogIn,
  Trash2,
  Shield,
  Edit3,
  X,
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate } from '@/lib/utils';

const statusColors: Record<string, 'green' | 'warning' | 'error' | 'gray' | 'info'> = {
  ACTIVE: 'green',
  TRIAL: 'info',
  PAST_DUE: 'warning',
  CANCELED: 'error',
  PAUSED: 'gray',
};

const roleColors: Record<string, 'green' | 'warning' | 'error' | 'gray' | 'info'> = {
  SUPER_ADMIN: 'error',
  ADMIN: 'warning',
  USER: 'gray',
};

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [editModal, setEditModal] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', page, search],
    queryFn: () =>
      apiClient
        .get('/admin/users', { params: { page, limit: 15, search: search || undefined } })
        .then((r) => r.data),
  });

  const roleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) =>
      apiClient.patch(`/admin/users/${id}/role`, { role }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
  });

  const subMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: any }) =>
      apiClient.patch(`/admin/users/${id}/subscription`, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setEditModal(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/admin/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setDeleteConfirm(null);
    },
  });

  const impersonateMutation = useMutation({
    mutationFn: (id: string) =>
      apiClient.post(`/admin/users/${id}/impersonate`).then((r) => r.data),
    onSuccess: (data) => {
      // Store admin's current session
      localStorage.setItem('adminAccessToken', localStorage.getItem('accessToken') || '');
      localStorage.setItem('adminRefreshToken', localStorage.getItem('refreshToken') || '');
      localStorage.setItem('adminUser', localStorage.getItem('user') || '');
      // Switch to impersonated user
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('impersonating', 'true');
      window.location.href = '/dashboard';
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const users = data?.data ?? [];
  const meta = data?.meta ?? { page: 1, totalPages: 1, total: 0 };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-dark-900">Manage Users</h1>
          <p className="text-sm text-dark-500 mt-0.5">{meta.total} total users</p>
        </div>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch}>
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-10 pr-4 py-2.5 rounded-md border border-surface-cool text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10"
          />
        </div>
      </form>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-16" />)}
        </div>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-cool bg-surface-soft">
                  <th className="text-left px-4 py-3 font-semibold text-dark-700">User</th>
                  <th className="text-left px-4 py-3 font-semibold text-dark-700">Role</th>
                  <th className="text-left px-4 py-3 font-semibold text-dark-700">Plan</th>
                  <th className="text-left px-4 py-3 font-semibold text-dark-700">Status</th>
                  <th className="text-left px-4 py-3 font-semibold text-dark-700">SMS</th>
                  <th className="text-left px-4 py-3 font-semibold text-dark-700">Devices</th>
                  <th className="text-left px-4 py-3 font-semibold text-dark-700">Joined</th>
                  <th className="text-right px-4 py-3 font-semibold text-dark-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-cool">
                {users.map((user: any) => (
                  <tr key={user.id} className="hover:bg-surface-soft/50 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-dark-900">{user.name || 'Unnamed'}</p>
                        <p className="text-xs text-dark-400">{user.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={user.role}
                        onChange={(e) => roleMutation.mutate({ id: user.id, role: e.target.value })}
                        className="text-xs border border-surface-cool rounded px-2 py-1 bg-white outline-none focus:border-brand-500"
                      >
                        <option value="USER">USER</option>
                        <option value="ADMIN">ADMIN</option>
                        <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-medium text-dark-700">
                        {user.subscription?.planId || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={statusColors[user.subscription?.status] || 'gray'}>
                        {user.subscription?.status || 'NONE'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-dark-600">
                        {user.subscription?.smsUsedThisPeriod ?? 0} / {user.subscription?.smsLimit ?? 0}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-dark-600">{user._count?.devices ?? 0}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-dark-400">{formatDate(user.createdAt)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() =>
                            setEditModal({
                              id: user.id,
                              name: user.name,
                              email: user.email,
                              planId: user.subscription?.planId || '',
                              status: user.subscription?.status || '',
                              smsLimit: user.subscription?.smsLimit || 0,
                              deviceLimit: user.subscription?.deviceLimit || 1,
                            })
                          }
                          className="p-1.5 rounded hover:bg-surface-warm text-dark-400 hover:text-dark-700 transition-colors"
                          title="Edit subscription"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => impersonateMutation.mutate(user.id)}
                          disabled={impersonateMutation.isPending}
                          className="p-1.5 rounded hover:bg-blue-50 text-dark-400 hover:text-blue-600 transition-colors"
                          title="Login as user"
                        >
                          <LogIn size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(user.id)}
                          className="p-1.5 rounded hover:bg-red-50 text-dark-400 hover:text-error transition-colors"
                          title="Delete user"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {meta.totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-surface-cool">
              <p className="text-xs text-dark-400">
                Page {meta.page} of {meta.totalPages}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="p-1.5 rounded border border-surface-cool hover:bg-surface-warm disabled:opacity-40 transition-colors"
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                  disabled={page >= meta.totalPages}
                  className="p-1.5 rounded border border-surface-cool hover:bg-surface-warm disabled:opacity-40 transition-colors"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Edit Subscription Modal */}
      {editModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-dark-900">Edit Subscription</h2>
              <button onClick={() => setEditModal(null)} className="p-1 rounded hover:bg-surface-warm text-dark-500">
                <X size={18} />
              </button>
            </div>
            <p className="text-sm text-dark-500 mb-4">
              {editModal.name} ({editModal.email})
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-dark-600 mb-1">Plan ID</label>
                <input
                  value={editModal.planId}
                  onChange={(e) => setEditModal({ ...editModal, planId: e.target.value })}
                  className="w-full px-3 py-2 rounded-md border border-surface-cool text-sm outline-none focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-dark-600 mb-1">Status</label>
                <select
                  value={editModal.status}
                  onChange={(e) => setEditModal({ ...editModal, status: e.target.value })}
                  className="w-full px-3 py-2 rounded-md border border-surface-cool text-sm outline-none focus:border-brand-500 bg-white"
                >
                  <option value="TRIAL">TRIAL</option>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="PAST_DUE">PAST_DUE</option>
                  <option value="CANCELED">CANCELED</option>
                  <option value="PAUSED">PAUSED</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-dark-600 mb-1">SMS Limit</label>
                  <input
                    type="number"
                    value={editModal.smsLimit}
                    onChange={(e) => setEditModal({ ...editModal, smsLimit: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-md border border-surface-cool text-sm outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-dark-600 mb-1">Device Limit</label>
                  <input
                    type="number"
                    value={editModal.deviceLimit}
                    onChange={(e) => setEditModal({ ...editModal, deviceLimit: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-md border border-surface-cool text-sm outline-none focus:border-brand-500"
                  />
                </div>
              </div>
              <button
                onClick={() =>
                  subMutation.mutate({
                    id: editModal.id,
                    dto: {
                      planId: editModal.planId,
                      status: editModal.status,
                      smsLimit: editModal.smsLimit,
                      deviceLimit: editModal.deviceLimit,
                    },
                  })
                }
                disabled={subMutation.isPending}
                className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-md transition-colors disabled:opacity-60"
              >
                {subMutation.isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full">
            <h2 className="text-lg font-bold text-dark-900 mb-2">Delete User</h2>
            <p className="text-sm text-dark-500 mb-5">
              This will permanently delete this user and all their data. This cannot be undone.
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
