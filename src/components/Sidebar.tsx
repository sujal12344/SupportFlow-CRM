'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  Inbox,
  CircleDot,
  Clock,
  CheckCircle2,
  Plus,
  Database,
  Layers,
  Headphones,
} from 'lucide-react';
import { useTickets } from '@/context/TicketContext';

interface SidebarProps {
  onOpenCreateDrawer: () => void;
}

const statusFilters = [
  { label: 'Open', value: 'Open', icon: CircleDot, color: 'text-emerald-400', countKey: 'open' as const },
  { label: 'In Progress', value: 'In Progress', icon: Clock, color: 'text-amber-400', countKey: 'inProgress' as const },
  { label: 'Closed', value: 'Closed', icon: CheckCircle2, color: 'text-slate-400', countKey: 'closed' as const },
];

export default function Sidebar({ onOpenCreateDrawer }: SidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeStatus = searchParams.get('status') || '';
  const { stats, isDemo } = useTickets();

  const isHomeActive = pathname === '/';

  return (
    <aside className="w-64 bg-slate-900/95 border-r border-slate-800/80 flex flex-col h-full text-slate-300 backdrop-blur-xl">
      <div className="h-16 px-5 border-b border-slate-800/80 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-linear-to-br from-cyan-500 via-teal-500 to-emerald-600 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-cyan-500/30 group-hover:shadow-cyan-500/50 transition-shadow">
            SK
          </div>
          <div>
            <span className="font-bold text-white tracking-wide text-sm block leading-tight">SupportFlow</span>
            <span className="text-cyan-400/70 font-semibold tracking-widest text-[9px] block">SUPPORT CRM</span>
          </div>
        </Link>
        <button
          onClick={onOpenCreateDrawer}
          className="p-2 bg-linear-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white rounded-lg shadow-lg shadow-cyan-600/25 hover:shadow-cyan-600/40 active:scale-95 transition-all"
          title="Create New Ticket"
        >
          <Plus size={16} />
        </button>
      </div>

      <nav className="flex-1 px-3 space-y-6 overflow-y-auto">
        <div>
          <span className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">
            Navigation
          </span>
          <Link
            href="/"
            className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              isHomeActive && !activeStatus
                ? 'bg-cyan-600/15 text-white font-semibold border border-cyan-500/25'
                : 'hover:bg-slate-800/60 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Inbox size={18} className={isHomeActive && !activeStatus ? 'text-cyan-400' : 'text-slate-400'} />
              <span>List All Tickets</span>
            </div>
            <span className="bg-slate-850 px-2 py-0.5 rounded-md text-slate-300 text-xs font-semibold border border-slate-700/40">
              {stats.total}
            </span>
          </Link>
        </div>

        <div>
          <span className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">
            Filter by Status
          </span>
          <div className="space-y-0.5">
            {statusFilters.map(({ label, value, icon: Icon, color, countKey }) => {
              const isActive = isHomeActive && activeStatus === value;
              return (
                <Link
                  key={value}
                  href={`/?status=${encodeURIComponent(value)}`}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all ${
                    isActive
                      ? 'bg-cyan-600/15 text-white font-medium border border-cyan-500/30'
                      : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon size={16} className={color} />
                    <span>{label}</span>
                  </div>
                  <span className="font-semibold text-slate-300 text-xs tabular-nums">{stats[countKey]}</span>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="px-3">
          <div className="p-4 rounded-xl bg-linear-to-br from-cyan-600/10 to-teal-600/5 border border-cyan-500/15">
            <div className="flex items-center gap-2 mb-2">
              <Headphones size={16} className="text-cyan-400" />
              <span className="text-xs font-bold text-cyan-300">Support Hub</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Manage customer tickets efficiently with real-time tracking and collaboration.
            </p>
          </div>
        </div>
      </nav>

      <div className="p-4 border-t border-slate-800/80">
        <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-slate-800/60 bg-slate-950/50">
          <div className="p-1.5 rounded-lg bg-slate-800">
            {isDemo ? (
              <Layers size={14} className="text-amber-400" />
            ) : (
              <Database size={14} className="text-emerald-400" />
            )}
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Database
            </span>
            <span className={`text-xs font-semibold block truncate ${isDemo ? 'text-amber-400' : 'text-emerald-400'}`}>
              {isDemo ? 'Demo Mode' : 'Supabase Live'}
            </span>
          </div>
          <span
            className={`ml-auto w-2 h-2 rounded-full shrink-0 ${isDemo ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`}
            title={isDemo ? 'In-memory demo' : 'Connected'}
          />
        </div>
      </div>
    </aside>
  );
}
