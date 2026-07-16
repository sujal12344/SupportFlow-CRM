import { z } from 'zod';

// Ticket creation validation schema
export const ticketSchema = z.object({
  customer_name: z
    .string()
    .trim()
    .min(2, 'Customer name must be at least 2 characters')
    .max(100, 'Customer name must not exceed 100 characters'),
  customer_email: z
    .string()
    .trim()
    .email('Please provide a valid email address')
    .max(254, 'Email must not exceed 254 characters'),
  subject: z
    .string()
    .trim()
    .min(3, 'Subject must be at least 3 characters')
    .max(150, 'Subject must not exceed 150 characters'),
  description: z
    .string()
    .trim()
    .min(5, 'Description must be at least 5 characters')
    .max(3000, 'Description must not exceed 3000 characters'),
});

// Ticket update validation schema
export const ticketUpdateSchema = z.object({
  status: z.enum(['Open', 'In Progress', 'Closed']).optional(),
  notes: z.string().trim().min(1).max(2000).optional(),
  note_text: z.string().trim().min(1).max(2000).optional(),
}).refine((data) => data.status !== undefined || data.notes !== undefined || data.note_text !== undefined, {
  message: 'At least one field (status or notes) must be provided',
});

export type TicketInput = z.infer<typeof ticketSchema>;
export type TicketUpdateInput = z.infer<typeof ticketUpdateSchema>;
