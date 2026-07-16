import { createClient } from '@supabase/supabase-js';

export interface Note {
  id: string;
  ticket_id: string;
  note_text: string;
  created_at: string;
}

export interface Ticket {
  id: string;
  ticket_id: string;
  customer_name: string;
  customer_email: string;
  subject: string;
  description: string;
  status: 'Open' | 'In Progress' | 'Closed';
  created_at: string;
  updated_at: string;
  notes?: Note[];
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Determine if we are in Demo Mode (missing environment variables)
export const isDemoMode = () => {
  return !supabaseUrl || !supabaseAnonKey;
};

// Create Supabase Client if credentials exist
const supabase = !isDemoMode() ? createClient(supabaseUrl, supabaseAnonKey) : null;

// ==========================================
// MOCK DATABASE & SEED DATA (For Demo Mode)
// ==========================================

// Using an object wrapper to allow mutation while keeping the reference const
const mockData = {
  tickets: [
  {
    id: 'd9b0f69a-694d-4cb0-a8a2-25cb51197c31',
    ticket_id: 'TKT-1001',
    customer_name: 'Alice Johnson',
    customer_email: 'alice.johnson@example.com',
    subject: 'Cannot login to billing dashboard',
    description: 'Every time I try to log in to the billing portal, I get redirected to a 500 error page. My credentials work on the main site. Please help, my invoice is due tomorrow.',
    status: 'Open',
    created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
    updated_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    notes: []
  },
  {
    id: 'f568a0dc-c7bd-4648-b4b1-88ff91ea5632',
    ticket_id: 'TKT-1002',
    customer_name: 'Bob Smith',
    customer_email: 'bob.smith@company.com',
    subject: 'Webhook integration failures (event user.signup)',
    description: 'We set up our webhook URL to receive user.signup events, but our server has not received any payloads today. Webhook ID is wh_01h2a83.',
    status: 'In Progress',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
    notes: [
      {
        id: 'n1',
        ticket_id: 'TKT-1002',
        note_text: 'Reviewed logs on our API gateway. The payloads are sending, but bob.smith@company.com\'s server is returning a 403 Forbidden response. Sent a test ping webhook.',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString()
      },
      {
        id: 'n2',
        ticket_id: 'TKT-1002',
        note_text: 'Spoke to Bob. They are working on updating their firewall rules to whitelist our IP range.',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString()
      }
    ]
  },
  {
    id: 'a80e14a1-0f72-4632-9844-307963b51f08',
    ticket_id: 'TKT-1003',
    customer_name: 'Charlie Brown',
    customer_email: 'charlie@peanuts.org',
    subject: 'Incorrect pricing on standard tier checkout',
    description: 'The pricing page states the standard plan is $29/mo, but when I click subscribe, Stripe checkout displays $39/mo. Can you match the advertised price?',
    status: 'Closed',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
    notes: [
      {
        id: 'n3',
        ticket_id: 'TKT-1003',
        note_text: 'Identified a cache issue on the checkout redirect which pointed to the legacy price ID.',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2.5).toISOString()
      },
      {
        id: 'n4',
        ticket_id: 'TKT-1003',
        note_text: 'Cache cleared, pricing is corrected. Emailed customer confirmation. Closing ticket.',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString()
      }
    ]
  }
] as Ticket[]
};

let nextTicketSeq = 1004;

// ==========================================
// DATABASE ADAPTER FUNCTIONS
// ==========================================

export async function getTickets(filters?: { status?: string; search?: string }): Promise<Ticket[]> {
  if (isDemoMode() || !supabase) {
    let result = [...mockData.tickets];

    if (filters?.status) {
      result = result.filter(t => t.status.toLowerCase() === filters.status?.toLowerCase());
    }

    if (filters?.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(t => 
        t.ticket_id.toLowerCase().includes(q) ||
        t.customer_name.toLowerCase().includes(q) ||
        t.customer_email.toLowerCase().includes(q) ||
        t.subject.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q)
      );
    }

    // Sort by created_at descending
    return result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  // Live Supabase implementation
  let query = supabase.from('tickets').select('id, ticket_id, customer_name, customer_email, subject, description, status, created_at, updated_at');
  
  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  
  if (filters?.search) {
    const q = filters.search;
    // Perform general search across fields
    query = query.or(`customer_name.ilike.%${q}%,customer_email.ilike.%${q}%,subject.ilike.%${q}%,description.ilike.%${q}%,ticket_id.ilike.%${q}%`);
  }

  const { data, error } = await query.order('created_at', { ascending: false });
  
  if (error) {
    console.error('Supabase getTickets error:', error);
    throw new Error(error.message);
  }

  return (data || []) as Ticket[];
}

export async function getTicketByTicketId(ticketId: string): Promise<Ticket | null> {
  if (isDemoMode() || !supabase) {
    const ticket = mockData.tickets.find(t => t.ticket_id.toLowerCase() === ticketId.toLowerCase());
    return ticket ? { ...ticket } : null;
  }

  // Get ticket and related notes
  const { data: ticketData, error: ticketError } = await supabase
    .from('tickets')
    .select('*')
    .eq('ticket_id', ticketId)
    .single();

  if (ticketError) {
    if (ticketError.code === 'PGRST116') return null; // Not found
    console.error('Supabase getTicket error:', ticketError);
    throw new Error(ticketError.message);
  }

  const { data: notesData, error: notesError } = await supabase
    .from('notes')
    .select('*')
    .eq('ticket_id', ticketId)
    .order('created_at', { ascending: true });

  if (notesError) {
    console.error('Supabase getNotes error:', notesError);
    throw new Error(notesError.message);
  }

  return {
    ...ticketData,
    notes: notesData || []
  } as Ticket;
}

export async function createTicket(ticket: Omit<Ticket, 'id' | 'ticket_id' | 'created_at' | 'updated_at' | 'status'>): Promise<Ticket> {
  if (isDemoMode() || !supabase) {
    const timestamp = new Date().toISOString();
    const ticketId = `TKT-${nextTicketSeq++}`;
    const newTicket: Ticket = {
      id: Math.random().toString(36).substring(2, 15),
      ticket_id: ticketId,
      customer_name: ticket.customer_name,
      customer_email: ticket.customer_email,
      subject: ticket.subject,
      description: ticket.description,
      status: 'Open',
      created_at: timestamp,
      updated_at: timestamp,
      notes: []
    };
    mockData.tickets.unshift(newTicket);
    return { ...newTicket };
  }

  const { data, error } = await supabase
    .from('tickets')
    .insert([
      {
        customer_name: ticket.customer_name,
        customer_email: ticket.customer_email,
        subject: ticket.subject,
        description: ticket.description,
        status: 'Open'
      }
    ])
    .select('*')
    .single();

  if (error) {
    console.error('Supabase createTicket error:', error);
    throw new Error(error.message);
  }

  return data as Ticket;
}

export async function updateTicket(
  ticketId: string, 
  updates: { status?: 'Open' | 'In Progress' | 'Closed'; note_text?: string }
): Promise<{ success: boolean; updated_at: string }> {
  const timestamp = new Date().toISOString();

  if (isDemoMode() || !supabase) {
    const ticketIndex = mockData.tickets.findIndex(t => t.ticket_id.toLowerCase() === ticketId.toLowerCase());
    if (ticketIndex === -1) {
      throw new Error(`Ticket ${ticketId} not found`);
    }

    const ticket = mockData.tickets[ticketIndex];
    
    if (updates.status) {
      ticket.status = updates.status;
    }
    
    ticket.updated_at = timestamp;

    if (updates.note_text) {
      if (!ticket.notes) {
        ticket.notes = [];
      }
      ticket.notes.push({
        id: Math.random().toString(36).substring(2, 15),
        ticket_id: ticketId,
        note_text: updates.note_text,
        created_at: timestamp
      });
    }

    mockData.tickets[ticketIndex] = ticket;
    return { success: true, updated_at: timestamp };
  }

  // Update Ticket Status
  if (updates.status) {
    const { error: ticketError } = await supabase
      .from('tickets')
      .update({ status: updates.status, updated_at: timestamp })
      .eq('ticket_id', ticketId);

    if (ticketError) {
      console.error('Supabase updateTicket error:', ticketError);
      throw new Error(ticketError.message);
    }
  } else {
    // If no status is changing, but notes are being added, we should still touch the updated_at timestamp
    const { error: ticketError } = await supabase
      .from('tickets')
      .update({ updated_at: timestamp })
      .eq('ticket_id', ticketId);

    if (ticketError) {
      console.error('Supabase touchTicket error:', ticketError);
      throw new Error(ticketError.message);
    }
  }

  // Add Note if present
  if (updates.note_text) {
    const { error: noteError } = await supabase
      .from('notes')
      .insert([
        {
          ticket_id: ticketId,
          note_text: updates.note_text
        }
      ]);

    if (noteError) {
      console.error('Supabase createNote error:', noteError);
      throw new Error(noteError.message);
    }
  }

  return { success: true, updated_at: timestamp };
}
