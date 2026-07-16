import { NextRequest, NextResponse } from 'next/server';
import { getTickets, createTicket } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const search = searchParams.get('search') || undefined;

    const tickets = await getTickets({ status, search });
    
    // Format the response as requested: [{ ticket_id, customer_name, subject, status, created_at }]
    const formattedTickets = tickets.map(ticket => ({
      ticket_id: ticket.ticket_id,
      customer_name: ticket.customer_name,
      customer_email: ticket.customer_email,
      subject: ticket.subject,
      status: ticket.status,
      created_at: ticket.created_at,
      updated_at: ticket.updated_at,
    }));

    return NextResponse.json(formattedTickets);
  } catch (error: unknown) {
    console.error('API GET /api/tickets error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch tickets' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customer_name, customer_email, subject, description } = body;

    // Simple validation
    if (!customer_name || !customer_email || !subject || !description) {
      return NextResponse.json(
        { error: 'Missing required fields: customer_name, customer_email, subject, and description are required.' },
        { status: 400 }
      );
    }

    const newTicket = await createTicket({
      customer_name,
      customer_email,
      subject,
      description
    });

    // Return format as requested: { ticket_id, created_at }
    return NextResponse.json({
      ticket_id: newTicket.ticket_id,
      created_at: newTicket.created_at
    }, { status: 201 });
  } catch (error: unknown) {
    console.error('API POST /api/tickets error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create ticket' },
      { status: 500 }
    );
  }
}
