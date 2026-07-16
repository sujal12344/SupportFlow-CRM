import React from 'react';
import { PlusCircle, List, Search, Filter, Eye } from 'lucide-react';

const features = [
  { icon: PlusCircle, label: 'Create Tickets', desc: 'Name, email, title & description' },
  { icon: List, label: 'List All Tickets', desc: 'ID, Name, Title, Status, Date' },
  { icon: Search, label: 'Quick Search', desc: 'Names, IDs, emails & descriptions' },
  { icon: Filter, label: 'Filter by Status', desc: 'Open · In Progress · Closed' },
  { icon: Eye, label: 'View & Update', desc: 'Detail view, status & comments' },
];

export default function FeatureOverview() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {features.map(({ icon: Icon, label, desc }) => (
        <div
          key={label}
          className="px-3 py-3 rounded-xl bg-slate-900/50 border border-slate-800/60 hover:border-cyan-500/20 transition-colors"
        >
          <Icon size={16} className="text-cyan-400 mb-2" />
          <p className="text-xs font-bold text-white leading-tight">{label}</p>
          <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">{desc}</p>
        </div>
      ))}
    </div>
  );
}
