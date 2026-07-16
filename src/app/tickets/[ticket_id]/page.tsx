'use client';

import { useState, useEffect, use, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  User,
  Mail,
  Calendar,
  Clock,
  MessageSquare,
  Plus,
  AlertCircle,
  FileText,
  Copy,
  Check,
  Hash,
} from 'lucide-react';
import { useTickets } from '@/context/TicketContext';
import StatusBadge from '@/components/StatusBadge';
import StatusSelector from '@/components/StatusSelector';
import CustomerAvatar from '@/components/CustomerAvatar';
import { formatDistanceToNow, format } from 'date-fns';

type TicketDetailPageProps = {
  params: Promise<{ ticket_id: string }>;
};

interface Note {
  id?: string;
  note_text: string;
  created_at: string;
}

interface TicketDetail {
  ticket_id: string;
  customer_name: string;
  customer_email: string;
  subject: string;
  description: string;
  status: string;
  created_at: string;
  updated_at: string;
  notes?: Note[];
}

export default function TicketDetailPage({ params }: TicketDetailPageProps) {
  const { ticket_id } = use(params);
  const router = useRouter();
  const { refetchTickets } = useTickets();

  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newNote, setNewNote] = useState('');
  const [statusInput, setStatusInput] = useState('');
  const [submittingNote, setSubmittingNote] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [copied, setCopied] = useState(false);

  // Fetch ticket details on mount and when ticket_id changes
  useEffect(() => {
    const loadTicket = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/tickets/${ticket_id}`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to load ticket');
        setTicket(data);
        setStatusInput(data.status);
        setError(null);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'An error occurred.');
      } finally {
        setLoading(false);
      }
    };

    void loadTicket();
  }, [ticket_id]);

  const fetchTicketDetails = useCallback(async () => {
    try {
      const response = await fetch(`/api/tickets/${ticket_id}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to load ticket');
      setTicket(data);
      setStatusInput(data.status);
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred.');
    }
  }, [ticket_id]);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    setSubmittingNote(true);
    try {
      const response = await fetch(`/api/tickets/${ticket_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: newNote.trim() }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to add comment');
      setNewNote('');
      await fetchTicketDetails();
      await refetchTickets();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to add comment.');
    } finally {
      setSubmittingNote(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    setStatusInput(newStatus);
    if (!newStatus || newStatus === ticket?.status) return;
    setUpdatingStatus(true);
    try {
      const response = await fetch(`/api/tickets/${ticket_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update status');
      await fetchTicketDetails();
      await refetchTickets();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to update status.');
      setStatusInput(ticket?.status || '');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const copyTicketId = async () => {
    await navigator.clipboard.writeText(ticket_id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDatePrecise = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy · h:mm a');
    } catch {
      return dateString;
    }
  };

  const formatRelative = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return '';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 text-slate-400">
        <span className="w-8 h-8 border-2 border-cyan-600/30 border-t-cyan-600 rounded-full animate-spin" />
        <p className="text-sm">Loading ticket details...</p>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-4">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm">
          <ArrowLeft size={16} /> Back to list
        </Link>
        <div className="p-8 glass-card rounded-2xl text-center space-y-3">
          <AlertCircle className="mx-auto text-rose-400" size={32} />
          <h2 className="text-lg font-bold text-white">Ticket not found</h2>
          <p className="text-slate-400 text-sm">{error || 'This ticket does not exist.'}</p>
          <button onClick={() => router.push('/')} className="px-4 py-2 bg-slate-800 rounded-xl text-sm font-semibold">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6 animate-fade-in">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm group"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
        Back to Ticket List
      </Link>

      {/* Header */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
          <div className="space-y-3">
            <p className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">Feature 5 · Ticket Detail</p>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={copyTicketId}
                className="inline-flex items-center gap-2 font-mono font-bold text-cyan-400 hover:text-cyan-300 text-xl"
              >
                <Hash size={18} className="opacity-50" />
                {ticket.ticket_id}
                {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} className="opacity-40" />}
              </button>
              <StatusBadge status={ticket.status} size="md" />
            </div>
            <h1 className="text-xl font-bold text-white">{ticket.subject}</h1>
            <div className="flex flex-wrap gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Calendar size={12} /> Created {formatDatePrecise(ticket.created_at)}
              </span>
              <span className="flex items-center gap-1">
                <Clock size={12} /> Updated {formatRelative(ticket.updated_at)}
              </span>
            </div>
          </div>

          <div className="lg:text-right space-y-2 shrink-0">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Update Status</p>
            <StatusSelector
              value={statusInput}
              onChange={handleStatusChange}
              disabled={updatingStatus}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-6">
          {/* Customer */}
          <div className="glass-card rounded-2xl p-6">
            <h3 className="section-title mb-4">Customer</h3>
            <div className="flex items-start gap-4">
              <CustomerAvatar name={ticket.customer_name} size="lg" />
              <div className="grid sm:grid-cols-2 gap-4 flex-1">
                <div>
                  <span className="field-label">Name</span>
                  <p className="field-value flex items-center gap-1.5 mt-1">
                    <User size={14} className="text-slate-500" />
                    {ticket.customer_name}
                  </p>
                </div>
                <div>
                  <span className="field-label">Email</span>
                  <p className="field-value mt-1">
                    <a href={`mailto:${ticket.customer_email}`} className="text-cyan-300 hover:text-cyan-200 flex items-center gap-1.5">
                      <Mail size={14} className="text-slate-500 shrink-0" />
                      <span className="truncate">{ticket.customer_email}</span>
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="glass-card rounded-2xl p-6 space-y-4">
            <h3 className="section-title flex items-center gap-2">
              <FileText size={14} className="text-cyan-400" />
              Description
            </h3>
            <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap bg-slate-950/50 rounded-xl p-4 border border-slate-800/60">
              {ticket.description}
            </div>
          </div>

          {/* Comments timeline */}
          <div className="space-y-4">
            <h3 className="section-title flex items-center gap-2 px-1">
              <MessageSquare size={14} className="text-cyan-400" />
              Comments & Notes ({ticket.notes?.length || 0})
            </h3>

            {!ticket.notes?.length ? (
              <div className="glass-card border-dashed rounded-2xl p-10 text-center text-slate-500 text-sm">
                No comments yet. Add a note to track resolution progress.
              </div>
            ) : (
              <div className="space-y-3">
                {ticket.notes.map((note, index) => (
                  <div key={note.id || index} className="glass-card rounded-xl p-4 animate-fade-in">
                    <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-800/50">
                      <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Comment</span>
                      <span className="text-[10px] text-slate-500" title={formatDatePrecise(note.created_at)}>
                        {formatRelative(note.created_at)}
                      </span>
                    </div>
                    <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{note.note_text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar actions */}
        <div className="space-y-6">
          <div className="glass-card rounded-2xl p-6 space-y-4">
            <h3 className="section-title text-white">Add Comment</h3>
            <form onSubmit={handleAddNote} className="space-y-3">
              <textarea
                required
                rows={5}
                placeholder="Write an update, action taken, or resolution note..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="crm-input resize-none"
              />
              <button
                type="submit"
                disabled={submittingNote || !newNote.trim()}
                className="w-full py-2.5 bg-linear-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-cyan-600/15"
              >
                {submittingNote ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Plus size={16} />
                    Add Comment
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="glass-card rounded-2xl p-6 space-y-3">
            <h3 className="section-title">Ticket Info</h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-semibold">Status</span>
                <StatusBadge status={ticket.status} />
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-500 font-semibold shrink-0">Ticket ID</span>
                <span className="text-cyan-400 font-mono font-bold">{ticket.ticket_id}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-500 font-semibold shrink-0">Created</span>
                <span className="text-slate-300 text-right">{formatDatePrecise(ticket.created_at)}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-500 font-semibold shrink-0">Last Updated</span>
                <span className="text-slate-300 text-right">{formatDatePrecise(ticket.updated_at)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
