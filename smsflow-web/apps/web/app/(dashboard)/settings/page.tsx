'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User, Lock, Bell, Trash2, Save, Eye, EyeOff, UserMinus, UserPlus, Mail } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiClient } from '@/lib/api-client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate } from '@/lib/utils';

/* ── Schemas ── */
const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email'),
  company: z.string().optional(),
  timezone: z.string().optional(),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

/* ── Helpers ── */
const TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Asia/Kolkata',
  'Australia/Sydney',
];

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 mb-5">
        <span className="text-dark-400">{icon}</span>
        <h2 className="text-sm font-bold text-dark-900">{title}</h2>
      </div>
      {children}
    </Card>
  );
}

export default function SettingsPage() {
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const queryClient = useQueryClient();

  /* ── Profile query ── */
  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () => apiClient.get('/users/me').then((r) => r.data),
  });

  /* ── Team query ── */
  const { data: teamMembers = [] } = useQuery<any[]>({
    queryKey: ['team'],
    queryFn: () => apiClient.get('/users/team').then((r) => r.data),
  });

  /* ── Profile form ── */
  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    values: {
      name: profile?.name ?? '',
      email: profile?.email ?? '',
      company: profile?.company ?? '',
      timezone: profile?.timezone ?? 'UTC',
    },
  });

  /* ── Password form ── */
  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  /* ── Mutations ── */
  const updateProfileMutation = useMutation({
    mutationFn: (data: ProfileForm) => apiClient.patch('/users/me', data).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['profile'] }),
  });

  const changePasswordMutation = useMutation({
    mutationFn: (data: PasswordForm) =>
      apiClient.patch('/users/me/password', data).then((r) => r.data),
    onSuccess: () => passwordForm.reset(),
  });

  const inviteMutation = useMutation({
    mutationFn: (email: string) =>
      apiClient.post('/users/team/invite', { email }).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team'] });
      setInviteEmail('');
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/users/team/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['team'] }),
  });

  const deleteAccountMutation = useMutation({
    mutationFn: () => apiClient.delete('/users/me'),
    onSuccess: () => {
      localStorage.clear();
      window.location.href = '/';
    },
  });

  const inputClass = (hasError?: boolean) =>
    `w-full px-3 py-2 text-sm border rounded-md outline-none transition-all ${
      hasError
        ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/10'
        : 'border-surface-cool focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10'
    }`;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-dark-900">Settings</h1>
        <p className="text-sm text-dark-500 mt-0.5">Manage your profile and account preferences.</p>
      </div>

      {/* Profile */}
      <Section title="Profile" icon={<User className="w-4 h-4" />}>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-10" />)}
          </div>
        ) : (
          <form
            onSubmit={profileForm.handleSubmit((d) => updateProfileMutation.mutate(d))}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-dark-600 mb-1">Full name</label>
                <input
                  {...profileForm.register('name')}
                  className={inputClass(!!profileForm.formState.errors.name)}
                  placeholder="John Doe"
                />
                {profileForm.formState.errors.name && (
                  <p className="mt-1 text-xs text-red-600">{profileForm.formState.errors.name.message}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-dark-600 mb-1">Email</label>
                <input
                  {...profileForm.register('email')}
                  type="email"
                  className={inputClass(!!profileForm.formState.errors.email)}
                  placeholder="you@example.com"
                />
                {profileForm.formState.errors.email && (
                  <p className="mt-1 text-xs text-red-600">{profileForm.formState.errors.email.message}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-dark-600 mb-1">Company</label>
                <input
                  {...profileForm.register('company')}
                  className={inputClass()}
                  placeholder="Acme Inc."
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-dark-600 mb-1">Timezone</label>
                <select
                  {...profileForm.register('timezone')}
                  className={inputClass() + ' bg-white'}
                >
                  {TIMEZONES.map((tz) => (
                    <option key={tz} value={tz}>{tz}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={updateProfileMutation.isPending}
                className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-md transition-colors disabled:opacity-60"
              >
                <Save className="w-4 h-4" />
                {updateProfileMutation.isPending ? 'Saving...' : 'Save profile'}
              </button>
            </div>
          </form>
        )}
      </Section>

      {/* Change password */}
      <Section title="Password" icon={<Lock className="w-4 h-4" />}>
        <form
          onSubmit={passwordForm.handleSubmit((d) => changePasswordMutation.mutate(d))}
          className="space-y-4"
        >
          <div>
            <label className="block text-xs font-semibold text-dark-600 mb-1">Current password</label>
            <div className="relative">
              <input
                {...passwordForm.register('currentPassword')}
                type={showCurrentPw ? 'text' : 'password'}
                className={inputClass(!!passwordForm.formState.errors.currentPassword) + ' pr-10'}
              />
              <button
                type="button"
                onClick={() => setShowCurrentPw((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-700"
              >
                {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {passwordForm.formState.errors.currentPassword && (
              <p className="mt-1 text-xs text-red-600">{passwordForm.formState.errors.currentPassword.message}</p>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-dark-600 mb-1">New password</label>
              <div className="relative">
                <input
                  {...passwordForm.register('newPassword')}
                  type={showNewPw ? 'text' : 'password'}
                  className={inputClass(!!passwordForm.formState.errors.newPassword) + ' pr-10'}
                  placeholder="At least 8 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPw((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-700"
                >
                  {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {passwordForm.formState.errors.newPassword && (
                <p className="mt-1 text-xs text-red-600">{passwordForm.formState.errors.newPassword.message}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold text-dark-600 mb-1">Confirm password</label>
              <input
                {...passwordForm.register('confirmPassword')}
                type="password"
                className={inputClass(!!passwordForm.formState.errors.confirmPassword)}
                placeholder="••••••••"
              />
              {passwordForm.formState.errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-600">{passwordForm.formState.errors.confirmPassword.message}</p>
              )}
            </div>
          </div>
          {changePasswordMutation.isSuccess && (
            <p className="text-xs text-brand-600 font-medium">Password updated successfully.</p>
          )}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={changePasswordMutation.isPending}
              className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-md transition-colors disabled:opacity-60"
            >
              <Lock className="w-4 h-4" />
              {changePasswordMutation.isPending ? 'Updating...' : 'Update password'}
            </button>
          </div>
        </form>
      </Section>

      {/* Team */}
      <Section title="Team Members" icon={<Bell className="w-4 h-4" />}>
        <div className="space-y-3 mb-4">
          {teamMembers.length === 0 ? (
            <p className="text-sm text-dark-400">No team members yet.</p>
          ) : (
            teamMembers.map((member: any) => (
              <div
                key={member.id}
                className="flex items-center justify-between py-2.5 px-3 bg-surface-soft rounded-lg border border-surface-cool"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {member.name?.[0]?.toUpperCase() ?? member.email[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-dark-900">{member.name ?? member.email}</p>
                    <p className="text-xs text-dark-400">{member.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={member.role === 'OWNER' ? 'info' : 'gray'} className="capitalize">
                    {member.role?.toLowerCase() ?? 'member'}
                  </Badge>
                  {member.role !== 'OWNER' && (
                    <button
                      onClick={() => removeMemberMutation.mutate(member.id)}
                      className="p-1.5 rounded hover:bg-red-50 text-dark-400 hover:text-red-600 transition-colors"
                    >
                      <UserMinus className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Invite */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="colleague@company.com"
              className="w-full pl-9 pr-3 py-2 text-sm border border-surface-cool rounded-md outline-none focus:border-brand-500"
            />
          </div>
          <button
            onClick={() => inviteMutation.mutate(inviteEmail)}
            disabled={!inviteEmail || inviteMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-md transition-colors disabled:opacity-60"
          >
            <UserPlus className="w-4 h-4" />
            {inviteMutation.isPending ? 'Inviting...' : 'Invite'}
          </button>
        </div>
        {inviteMutation.isSuccess && (
          <p className="mt-2 text-xs text-brand-600 font-medium">Invitation sent!</p>
        )}
      </Section>

      {/* Danger zone */}
      <Card className="p-5 border-red-200">
        <div className="flex items-center gap-2 mb-4">
          <Trash2 className="w-4 h-4 text-red-500" />
          <h2 className="text-sm font-bold text-dark-900">Danger Zone</h2>
        </div>
        <p className="text-sm text-dark-600 mb-4">
          Permanently delete your account and all associated data. This action cannot be undone.
        </p>
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={deleteConfirm}
            onChange={(e) => setDeleteConfirm(e.target.value)}
            placeholder='Type "delete my account" to confirm'
            className="flex-1 px-3 py-2 text-sm border border-red-200 rounded-md outline-none focus:border-red-500"
          />
          <button
            onClick={() => deleteAccountMutation.mutate()}
            disabled={deleteConfirm !== 'delete my account' || deleteAccountMutation.isPending}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-md transition-colors disabled:opacity-40"
          >
            {deleteAccountMutation.isPending ? 'Deleting...' : 'Delete account'}
          </button>
        </div>
      </Card>
    </div>
  );
}
