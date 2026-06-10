'use client';

import React from 'react';
import { CircleDot, Clock, CheckCircle2 } from 'lucide-react';

const statuses = [
  { value: 'Open', label: 'Open', icon: CircleDot, active: 'bg-emerald-600/20 border-emerald-500/50 text-emerald-400' },
  { value: 'In Progress', label: 'In Progress', icon: Clock, active: 'bg-amber-600/20 border-amber-500/50 text-amber-400' },
  { value: 'Closed', label: 'Closed', icon: CheckCircle2, active: 'bg-slate-600/20 border-slate-500/50 text-slate-300' },
] as const;

interface StatusSelectorProps {
  value: string;
  onChange: (status: string) => void;
  disabled?: boolean;
}

export default function StatusSelector({ value, onChange, disabled }: StatusSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {statuses.map(({ value: status, label, icon: Icon, active }) => {
        const isActive = value === status;
        return (
          <button
            key={status}
            type="button"
            disabled={disabled}
            onClick={() => onChange(status)}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all disabled:opacity-50 ${
              isActive
                ? active
                : 'bg-slate-950/60 border-slate-800 text-slate-500 hover:border-slate-700 hover:text-slate-300'
            }`}
          >
            <Icon size={14} />
            {label}
          </button>
        );
      })}
    </div>
  );
}
