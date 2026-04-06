'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, ChevronDown, LogOut, ArrowLeft } from 'lucide-react';

export function Topbar() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isImpersonating, setIsImpersonating] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('user');
        if (stored) setUser(JSON.parse(stored));
        setIsImpersonating(localStorage.getItem('impersonating') === 'true');
      } catch {}
    }
  }, []);

  const handleStopImpersonating = () => {
    const adminToken = localStorage.getItem('adminAccessToken');
    const adminRefresh = localStorage.getItem('adminRefreshToken');
    const adminUser = localStorage.getItem('adminUser');
    if (adminToken) {
      localStorage.setItem('accessToken', adminToken);
      localStorage.setItem('refreshToken', adminRefresh || '');
      localStorage.setItem('user', adminUser || '');
      localStorage.removeItem('adminAccessToken');
      localStorage.removeItem('adminRefreshToken');
      localStorage.removeItem('adminUser');
      localStorage.removeItem('impersonating');
      window.location.href = '/admin/users';
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('impersonating');
    localStorage.removeItem('adminAccessToken');
    localStorage.removeItem('adminRefreshToken');
    localStorage.removeItem('adminUser');
    router.push('/login');
  };

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((w: string) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '??';

  return (
    <>
      {isImpersonating && (
        <div className="h-10 flex items-center justify-between px-4 bg-amber-500 text-white text-sm font-medium flex-shrink-0">
          <span>You are viewing as <strong>{user?.name || user?.email}</strong></span>
          <button
            onClick={handleStopImpersonating}
            className="flex items-center gap-1.5 px-3 py-1 bg-white/20 hover:bg-white/30 rounded text-xs font-bold transition-colors"
          >
            <ArrowLeft size={14} />
            Back to Admin
          </button>
        </div>
      )}
      <header className="h-16 flex items-center justify-between px-6 bg-surface-pure border-b border-surface-cool flex-shrink-0">
        <div className="ml-auto flex items-center gap-4">
          <button className="relative p-2 text-dark-500 hover:text-dark-700 transition-colors rounded-md hover:bg-surface-warm">
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full border border-surface-pure" />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-xs font-bold">
              {initials}
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-dark-900 leading-none">{user?.name || 'User'}</p>
              <p className="text-xs text-dark-400 mt-0.5">{user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN' ? 'Admin' : 'Member'}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 text-dark-400 hover:text-error transition-colors rounded hover:bg-red-50"
              title="Sign out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
