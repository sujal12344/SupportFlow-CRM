# SupportFlow CRM - Architecture & Code Flow Documentation

## 📁 Project Structure Overview

```
src/
├── app/                          # Next.js App Router pages
│   ├── layout.tsx               # Root layout with providers
│   ├── page.tsx                 # Home page (ticket list)
│   ├── globals.css              # Global Tailwind styles
│   ├── api/                     # API routes
│   │   └── tickets/
│   │       ├── route.ts         # GET, POST /api/tickets
│   │       └── [ticket_id]/
│   │           └── route.ts     # GET, PUT /api/tickets/:id
│   └── tickets/
│       └── [ticket_id]/
│           └── page.tsx         # Ticket detail page
│
├── components/                   # Reusable React components
│   ├── DashboardLayout.tsx      # Main layout wrapper
│   ├── Sidebar.tsx              # Navigation sidebar
│   ├── CreateTicketDrawer.tsx   # Ticket creation form
│   ├── StatusBadge.tsx          # Status display component
│   ├── StatusSelector.tsx       # Status dropdown
│   ├── CustomerAvatar.tsx       # Customer avatar generator
│   ├── FeatureOverview.tsx      # Feature cards
│   └── Toast.tsx                # Toast notifications
│
├── context/
│   └── TicketContext.tsx        # Global ticket state management
│
└── lib/
    ├── db.ts                     # Database operations (Supabase + Demo)
    └── validation.ts             # Zod validation schemas
```

---

## 🏠 HOME PAGE (`src/app/page.tsx`)

### What User Sees:
1. **Header Section** - Title "All Support Tickets" + subtitle + refresh button
2. **Feature Cards** - 5 feature overview cards
3. **Stats Cards** - Total, Open, In Progress, Closed counts (clickable filters)
4. **Search Bar** - Live search input
5. **Status Filter Buttons** - All, Open, In Progress, Closed
6. **Ticket Table** - List of all tickets with ID, Name, Title, Status, Date
7. **Empty State** - Mailbox emoji when no tickets found

### Code Flow:

#### 1. Component Structure
```
Home (page.tsx)
  └─ Suspense (React)
      └─ DashboardContent
          ├─ useRouter (navigation)
          ├─ useSearchParams (read URL params)
          └─ useTickets (global state)
```

#### 2. State Management
```javascript
// Local state
const [search, setSearch] = useState('');           // Search input
const [tickets, setTickets] = useState([]);         // Filtered tickets
const [loading, setLoading] = useState(true);       // Loading state
const [debouncedSearch, setDebouncedSearch] = useState(''); // Debounced search

// URL state
const statusFilter = searchParams.get('status') || ''; // From URL

// Global state (from Context)
const { stats, loading: contextLoading, refetchTickets, isDemo } = useTickets();
```

#### 3. Data Fetching Flow
```
User types in search
    ↓
useEffect detects change
    ↓
setTimeout (300ms debounce)
    ↓
setDebouncedSearch
    ↓
useEffect with [statusFilter, debouncedSearch]
    ↓
fetchFiltered() async function
    ↓
Build query params (?status=Open&search=john)
    ↓
fetch('/api/tickets?...')
    ↓
setTickets(response)
```

#### 4. Component Rendering
```javascript
return (
  <div>
    {/* Header */}
    <div>Title + Subtitle + Refresh Button</div>
    
    {/* Feature Cards */}
    <FeatureOverview />
    
    {/* Stats Cards (clickable) */}
    <div>
      {statCards.map(card => (
        <button onClick={() => setStatusFilter(card.filter)}>
          {card.label}: {card.value}
        </button>
      ))}
    </div>
    
    {/* Search Bar */}
    <input value={search} onChange={(e) => setSearch(e.target.value)} />
    
    {/* Filter Buttons */}
    <div>
      <button onClick={() => setStatusFilter('')}>All</button>
      <button onClick={() => setStatusFilter('Open')}>Open</button>
      ...
    </div>
    
    {/* Ticket Table */}
    {loading ? (
      <SkeletonLoader />
    ) : tickets.length === 0 ? (
      <EmptyState />
    ) : (
      <table>
        {tickets.map(ticket => (
          <tr onClick={() => router.push(`/tickets/${ticket.ticket_id}`)}>
            <td>{ticket.ticket_id}</td>
            <td><CustomerAvatar />{ticket.customer_name}</td>
            <td>{ticket.subject}</td>
            <td><StatusBadge status={ticket.status} /></td>
            <td>{formatDate(ticket.created_at)}</td>
          </tr>
        ))}
      </table>
    )}
  </div>
)
```

### Key Libraries Used:
- **next/navigation**: `useRouter`, `useSearchParams` for URL state
- **react**: `useState`, `useEffect`, `Suspense` for state & lifecycle
- **date-fns**: `format`, `formatDistanceToNow` for date formatting
- **lucide-react**: Icons (Search, Filter, Inbox, etc.)

---

## 📋 TICKET DETAIL PAGE (`src/app/tickets/[ticket_id]/page.tsx`)

### What User Sees:
1. **Back Button** - Navigate to home
2. **Header** - Ticket ID (clickable to copy) + Status Badge
3. **Title & Metadata** - Subject, created date, updated date
4. **Status Selector** - Dropdown to change status
5. **Customer Card** - Avatar + Name + Email
6. **Description Card** - Full issue description
7. **Comments Timeline** - All notes/comments chronologically
8. **Add Comment Form** - Textarea + submit button
9. **Ticket Info Sidebar** - Status, ID, dates

### Code Flow:

#### 1. Component Structure
```
TicketDetailPage
  ├─ use(params) - Get ticket_id from URL
  ├─ useRouter - Navigation
  └─ useTickets - Global refresh
```

#### 2. Data Loading
```
Component mounts
    ↓
useEffect with [ticket_id]
    ↓
loadTicket() async function
    ↓
setLoading(true)
    ↓
fetch(`/api/tickets/${ticket_id}`)
    ↓
Parse response
    ↓
setTicket(data)
    ↓
setStatusInput(data.status)
    ↓
setLoading(false)
```

#### 3. Update Status Flow
```
User selects new status
    ↓
handleStatusChange(newStatus)
    ↓
setUpdatingStatus(true)
    ↓
fetch(`/api/tickets/${ticket_id}`, {
  method: 'PUT',
  body: { status: newStatus }
})
    ↓
fetchTicketDetails() - Reload ticket
    ↓
refetchTickets() - Update global stats
    ↓
setUpdatingStatus(false)
```

#### 4. Add Comment Flow
```
User types comment + clicks submit
    ↓
handleAddNote(e)
    ↓
e.preventDefault()
    ↓
Validate: if (!newNote.trim()) return;
    ↓
setSubmittingNote(true)
    ↓
fetch(`/api/tickets/${ticket_id}`, {
  method: 'PUT',
  body: { notes: newNote.trim() }
})
    ↓
setNewNote('') - Clear form
    ↓
fetchTicketDetails() - Reload to show new comment
    ↓
refetchTickets() - Update stats
    ↓
setSubmittingNote(false)
```

#### 5. Copy Ticket ID Flow
```
User clicks ticket ID
    ↓
copyTicketId()
    ↓
navigator.clipboard.writeText(ticket_id)
    ↓
setCopied(true) - Show check icon
    ↓
setTimeout(() => setCopied(false), 2000) - Reset after 2s
```

### Key Libraries Used:
- **react**: `use()` for async params, `useState`, `useEffect`, `useCallback`
- **next/navigation**: `useRouter` for navigation
- **date-fns**: Date formatting
- **lucide-react**: Icons (ArrowLeft, Copy, Check, etc.)

---

## 🎨 DASHBOARD LAYOUT (`src/components/DashboardLayout.tsx`)

### Purpose:
Wraps entire app, provides consistent layout structure with sidebar and header.

### What It Does:
1. **Desktop**: Shows sidebar on left, content on right
2. **Mobile**: Hamburger menu + slide-out sidebar
3. **Floating Create Drawer**: Manages CreateTicketDrawer state
4. **Toast Notifications**: Shows success/error messages

### Code Flow:

#### Component Structure
```
DashboardLayout
  ├─ State
  │   ├─ isSidebarOpen (mobile menu)
  │   ├─ isCreateDrawerOpen (ticket form)
  │   └─ toast (notifications)
  │
  ├─ Desktop Sidebar (hidden on mobile)
  │   └─ <Sidebar onOpenCreateDrawer={...} />
  │
  ├─ Mobile Sidebar Overlay
  │   └─ Backdrop + Slide-in <Sidebar />
  │
  ├─ Mobile Header
  │   ├─ Hamburger button
  │   ├─ Logo
  │   └─ Create button (+)
  │
  ├─ Main Content Area
  │   └─ {children} (page content)
  │
  ├─ CreateTicketDrawer (floating)
  │   └─ Opens on button click
  │
  └─ Toast (floating)
      └─ Shows on ticket creation
```

#### Create Ticket Flow
```
User clicks "Create Ticket" button
    ↓
setIsCreateDrawerOpen(true)
    ↓
<CreateTicketDrawer isOpen={true} />
    ↓
User fills form + submits
    ↓
onTicketCreated(ticketId) callback
    ↓
refetchTickets() - Update stats
    ↓
setToast({ message, type: 'success' })
    ↓
router.push(`/tickets/${ticketId}`) - Navigate to new ticket
    ↓
Toast auto-dismisses after 3s
```

### Key Libraries Used:
- **react**: State management, callbacks
- **next/navigation**: useRouter
- **lucide-react**: Menu, X, Plus icons

---

## 📝 CREATE TICKET DRAWER (`src/components/CreateTicketDrawer.tsx`)

### Purpose:
Slide-in drawer form for creating new support tickets.

### What User Sees:
1. **Header** - "Create New Ticket" title + close button
2. **Info Card** - Note about auto-generated ticket ID
3. **Customer Fields** - Name (with counter 0/100) + Email (0/254)
4. **Issue Fields** - Title (0/150) + Description (0/3000)
5. **Action Buttons** - Cancel + Create Ticket (with loading state)

### Code Flow:

#### 1. Form State
```javascript
const [customerName, setCustomerName] = useState('');
const [customerEmail, setCustomerEmail] = useState('');
const [subject, setSubject] = useState('');
const [description, setDescription] = useState('');
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);
```

#### 2. Validation Flow (Client-Side)
```
User clicks "Create Ticket"
    ↓
handleSubmit(e)
    ↓
e.preventDefault() - Stop form submission
    ↓
Trim all fields
    ↓
Check if empty → setError('Fill all fields')
    ↓
Check name length (2-100) → setError('Name too short/long')
    ↓
Check email format (regex) → setError('Invalid email')
    ↓
Check subject length (3-150) → setError(...)
    ↓
Check description length (5-3000) → setError(...)
    ↓
All valid? Continue to API call
```

#### 3. API Submission Flow
```
setLoading(true)
    ↓
fetch('/api/tickets', {
  method: 'POST',
  body: JSON.stringify({
    customer_name: trimmedName,
    customer_email: trimmedEmail,
    subject: trimmedSubject,
    description: trimmedDescription
  })
})
    ↓
Server validates with Zod
    ↓
Success? 
  ├─ Yes → resetForm(), onTicketCreated(ticket_id), onClose()
  └─ No → setError(response.error)
    ↓
setLoading(false)
```

#### 4. Character Counter Display
```javascript
<label>
  Customer Name *
  <span className="ml-auto text-slate-500 text-[10px]">
    {customerName.trim().length}/100
  </span>
</label>
<input 
  value={customerName}
  onChange={(e) => setCustomerName(e.target.value)}
  maxLength={100}
/>
```

### Key Libraries Used:
- **react**: Form state management
- **lucide-react**: Icons (X, Send, User, Mail, Tag, AlignLeft, Sparkles)

---

## 🔄 TICKET CONTEXT (`src/context/TicketContext.tsx`)

### Purpose:
Global state management for ticket statistics and demo mode detection.

### What It Provides:
```typescript
{
  tickets: Ticket[],          // Not used directly (for future)
  loading: boolean,           // Initial load state
  stats: {
    total: number,
    open: number,
    inProgress: number,
    closed: number
  },
  refetchTickets: () => void, // Refresh stats
  isDemo: boolean            // Demo mode or Supabase?
}
```

### Code Flow:

#### 1. Initial Load
```
App starts
    ↓
TicketProvider mounts
    ↓
useEffect (empty deps) runs
    ↓
loadData() async
    ↓
fetch('/api/tickets')
    ↓
Calculate stats from response
    ↓
setStats({ total, open, inProgress, closed })
    ↓
Check environment: hasSupabase = !!env.SUPABASE_URL
    ↓
setIsDemo(!hasSupabase)
    ↓
setLoading(false)
```

#### 2. Manual Refresh
```
Component calls refetchTickets()
    ↓
fetch('/api/tickets')
    ↓
Recalculate stats
    ↓
setStats(newStats)
    ↓
All components using useTickets() re-render
```

### Key Libraries Used:
- **react**: createContext, useContext, useState, useEffect, useCallback

---

## 🗄️ DATABASE LAYER (`src/lib/db.ts`)

### Purpose:
Abstraction layer for database operations with Supabase + demo fallback.

### Architecture:

```
API Route calls db.ts function
    ↓
isDemoMode() check
    ├─ TRUE → Use in-memory mockData
    └─ FALSE → Use Supabase client
```

### Functions:

#### 1. `getTickets({ status?, search? })`
```
Check if demo mode
    ├─ Demo: Filter mockData.tickets array
    └─ Supabase: Build query with .eq() and .or()
        ↓
Return filtered & sorted tickets
```

#### 2. `getTicketByTicketId(ticketId)`
```
Check if demo mode
    ├─ Demo: mockData.tickets.find()
    └─ Supabase: 
        ├─ Query tickets table
        └─ Query notes table (JOIN)
        ↓
Return ticket with notes array
```

#### 3. `createTicket({ customer_name, customer_email, subject, description })`
```
Check if demo mode
    ├─ Demo:
    │   ├─ Generate TKT-XXXX ID
    │   ├─ Add to mockData.tickets
    │   └─ Return new ticket
    └─ Supabase:
        ├─ INSERT with auto-generated ticket_id (DB trigger)
        └─ Return inserted ticket
```

#### 4. `updateTicket(ticketId, { status?, note_text? })`
```
Check if demo mode
    ├─ Demo:
    │   ├─ Find ticket in mockData
    │   ├─ Update status if provided
    │   ├─ Push note if provided
    │   └─ Update timestamp
    └─ Supabase:
        ├─ UPDATE tickets SET status = ? WHERE ticket_id = ?
        └─ INSERT INTO notes if note_text provided
        ↓
Return { success: true, updated_at }
```

### Key Libraries Used:
- **@supabase/supabase-js**: `createClient` for Supabase connection

---

## ✅ VALIDATION LAYER (`src/lib/validation.ts`)

### Purpose:
Type-safe input validation using Zod schemas.

### Schemas:

#### 1. `ticketSchema` (POST /api/tickets)
```typescript
{
  customer_name: string (2-100 chars, trimmed),
  customer_email: string (valid email, max 254),
  subject: string (3-150 chars, trimmed),
  description: string (5-3000 chars, trimmed)
}
```

#### 2. `ticketUpdateSchema` (PUT /api/tickets/:id)
```typescript
{
  status?: 'Open' | 'In Progress' | 'Closed',
  notes?: string (1-2000 chars),
  note_text?: string (1-2000 chars)
}
// At least one field required
```

### Usage in API:

```typescript
// In route.ts
import { ticketSchema } from '@/lib/validation';
import { ZodError } from 'zod';

try {
  const validatedData = ticketSchema.parse(body);
  // Use validatedData (type-safe!)
} catch (error) {
  if (error instanceof ZodError) {
    const firstError = error.issues[0];
    return NextResponse.json(
      { error: firstError.message },
      { status: 400 }
    );
  }
}
```

### Key Libraries Used:
- **zod**: Schema validation library

---

## 🎨 UI COMPONENTS

### 1. StatusBadge (`src/components/StatusBadge.tsx`)
**Purpose**: Display ticket status with emoji + styling

```typescript
<StatusBadge status="Open" size="sm" />
// Renders: 🟢 Open (with cyan gradient background)
```

**Styling Map**:
- Open → 🟢 + cyan gradient
- In Progress → ⏳ + orange gradient
- Closed → ✓ + gray background

---

### 2. CustomerAvatar (`src/components/CustomerAvatar.tsx`)
**Purpose**: Generate colored avatar with initials

```typescript
<CustomerAvatar name="John Doe" size="md" />
// Renders: Circular badge with "JD"
```

**Logic**:
```
getInitials("John Doe")
    ↓
Take first + last initials → "JD"
    ↓
getColorIndex(name) - Hash name
    ↓
Select gradient from colorPairs array
    ↓
Render <div> with gradient + initials
```

---

### 3. StatusSelector (`src/components/StatusSelector.tsx`)
**Purpose**: Dropdown to change ticket status

```typescript
<StatusSelector 
  value={currentStatus}
  onChange={handleStatusChange}
  disabled={updating}
/>
```

**Options**: Open, In Progress, Closed

---

## 🔌 API ROUTES

### 1. `POST /api/tickets` (`src/app/api/tickets/route.ts`)

**Request**:
```json
{
  "customer_name": "John Doe",
  "customer_email": "john@example.com",
  "subject": "Cannot login",
  "description": "Getting 500 error on login page"
}
```

**Response** (201):
```json
{
  "ticket_id": "TKT-1004",
  "created_at": "2024-01-15T10:30:00Z"
}
```

**Error** (400):
```json
{
  "error": "Customer name must be at least 2 characters"
}
```

---

### 2. `GET /api/tickets?status=Open&search=john`

**Response** (200):
```json
[
  {
    "ticket_id": "TKT-1001",
    "customer_name": "John Doe",
    "customer_email": "john@example.com",
    "subject": "Cannot login",
    "status": "Open",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
]
```

---

### 3. `GET /api/tickets/TKT-1001`

**Response** (200):
```json
{
  "ticket_id": "TKT-1001",
  "customer_name": "John Doe",
  "customer_email": "john@example.com",
  "subject": "Cannot login",
  "description": "Getting 500 error...",
  "status": "Open",
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z",
  "notes": [
    {
      "id": "n1",
      "ticket_id": "TKT-1001",
      "note_text": "Investigating the issue",
      "created_at": "2024-01-15T11:00:00Z"
    }
  ]
}
```

**Error** (404):
```json
{
  "error": "Ticket with ID TKT-9999 not found"
}
```

---

### 4. `PUT /api/tickets/TKT-1001`

**Request**:
```json
{
  "status": "In Progress",
  "notes": "Checked server logs, found the issue"
}
```

**Response** (200):
```json
{
  "success": true,
  "updated_at": "2024-01-15T12:00:00Z"
}
```

---

## 🎯 Key Technical Decisions

### 1. Why Next.js App Router?
- Server-side rendering for better SEO
- Built-in API routes (no separate backend)
- File-based routing
- React Server Components for performance

### 2. Why Supabase?
- PostgreSQL database (reliable, scalable)
- Auto-generated REST API
- Row-level security
- Free tier for development

### 3. Why Zod?
- Type-safe validation at runtime
- Better error messages than manual validation
- Integrates well with TypeScript
- Industry standard

### 4. Why Context API?
- Simple global state for stats
- No need for Redux (overkill for this size)
- Built into React
- Easy to understand

### 5. Why Tailwind CSS?
- Utility-first (fast development)
- Consistent design system
- No CSS files to manage
- Version 4 (latest features)

---

## 🔍 Performance Optimizations

1. **Debounced Search** - 300ms delay before API call
2. **React Suspense** - Better loading states
3. **useCallback** - Memoize functions to prevent re-renders
4. **Lazy Loading** - Only load ticket details when clicked
5. **Optimistic UI** - Show loading states immediately

---

## 🚀 Deployment Architecture

```
User Browser
    ↓
Vercel Edge Network (CDN)
    ↓
Next.js Server (Serverless Functions)
    ↓
Supabase PostgreSQL Database
```

**Benefits**:
- Global CDN for fast loading
- Auto-scaling serverless functions
- Zero downtime deployments
- HTTPS by default

---

This architecture document explains the complete flow of your application. Use it for understanding and explaining your codebase in interviews!
