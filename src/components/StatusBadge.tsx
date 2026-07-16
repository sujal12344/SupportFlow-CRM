interface StatusBadgeProps {
  status: 'Open' | 'In Progress' | 'Closed' | string;
  size?: 'sm' | 'md';
}

export default function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const normStatus = status.trim();

  let styles = 'bg-slate-500/10 text-slate-400 border-slate-500/20';
  let iconClass = '🔘';

  if (normStatus === 'Open') {
    styles = 'bg-linear-to-r from-cyan-500/15 to-teal-500/10 text-cyan-300 border-cyan-500/30 shadow-sm shadow-cyan-500/10';
    iconClass = '🟢';
  } else if (normStatus === 'In Progress') {
    styles = 'bg-linear-to-r from-orange-500/15 to-amber-500/10 text-orange-300 border-orange-500/30 shadow-sm shadow-orange-500/10';
    iconClass = '⏳';
  } else if (normStatus === 'Closed') {
    styles = 'bg-slate-700/20 text-slate-400 border-slate-600/40';
    iconClass = '✓';
  }

  const sizeClass = size === 'md' ? 'px-3 py-1.5 text-sm' : 'px-2.5 py-1 text-xs';

  return (
    <span className={`inline-flex items-center gap-1.5 ${sizeClass} font-bold rounded-lg border backdrop-blur-sm ${styles}`}>
      <span className="text-[10px]">{iconClass}</span>
      {normStatus}
    </span>
  );
}
