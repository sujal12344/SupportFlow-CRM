import { NextRequest, NextResponse } from 'next/server';
import { getTicketByTicketId, updateTicket } from '@/lib/db';

type RouteParams = {
  params: Promise<{ ticket_id: string }>;
};

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { ticket_id } = await params;
    const ticket = await getTicketByTicketId(ticket_id);

    if (!ticket) {
      return NextResponse.json(
        { error: `Ticket with ID ${ticket_id} not found` },
        { status: 404 }
      );
    }

    // Return format: { ticket_id, customer_name, customer_email, subject, description, status, notes }
    return NextResponse.json({
      ticket_id: ticket.ticket_id,
      customer_name: ticket.customer_name,
      customer_email: ticket.customer_email,
      subject: ticket.subject,
      description: ticket.description,
      status: ticket.status,
      created_at: ticket.created_at,
      updated_at: ticket.updated_at,
      notes: ticket.notes || [],
    });
  } catch (error: any) {
    console.error(`API GET /api/tickets/[ticket_id] error for ${request.url}:`, error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch ticket' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { ticket_id } = await params;
    const body = await request.json();
    const { status, notes, note_text } = body;

    // Validate that at least status or note is being updated
    if (status === undefined && notes === undefined && note_text === undefined) {
      return NextResponse.json(
        { error: 'Body must contain at least "status" or "notes"/"note_text" field.' },
        { status: 400 }
      );
    }

    // Call update function
    const result = await updateTicket(ticket_id, {
      status: status || undefined,
      note_text: notes || note_text || undefined
    });

    // Return format: { success: true, updated_at }
    return NextResponse.json({
      success: true,
      updated_at: result.updated_at
    });
  } catch (error: any) {
    console.error(`API PUT /api/tickets/[ticket_id] error:`, error);
    return NextResponse.json(
      { error: error.message || 'Failed to update ticket' },
      { status: 500 }
    );
  }
}
