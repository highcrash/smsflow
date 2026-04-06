'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '../shared/logo';
import {
  LayoutDashboard,
  Send,
  Users,
  FileText,
  Smartphone,
  Key,
  Webhook,
  BarChart3,
  CreditCard,
  Settings,
  MessageSquare,
  Shield,
  Package,
  UserCog,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: any;
  badge?: string;
}

interface NavSection {
  label: string;
  items: NavItem[];
  adminOnly?: boolean;
}

const navSections: NavSection[] = [
  {
    label: 'Main',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { label: 'Send SMS', href: '/send', icon: Send, badge: 'New' },
      { label: 'Messages', href: '/messages', icon: MessageSquare },
      { label: 'Contacts', href: '/contacts', icon: Users },
      { label: 'Templates', href: '/templates', icon: FileText },
    ],
  },
  {
    label: 'Devices',
    items: [{ label: 'My Devices', href: '/devices', icon: Smartphone }],
  },
  {
    label: 'Integrations',
    items: [
      { label: 'API Keys', href: '/api-keys', icon: Key },
      { label: 'Webhooks', href: '/webhooks', icon: Webhook },
      { label: 'Analytics', href: '/analytics', icon: BarChart3 },
    ],
  },
  {
    label: 'Account',
    items: [
      { label: 'Billing', href: '/billing', icon: CreditCard },
      { label: 'Settings', href: '/settings', icon: Settings },
    ],
  },
  {
    label: 'Admin',
    adminOnly: true,
    items: [
      { label: 'Overview', href: '/admin', icon: Shield },
      { label: 'Manage Users', href: '/admin/users', icon: UserCog },
      { label: 'Plans', href: '/admin/plans', icon: Package },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  // Check user role from localStorage
  let userRole = 'USER';
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('user');
      if (stored) {
        const parsed = JSON.parse(stored);
        userRole = parsed.role || 'USER';
      }
    } catch {}
  }

  const isAdmin = userRole === 'ADMIN' || userRole === 'SUPER_ADMIN';

  return (
    <aside className="w-60 flex-shrink-0 flex flex-col h-screen bg-dark-900 overflow-y-auto">
      <div className="px-4 py-5">
        <Logo size="sm" href="/" dark />
      </div>
      <nav className="flex-1 px-3 pb-6 space-y-6">
        {navSections
          .filter((section) => !section.adminOnly || isAdmin)
          .map((section) => (
            <div key={section.label}>
              <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-dark-500">
                {section.label}
              </p>
              <ul className="space-y-0.5">
                {section.items.map((item) => {
                  const active =
                    item.href === '/admin'
                      ? pathname === '/admin'
                      : pathname === item.href ||
                        (item.href !== '/dashboard' && pathname.startsWith(item.href));
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-sm text-sm font-medium transition-colors ${
                          active
                            ? 'bg-brand-500/10 text-brand-400'
                            : 'text-dark-400 hover:bg-dark-800 hover:text-surface-cool'
                        }`}
                      >
                        <item.icon size={18} className="flex-shrink-0" />
                        <span className="flex-1">{item.label}</span>
                        {item.badge && (
                          <span className="text-[10px] font-bold text-white bg-brand-600 px-2 py-0.5 rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
      </nav>
    </aside>
  );
}
