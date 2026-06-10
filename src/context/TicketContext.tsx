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
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);
  const [stats, setStats] = useState<TicketStats>({ total: 0, open: 0, inProgress: 0, closed: 0 });

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch all tickets to compute stats
      const response = await fetch('/api/tickets');
      if (response.ok) {
        const data = await response.json();
        setTickets(data);
        
        // Calculate statistics
        const computedStats = data.reduce(
          (acc: TicketStats, curr: Ticket) => {
            acc.total += 1;
            const status = curr.status.trim();
            if (status === 'Open') acc.open += 1;
            else if (status === 'In Progress') acc.inProgress += 1;
            else if (status === 'Closed') acc.closed += 1;
            return acc;
          },
          { total: 0, open: 0, inProgress: 0, closed: 0 }
        );
        setStats(computedStats);

        // Check if server is running in Demo Mode by inspecting headers/config if needed,
        // or we can determine it based on response or calling a lightweight helper endpoint.
        // For simplicity, we can do a quick check via env vars in client if available or default to false.
        // Let's check if the client can see process.env.NEXT_PUBLIC_SUPABASE_URL
        const hasSupabase = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        setIsDemo(!hasSupabase);
      }
    } catch (error) {
      console.error('Failed to fetch tickets in context:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

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
