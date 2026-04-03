'use client';

import { Bell, ChevronDown } from 'lucide-react';

interface TopbarProps {
  title?: string;
}

export function Topbar({ title }: TopbarProps) {
  return (
    <header className="h-16 flex items-center justify-between px-6 bg-surface-pure border-b border-surface-cool flex-shrink-0">
      {title && <h1 className="text-xl font-bold text-dark-900 tracking-tight">{title}</h1>}
      <div className="ml-auto flex items-center gap-4">
        <button className="relative p-2 text-dark-500 hover:text-dark-700 transition-colors rounded-md hover:bg-surface-warm">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full border border-surface-pure" />
        </button>
        <button className="flex items-center gap-2.5 hover:bg-surface-warm rounded-md px-2 py-1.5 transition-colors">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-xs font-bold">
            JD
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-dark-900 leading-none">John Doe</p>
            <p className="text-xs text-dark-400 mt-0.5">Pro Plan</p>
          </div>
          <ChevronDown size={14} className="text-dark-400" />
        </button>
      </div>
    </header>
  );
}
