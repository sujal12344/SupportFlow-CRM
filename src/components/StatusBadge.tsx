import React from 'react';

interface StatusBadgeProps {
  status: 'Open' | 'In Progress' | 'Closed' | string;
  size?: 'sm' | 'md';
}

export default function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const normStatus = status.trim();

  let styles = 'bg-slate-500/10 text-slate-400 border-slate-500/20';
  let dotColor = 'bg-slate-400';

  if (normStatus === 'Open') {
    styles = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25';
    dotColor = 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]';
  } else if (normStatus === 'In Progress') {
    styles = 'bg-amber-500/10 text-amber-400 border-amber-500/25';
    dotColor = 'bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.5)]';
  } else if (normStatus === 'Closed') {
    styles = 'bg-slate-500/15 text-slate-400 border-slate-600/40';
    dotColor = 'bg-slate-500';
  }

  const sizeClass = size === 'md' ? 'px-3 py-1.5 text-sm' : 'px-2.5 py-1 text-xs';

  return (
    <span className={`inline-flex items-center gap-1.5 ${sizeClass} font-semibold rounded-full border ${styles}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      {normStatus}
    </span>
  );
}
