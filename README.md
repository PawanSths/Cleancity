# CleanCity

A civic issue reporting platform for municipalities and local organizations. Citizens report sanitation, road, and drainage problems with photos and GPS; municipal staff triage, assign, and resolve complaints from one dashboard.

## Project Structure

```text
cleancity/
├── src/
│   ├── app/                    # Next.js App Router pages and API routes
│   │   ├── api/                # API endpoints (image analysis, health check)
│   │   ├── auth/               # Login, signup, OAuth callback
│   │   ├── admin/              # Admin dashboard and user management
│   │   ├── complaints/         # Complaint detail pages
│   │   ├── report/             # Report submission page
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Home page
│   │   └── globals.css         # Tailwind v4 + theme variables
│   ├── components/
│   │   ├── ui/                 # Reusable shadcn-style UI primitives
│   │   ├── layout/             # Header, theme toggle, service status
│   │   ├── auth/               # Login, signup, user menu components
│   │   ├── complaints/         # Complaint form, cards, feed, badges
│   │   ├── admin/              # Admin dashboard, metrics
│   │   ├── maps/               # Leaflet map components
│   │   └── providers/          # Theme provider
│   ├── lib/
│   │   ├── supabase/           # Supabase client factories (browser, server, middleware)
│   │   ├── validations/        # Zod validation schemas
│   │   ├── ai/                 # Gemini image analysis
│   │   ├── actions.ts          # Server actions for complaints
│   │   ├── data.ts             # Data access layer
│   │   ├── env.ts              # Server-side environment config
│   │   ├── public-env.ts       # Browser-accessible env vars
│   │   ├── utils.ts            # Shared utilities (cn, formatting, etc.)
│   │   ├── constants.ts        # Categories, statuses, severities
│   │   ├── rate-limit.ts       # In-memory rate limiter
│   │   ├── system-status.ts    # Health check logic
│   │   └── mock-data.ts        # Demo data fallback
│   └── types/
│       └── database.ts         # TypeScript domain types
├── supabase/
│   ├── schema.sql              # Database schema, RLS policies, storage
│   ├── seed.sql                # Sample anonymous complaints
│   └── backfill-profiles.sql  # Migration to create missing profiles
├── public/                     # Static assets (publicly accessible)
├── .env.example                # Environment template
├── .gitignore                  # Git ignore rules
├── package.json                # Dependencies and scripts
└── configuration files        # next.config.ts, tsconfig.json, etc.
```

## How to Install

1. Clone the repository
2. Run `npm install`
3. Copy `.env.example` to `.env.local` and fill in your values (see below)
4. Set up Supabase (see Supabase Setup)
5. Run `npm run dev` to start the development server

## How to Run Locally

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## Environment Variables

Copy `.env.example` to `.env.local` and set:

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_APP_URL` | Yes | Your app URL (http://localhost:3000 for dev) |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon key (safe to expose to browser) |
| `SUPABASE_SERVICE_ROLE_KEY` | No | Supabase service role key (server-only, never expose to browser) |
| `GEMINI_API_KEY` | Yes | Google Gemini API key for image analysis |
| `GEMINI_VISION_MODEL` | No | Gemini model name (default: gemini-2.0-flash) |

**Security Note:** Never commit `.env.local`. It is git-ignored. The service role key bypasses RLS and must never be exposed to the client.

## Supabase Setup

1. Create a free Supabase project at https://supabase.com
2. Open Supabase SQL Editor
3. Run `supabase/schema.sql` to create tables, RLS policies, and storage bucket
4. Run `supabase/seed.sql` to add sample data (optional)
5. Enable Google OAuth in Supabase Auth settings (optional)
6. Get your project URL and anon key from Settings > API

### Database Tables

- **profiles** — User profiles linked to Supabase Auth
- **complaints** — Citizen reports with GPS, images, AI analysis
- **complaint_upvotes** — Citizen upvotes on complaints
- **complaint_events** — Admin action log

### Row Level Security (RLS)

All tables have RLS enabled:

- **profiles**: Public read, self-update, admin manages
- **complaints**: Public read, citizens insert own reports, admins update
- **complaint_upvotes**: Authenticated users insert own upvotes
- **complaint_events**: Admin read/write only

### Storage

- Bucket: `complaint-photos` (public read, authenticated write)
- Max file size: 8 MB
- Allowed types: JPEG, PNG, WebP, HEIC

## Gemini API Setup

1. Get a free API key from Google AI Studio: https://aistudio.google.com/apikey
2. Add it to `.env.local` as `GEMINI_API_KEY`
3. The image analysis runs server-side in `/api/analyze`
4. Client never receives the API key

The AI analyzes uploaded complaint photos and suggests:
- Category (garbage, pothole, drainage, sewage, graffiti, other)
- Severity (low, medium, high, critical)
- Summary (1-2 sentence description)
- Confidence (0-1)
- Spam score (0-1)

## How Citizen Reporting Works

1. Visit `/report`
2. Upload a photo of the issue
3. AI automatically analyzes the photo (category, severity, summary)
4. Fill in title, description, category, severity
5. GPS location is captured automatically (or manually entered)
6. Submit anonymously or with your account
7. Report appears on home page and in admin dashboard
8. Track status: Pending → In Progress → Resolved

## How Admin Functionality Works

1. Sign in with an admin/staff account
2. Access `/admin` dashboard
3. View live complaint feed with filters (area, category, severity, status)
4. Update complaint status
5. Assign complaints to staff
6. View hotspot analytics
7. Manage user roles at `/admin/users`

## How to Build/Deploy

```bash
npm run build
npm start
```

Deploy to Vercel or any Node.js hosting. Set environment variables in your hosting platform.

## Security Measures

- **Open Redirect Fixed**: All redirect URLs validated to prevent phishing
- **Server-Side Authorization**: Admin operations verified server-side, not just hidden in UI
- **Storage Locked**: Only authenticated users can upload photos
- **Input Validation**: All user input validated with Zod schemas
- **RLS Policies**: Database enforces least-privilege access
- **API Key Protection**: Gemini key server-side only

## Development Notes

- Works in "demo mode" without Supabase (uses mock data)
- Real-time updates via Supabase Realtime
- Maps via OpenStreetMap (free, no token required)
- Dark mode supported

## Tech Stack

- **Framework**: Next.js 15 (App Router, Server Components)
- **Database**: Supabase (PostgreSQL + PostGIS)
- **Auth**: Supabase Auth (email/password, magic link, Google OAuth)
- **Storage**: Supabase Storage
- **AI**: Google Gemini Vision
- **Maps**: Leaflet + OpenStreetMap
- **Styling**: Tailwind CSS v4
- **Validation**: Zod
- **Icons**: lucide-react
