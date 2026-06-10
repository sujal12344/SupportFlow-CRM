'use client';

import React, { useEffect } from 'react';
import { CheckCircle2, XCircle, X } from 'lucide-react';

export type ToastType = 'success' | 'error';

interface ToastProps {
  message: string;
  type?: ToastType;
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, type = 'success', onClose, duration = 4000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const isSuccess = type === 'success';

  return (
    <div
      role="alert"
      className="fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl animate-slide-up max-w-sm"
      style={{
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(19, 28, 46, 0.98) 100%)',
        borderColor: isSuccess ? 'rgba(52, 211, 153, 0.3)' : 'rgba(244, 63, 94, 0.3)',
        boxShadow: isSuccess
          ? '0 12px 40px -8px rgba(52, 211, 153, 0.2)'
          : '0 12px 40px -8px rgba(244, 63, 94, 0.2)',
      }}
    >
      {isSuccess ? (
        <CheckCircle2 size={20} className="text-emerald-400 shrink-0" />
      ) : (
        <XCircle size={20} className="text-rose-400 shrink-0" />
      )}
      <p className="text-sm font-medium text-white flex-1">{message}</p>
      <button
        onClick={onClose}
        className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
        aria-label="Dismiss"
      >
        <X size={16} />
      </button>
    </div>
  );
}
