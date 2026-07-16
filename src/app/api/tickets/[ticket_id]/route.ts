import { NextRequest, NextResponse } from 'next/server';
import { getTicketByTicketId, updateTicket } from '@/lib/db';
import { ticketUpdateSchema } from '@/lib/validation';
import { ZodError } from 'zod';

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
  } catch (error: unknown) {
    console.error(`API GET /api/tickets/[ticket_id] error for ${request.url}:`, error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch ticket' },
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
    
    // Validate request body with Zod
    const validatedData = ticketUpdateSchema.parse(body);

    // Call update function
    const result = await updateTicket(ticket_id, {
      status: validatedData.status,
      note_text: validatedData.notes || validatedData.note_text
    });

    // Return format: { success: true, updated_at }
    return NextResponse.json({
      success: true,
      updated_at: result.updated_at
    });
  } catch (error: unknown) {
    // Handle Zod validation errors
    if (error instanceof ZodError) {
      const firstError = error.issues[0];
      return NextResponse.json(
        { error: firstError.message },
        { status: 400 }
      );
    }

    // Handle not found errors
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      );
    }
    
    console.error(`API PUT /api/tickets/[ticket_id] error:`, error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
