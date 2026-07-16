# SupportFlow CRM Portal

A full-stack, responsive customer support ticketing system designed for seamless tracking, search, and collaboration. Built with **Next.js (App Router)**, **Tailwind CSS v4**, and **Supabase**.

---

## 🌟 Key Features

1. **Create Tickets**: Slide-out drawer form supporting customer name, email, subject, and description. Handles validation and automatic unique Ticket ID generation (`TKT-XXXX`).
2. **List & Metrics Overview**: Responsive grid showing real-time ticketing statistics (Total, Open, In Progress, Closed) alongside a searchable datatable.
3. **Quick Live Search**: High-performance debounced live search querying ticket IDs, names, emails, and descriptions as you type.
4. **Status Filtering**: Instantly filter tickets using status tabs (Open, In Progress, Closed).
5. **Timeline & Collaboration**: Unified ticket detail view displaying client profile, ticket status editor, and chronological timeline logs for internal team comments.
6. **Dual Database Mode (Resilient Fallback)**: Automatically switches to **Demo Mode (In-Memory)** if Supabase credentials are not detected, ensuring immediate testability.

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: React 19, Next.js 16 (App Router), Tailwind CSS v4, Lucide Icons, and `date-fns` for relative dates.
- **Backend API**: Next.js serverless route handlers acting as REST API endpoints:
  - `GET /api/tickets` — Lists all tickets (supports `search` & `status` filters).
  - `POST /api/tickets` — Inserts a new ticket, returns `ticket_id` and `created_at`.
  - `GET /api/tickets/[ticket_id]` — Retrieves details of a specific ticket, including nested notes.
  - `PUT /api/tickets/[ticket_id]` — Updates status and appends new timeline comments.
- **Database**: PostgreSQL (Supabase) as primary, with a serverless in-memory backup database.
- **State Management**: React Context (`TicketContext`) synchronizes sidebar stats counters with the tickets table and details view.

---

## 🚀 Getting Started

### 1. Database Setup (Supabase)
If you want to use the live database mode:
1. Create a free project on [Supabase](https://supabase.com).
2. Go to the **SQL Editor** in your Supabase dashboard.
3. Copy the contents of [`supabase/schema.sql`](./supabase/schema.sql) and run the script. This creates the `tickets` and `notes` tables, sets up relationships, and initializes auto-incrementing sequences for `TKT-XXXX` IDs.

### 2. Environment Configuration
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```
*Note: If these variables are not set, the app will run in **Demo Mode (In-Memory)** with pre-seeded mock tickets.*

### 3. Install & Start Development Server
```bash
# Install packages
npm install

# Start local server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.


---

## 📤 Deployment Guide
Vercel: https://SupportFlow-support-crm.vercel.app/ (replace with your deployed URL)

---

## 🎨 Customization

This fork has been customized with:
- **Custom Branding**: SupportFlow CRM with SK logo (Sujal Kesharwani)
- **Unique Color Theme**: Cyan-teal gradient replacing the original indigo-violet
- **Enhanced Status Badges**: Square badges with emoji indicators and gradient backgrounds
- **Repositioned Create Button**: Moved to sidebar header for better accessibility
- **Custom Empty State**: Mailbox emoji and contextual messaging


