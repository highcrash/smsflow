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
} from 'lucide-react';

const navSections = [
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
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 flex-shrink-0 flex flex-col h-screen bg-dark-900 overflow-y-auto">
      <div className="px-4 py-5">
        <Logo size="sm" href="/" dark />
      </div>
      <nav className="flex-1 px-3 pb-6 space-y-6">
        {navSections.map((section) => (
          <div key={section.label}>
            <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-dark-500">
              {section.label}
            </p>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const active =
                  pathname === item.href ||
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
