'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface Note {
  id: string;
  ticket_id: string;
  note_text: string;
  created_at: string;
}

export interface Ticket {
  ticket_id: string;
  customer_name: string;
  subject: string;
  status: 'Open' | 'In Progress' | 'Closed' | string;
  created_at: string;
}

interface TicketStats {
  total: number;
  open: number;
  inProgress: number;
  closed: number;
}

interface TicketContextType {
  tickets: Ticket[];
  loading: boolean;
  stats: TicketStats;
  refetchTickets: () => Promise<void>;
  isDemo: boolean;
}

const TicketContext = createContext<TicketContextType | undefined>(undefined);

export function TicketProvider({ children }: { children: React.ReactNode }) {
  const [tickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);
  const [stats, setStats] = useState<TicketStats>({ total: 0, open: 0, inProgress: 0, closed: 0 });

  // Fetch tickets function for manual refresh
  const fetchTickets = useCallback(async () => {
    try {
      const response = await fetch('/api/tickets');
      if (response.ok) {
        const data: Ticket[] = await response.json();
        setStats({
          total: data.length,
          open: data.filter(t => t.status === 'Open').length,
          inProgress: data.filter(t => t.status === 'In Progress').length,
          closed: data.filter(t => t.status === 'Closed').length
        });
      }
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
    }
  }, []);

  // Fetch tickets on mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/tickets');
        if (response.ok) {
          const data: Ticket[] = await response.json();
          setStats({
            total: data.length,
            open: data.filter(t => t.status === 'Open').length,
            inProgress: data.filter(t => t.status === 'In Progress').length,
            closed: data.filter(t => t.status === 'Closed').length
          });
        }

        // Check demo mode
        const hasSupabase = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        setIsDemo(!hasSupabase);
      } catch (error) {
        console.error('Failed to fetch tickets in context:', error);
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, []);

  return (
    <TicketContext.Provider
      value={{
        tickets,
        loading,
        stats,
        refetchTickets: fetchTickets,
        isDemo,
      }}
    >
      {children}
    </TicketContext.Provider>
  );
}

export function useTickets() {
  const context = useContext(TicketContext);
  if (context === undefined) {
    throw new Error('useTickets must be used within a TicketProvider');
  }
  return context;
}
