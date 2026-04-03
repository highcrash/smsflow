'use client';

import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, Plus, Upload, Search, Trash2, X } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

export default function ContactsPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [newContact, setNewContact] = useState({ phoneNumber: '', firstName: '', lastName: '', email: '', company: '' });
  const fileRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['contacts', page, search],
    queryFn: () =>
      apiClient.get('/contacts', { params: { page, limit: 20, search } }).then((r) => r.data),
  });

  const contacts = data?.data ?? [];
  const meta = data?.meta ?? { total: 0, totalPages: 1 };

  const createMutation = useMutation({
    mutationFn: (contact: any) => apiClient.post('/contacts', contact).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      setShowCreate(false);
      setNewContact({ phoneNumber: '', firstName: '', lastName: '', email: '', company: '' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/contacts/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['contacts'] }),
  });

  const importMutation = useMutation({
    mutationFn: (file: File) => {
      const form = new FormData();
      form.append('file', file);
      return apiClient.post('/contacts/import', form, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data);
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      alert(`Imported ${result.imported} contacts. Skipped: ${result.skipped}`);
    },
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-dark-900">Contacts</h1>
          <p className="text-sm text-dark-500 mt-0.5">{meta.total} contacts</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            ref={fileRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) importMutation.mutate(file);
              e.target.value = '';
            }}
          />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={importMutation.isPending}
            className="flex items-center gap-2 px-3 py-2 border border-surface-cool rounded-md text-sm font-medium text-dark-700 hover:bg-surface-warm transition-colors"
          >
            <Upload className="w-4 h-4" />
            {importMutation.isPending ? 'Importing...' : 'Import Excel'}
          </button>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-md transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add contact
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
        <input
          type="text"
          placeholder="Search contacts..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-full pl-9 pr-3 py-2 text-sm border border-surface-cool rounded-md outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10"
        />
      </div>

      <Card className="p-0 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="text-left text-xs font-semibold text-dark-500 uppercase tracking-wide border-b border-surface-cool bg-surface-soft">
              <th className="px-5 py-3">Name</th>
              <th className="px-5 py-3">Phone</th>
              <th className="px-5 py-3">Email</th>
              <th className="px-5 py-3">Company</th>
              <th className="px-5 py-3">Tags</th>
              <th className="px-5 py-3 w-12"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-cool">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}><td colSpan={6} className="px-5 py-3"><Skeleton className="h-5 w-full" /></td></tr>
              ))
            ) : contacts.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center">
                  <Users className="w-10 h-10 text-dark-300 mx-auto mb-2" />
                  <p className="text-sm text-dark-400">No contacts yet. Add your first contact or import from Excel.</p>
                </td>
              </tr>
            ) : (
              contacts.map((c: any) => (
                <tr key={c.id} className="hover:bg-surface-soft transition-colors">
                  <td className="px-5 py-3.5 text-sm font-medium text-dark-900">
                    {[c.firstName, c.lastName].filter(Boolean).join(' ') || '-'}
                  </td>
                  <td className="px-5 py-3.5 text-sm font-mono text-dark-700">{c.phoneNumber}</td>
                  <td className="px-5 py-3.5 text-sm text-dark-500">{c.email || '-'}</td>
                  <td className="px-5 py-3.5 text-sm text-dark-500">{c.company || '-'}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex flex-wrap gap-1">
                      {c.tags?.map((tag: string) => (
                        <Badge key={tag} variant="gray" className="text-[10px]">{tag}</Badge>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <button
                      onClick={() => deleteMutation.mutate(c.id)}
                      className="p-1 rounded hover:bg-red-50 text-dark-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>

      {/* Create Contact Dialog */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-dark-900">Add Contact</h2>
              <button onClick={() => setShowCreate(false)} className="p-1 rounded hover:bg-surface-warm">
                <X className="w-5 h-5 text-dark-500" />
              </button>
            </div>
            <div className="space-y-3">
              {(['phoneNumber', 'firstName', 'lastName', 'email', 'company'] as const).map((field) => (
                <div key={field}>
                  <label className="block text-xs font-semibold text-dark-600 mb-1 capitalize">
                    {field.replace(/([A-Z])/g, ' $1')}
                    {field === 'phoneNumber' && <span className="text-red-500"> *</span>}
                  </label>
                  <input
                    type={field === 'email' ? 'email' : field === 'phoneNumber' ? 'tel' : 'text'}
                    value={newContact[field]}
                    onChange={(e) => setNewContact((p) => ({ ...p, [field]: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-surface-cool rounded-md outline-none focus:border-brand-500"
                    placeholder={field === 'phoneNumber' ? '+1 555 123 4567' : ''}
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowCreate(false)} className="flex-1 py-2 border border-surface-cool rounded-md text-sm font-medium text-dark-700 hover:bg-surface-warm">
                Cancel
              </button>
              <button
                onClick={() => createMutation.mutate(newContact)}
                disabled={!newContact.phoneNumber || createMutation.isPending}
                className="flex-1 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-md disabled:opacity-60"
              >
                {createMutation.isPending ? 'Adding...' : 'Add Contact'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
