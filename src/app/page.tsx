'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Search,
  Filter,
  Inbox,
  CircleDot,
  Clock,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { useTickets } from '@/context/TicketContext';
import StatusBadge from '@/components/StatusBadge';
import CustomerAvatar from '@/components/CustomerAvatar';
import FeatureOverview from '@/components/FeatureOverview';
import { format, formatDistanceToNow } from 'date-fns';

interface TicketRow {
  ticket_id: string;
  customer_name: string;
  customer_email?: string;
  subject: string;
  status: string;
  created_at: string;
}

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { stats, loading: contextLoading, refetchTickets, isDemo } = useTickets();

  const [search, setSearch] = useState('');
  const [tickets, setTickets] = useState<TicketRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const statusFilter = searchParams.get('status') || '';

  const setStatusFilter = (status: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (status) params.set('status', status);
    else params.delete('status');
    router.push(`/?${params.toString()}`);
  };

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(handler);
  }, [search]);

  // Fetch tickets when filters change
  useEffect(() => {
    const fetchFiltered = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (statusFilter) queryParams.append('status', statusFilter);
        if (debouncedSearch) queryParams.append('search', debouncedSearch);

        const response = await fetch(`/api/tickets?${queryParams.toString()}`);
        if (response.ok) setTickets(await response.json());
      } catch (error) {
        console.error('Failed to fetch tickets:', error);
      } finally {
        setLoading(false);
      }
    };

    void fetchFiltered();
  }, [statusFilter, debouncedSearch]);

  const handleRefresh = async () => {
    await refetchTickets();
    // Refetch tickets
    try {
      const queryParams = new URLSearchParams();
      if (statusFilter) queryParams.append('status', statusFilter);
      if (debouncedSearch) queryParams.append('search', debouncedSearch);

      const response = await fetch(`/api/tickets?${queryParams.toString()}`);
      if (response.ok) setTickets(await response.json());
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
    }
  };

  const formatListDate = (dateString: string) => {
    try {
      const d = new Date(dateString);
      return {
        short: format(d, 'MMM d, yyyy'),
        relative: formatDistanceToNow(d, { addSuffix: true }),
      };
    } catch {
      return { short: dateString, relative: '' };
    }
  };

  const statCards = [
    { label: 'Total', value: stats.total, icon: Inbox, accent: 'indigo', filter: '' },
    { label: 'Open', value: stats.open, icon: CircleDot, accent: 'emerald', filter: 'Open' },
    { label: 'In Progress', value: stats.inProgress, icon: Clock, accent: 'amber', filter: 'In Progress' },
    { label: 'Closed', value: stats.closed, icon: CheckCircle2, accent: 'slate', filter: 'Closed' },
  ];

  const accentMap: Record<string, { bar: string; icon: string; ring: string }> = {
    indigo: { bar: 'bg-cyan-500', icon: 'bg-cyan-500/10 text-cyan-400', ring: 'ring-cyan-500/30' },
    emerald: { bar: 'bg-emerald-500', icon: 'bg-emerald-500/10 text-emerald-400', ring: 'ring-emerald-500/30' },
    amber: { bar: 'bg-orange-500', icon: 'bg-orange-500/10 text-orange-400', ring: 'ring-orange-500/30' },
    slate: { bar: 'bg-slate-500', icon: 'bg-slate-500/10 text-slate-400', ring: 'ring-slate-500/30' },
  };

  return (
    <div className="p-6 lg:p-8 space-y-7 max-w-[1440px] mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
        <div>
          <p className="text-cyan-400 text-xs font-bold uppercase tracking-[0.2em] mb-2">🎫 Ticketing System</p>
          <h1 className="text-3xl font-bold tracking-tight text-white">All Support Tickets</h1>
          <p className="text-slate-400 text-sm mt-1.5 max-w-xl">
            Streamline customer support with powerful search, filtering, and real-time collaboration tools.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {isDemo && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/25">
              <AlertCircle size={14} />
              Demo Mode
            </span>
          )}
          <button
            onClick={handleRefresh}
            className="p-2.5 rounded-xl border border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Refresh"
          >
            <RefreshCw size={16} className={contextLoading || loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <FeatureOverview />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map(({ label, value, icon: Icon, accent, filter }) => {
          const colors = accentMap[accent];
          const isActive = statusFilter === filter;
          return (
            <button
              key={label}
              onClick={() => setStatusFilter(filter)}
              className={`stat-card glass-card rounded-2xl p-4 text-left w-full ${
                isActive ? `ring-2 ${colors.ring}` : 'hover:border-slate-700'
              }`}
            >
              <div className={`absolute right-3 top-3 p-1.5 rounded-lg ${colors.icon}`}>
                <Icon size={18} />
              </div>
              <p className="text-slate-500 font-medium text-[11px] uppercase tracking-wider">{label}</p>
              <p className="text-2xl font-bold text-white mt-1 tabular-nums">
                {contextLoading ? '—' : value}
              </p>
              <div className={`w-1 h-8 ${colors.bar} absolute left-0 top-1/2 -translate-y-1/2 rounded-r`} />
            </button>
          );
        })}
      </div>

      {/* Search + Filter */}
      <div className="glass-card p-4 rounded-2xl space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Quick search — names, IDs, emails, descriptions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm placeholder-slate-500 focus:ring-2 focus:ring-cyan-500/40 transition-colors"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider hidden sm:flex items-center gap-1 shrink-0">
              <Filter size={11} /> Status
            </span>
            {['', 'Open', 'In Progress', 'Closed'].map((status) => {
              const labels: Record<string, string> = {
                '': 'All',
                Open: 'Open',
                'In Progress': 'In Progress',
                Closed: 'Closed',
              };
              const active: Record<string, string> = {
                '': 'bg-cyan-600 border-cyan-500 text-white',
                Open: 'bg-emerald-600 border-emerald-500 text-white',
                'In Progress': 'bg-orange-600 border-orange-500 text-white',
                Closed: 'bg-slate-600 border-slate-500 text-white',
              };
              return (
                <button
                  key={status || 'all'}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border whitespace-nowrap transition-all ${
                    statusFilter === status
                      ? active[status]
                      : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {labels[status]}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Ticket List — ID, Name, Title, Status, Date */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800/80 flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Inbox size={16} className="text-cyan-400" />
            Ticket List
          </h2>
          <span className="text-xs text-slate-500">
            {!loading && `${tickets.length} result${tickets.length !== 1 ? 's' : ''}`}
          </span>
        </div>

        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-4 py-3 border-b border-slate-800/30 last:border-0">
                <div className="h-4 w-20 skeleton-shimmer rounded" />
                <div className="h-4 w-32 skeleton-shimmer rounded flex-1" />
                <div className="h-4 w-40 skeleton-shimmer rounded flex-1 hidden md:block" />
                <div className="h-6 w-16 skeleton-shimmer rounded-full" />
                <div className="h-4 w-24 skeleton-shimmer rounded hidden sm:block" />
              </div>
            ))}
          </div>
        ) : tickets.length === 0 ? (
          <div className="p-14 text-center">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-slate-800/60 flex items-center justify-center text-4xl mb-4">
              📭
            </div>
            <h3 className="text-base font-bold text-white">No tickets found</h3>
            <p className="text-slate-500 text-sm mt-1">
              {(search || statusFilter) 
                ? 'Try adjusting your search or status filter.' 
                : 'Start by creating your first support ticket.'}
            </p>
            {(search || statusFilter) && (
              <button
                onClick={() => { setSearch(''); setStatusFilter(''); }}
                className="mt-4 px-4 py-2 text-xs font-semibold text-cyan-400 bg-cyan-600/10 rounded-lg border border-cyan-500/20 hover:bg-cyan-600/20 transition-colors"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="crm-table w-full">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th className="hidden md:table-cell">Title</th>
                  <th>Status</th>
                  <th className="hidden sm:table-cell">Date</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((ticket) => {
                  const date = formatListDate(ticket.created_at);
                  return (
                    <tr
                      key={ticket.ticket_id}
                      onClick={() => router.push(`/tickets/${ticket.ticket_id}`)}
                      className="group"
                    >
                      <td>
                        <span className="font-mono text-sm font-bold text-cyan-400 group-hover:text-cyan-300">
                          {ticket.ticket_id}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-2.5 min-w-0">
                          <CustomerAvatar name={ticket.customer_name} size="sm" />
                          <div className="min-w-0">
                            <span className="font-semibold text-white text-sm block truncate">
                              {ticket.customer_name}
                            </span>
                            <span className="text-slate-500 text-xs truncate block md:hidden">
                              {ticket.subject}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="hidden md:table-cell max-w-xs">
                        <span className="text-slate-300 text-sm truncate block group-hover:text-white">
                          {ticket.subject}
                        </span>
                      </td>
                      <td>
                        <StatusBadge status={ticket.status} />
                      </td>
                      <td className="hidden sm:table-cell">
                        <span className="text-slate-300 text-xs font-medium block">{date.short}</span>
                        <span className="text-slate-500 text-[10px]">{date.relative}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <span className="w-8 h-8 border-2 border-cyan-600/30 border-t-cyan-600 rounded-full animate-spin" />
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
