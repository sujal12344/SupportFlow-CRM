'use client';

import React, { useState, useCallback, Suspense } from 'react';
import { Menu, X, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Sidebar from './Sidebar';
import CreateTicketDrawer from './CreateTicketDrawer';
import Toast from './Toast';
import { useTickets } from '@/context/TicketContext';
import Link from 'next/link';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const { refetchTickets } = useTickets();

  const dismissToast = useCallback(() => setToast(null), []);

  const handleTicketCreated = async (ticketId: string) => {
    await refetchTickets();
    setToast({ message: `Ticket ${ticketId} created successfully`, type: 'success' });
    router.push(`/tickets/${ticketId}`);
  };

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden font-sans text-slate-100">
      <div className="hidden md:flex h-full shrink-0">
        <Suspense fallback={<div className="w-64 bg-slate-900 border-r border-slate-800" />}>
          <Sidebar onOpenCreateDrawer={() => setIsCreateDrawerOpen(true)} />
        </Suspense>
      </div>

      {isSidebarOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
            onClick={() => setIsSidebarOpen(false)}
          />
          <div className="relative flex w-64 max-w-xs flex-1 flex-col bg-slate-900 border-r border-slate-800 animate-slide-in-left">
            <div className="absolute top-0 right-0 -mr-12 pt-4">
              <button
                type="button"
                className="ml-1 flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-slate-400 hover:text-white"
                onClick={() => setIsSidebarOpen(false)}
              >
                <X size={20} />
              </button>
            </div>
            <Suspense fallback={null}>
              <Sidebar
                onOpenCreateDrawer={() => {
                  setIsSidebarOpen(false);
                  setIsCreateDrawerOpen(true);
                }}
              />
            </Suspense>
          </div>
        </div>
      )}

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <header className="h-16 border-b border-slate-800/80 bg-slate-900/80 backdrop-blur-md px-4 flex items-center justify-between md:hidden shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <Menu size={20} />
            </button>
            <Link href="/" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-black text-xs shadow-lg shadow-indigo-600/30">
                DS
              </div>
              <span className="font-bold text-white tracking-wide text-xs">DATASTRAW</span>
            </Link>
          </div>
          <button
            onClick={() => setIsCreateDrawerOpen(true)}
            className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg flex items-center justify-center shadow-lg shadow-indigo-600/25"
          >
            <Plus size={18} />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto relative app-gradient-bg">
          {children}
        </main>
      </div>

      <CreateTicketDrawer
        isOpen={isCreateDrawerOpen}
        onClose={() => setIsCreateDrawerOpen(false)}
        onTicketCreated={handleTicketCreated}
      />

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={dismissToast} />
      )}
    </div>
  );
}
