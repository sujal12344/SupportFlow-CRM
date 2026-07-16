'use client';

import { useState } from 'react';
import { X, Send, User, Mail, Tag, AlignLeft, Sparkles } from 'lucide-react';

interface CreateTicketDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onTicketCreated: (ticketId: string) => void;
}

export default function CreateTicketDrawer({ isOpen, onClose, onTicketCreated }: CreateTicketDrawerProps) {
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setCustomerName('');
    setCustomerEmail('');
    setSubject('');
    setDescription('');
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerEmail.trim() || !subject.trim() || !description.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: customerName.trim(),
          customer_email: customerEmail.trim(),
          subject: subject.trim(),
          description: description.trim(),
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to create ticket');

      resetForm();
      onTicketCreated(data.ticket_id);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create ticket.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 w-full max-w-lg bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col h-full animate-slide-in">
        <div className="px-6 py-5 border-b border-slate-800 bg-linear-to-r from-cyan-600/15 via-teal-600/5 to-transparent">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest mb-1">Feature 1</p>
              <h2 className="text-xl font-bold text-white">Create New Ticket</h2>
              <p className="text-slate-400 text-xs mt-1">Enter customer and issue details</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
              <X size={20} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-cyan-600/10 border border-cyan-500/20">
              <Sparkles size={16} className="text-cyan-400 shrink-0 mt-0.5" />
              <p className="text-xs text-cyan-200/90 leading-relaxed">
                <strong className="text-cyan-300">Ticket ID</strong> (e.g. TKT-1001) and{' '}
                <strong className="text-cyan-300">timestamp</strong> are generated automatically on submit.
              </p>
            </div>

            {error && (
              <div className="p-3 bg-rose-950/40 border border-rose-800/50 text-rose-300 rounded-xl text-sm">
                {error}
              </div>
            )}

            <fieldset className="space-y-4">
              <legend className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">
                Customer Information
              </legend>

              <div className="space-y-2">
                <label htmlFor="customer-name" className="crm-label">
                  <User size={14} className="text-cyan-400" />
                  Customer Name <span className="text-rose-400">*</span>
                </label>
                <input
                  id="customer-name"
                  type="text"
                  required
                  placeholder="e.g. Jane Doe"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="crm-input"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="customer-email" className="crm-label">
                  <Mail size={14} className="text-cyan-400" />
                  Customer Email <span className="text-rose-400">*</span>
                </label>
                <input
                  id="customer-email"
                  type="email"
                  required
                  placeholder="e.g. jane@company.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="crm-input"
                />
              </div>
            </fieldset>

            <fieldset className="space-y-4">
              <legend className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">
                Issue Details
              </legend>

              <div className="space-y-2">
                <label htmlFor="title" className="crm-label">
                  <Tag size={14} className="text-cyan-400" />
                  Issue Title <span className="text-rose-400">*</span>
                </label>
                <input
                  id="title"
                  type="text"
                  required
                  placeholder="Brief summary of the problem"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="crm-input"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="description" className="crm-label">
                  <AlignLeft size={14} className="text-cyan-400" />
                  Description <span className="text-rose-400">*</span>
                </label>
                <textarea
                  id="description"
                  required
                  rows={5}
                  placeholder="Describe the issue in detail — steps to reproduce, error messages, etc."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="crm-input resize-none leading-relaxed"
                />
              </div>
            </fieldset>
          </div>

          <div className="p-6 border-t border-slate-800 bg-slate-900/90 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-slate-700 hover:bg-slate-800 text-slate-300 rounded-xl text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 bg-linear-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-indigo-600/20"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Send size={15} />
                  Create Ticket
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
