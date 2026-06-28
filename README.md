# CleanCity

CleanCity is a production-minded civic issue reporting app built with Next.js 15, TypeScript, Tailwind CSS, shadcn-style UI components, Supabase, OpenStreetMap/Leaflet, OpenAI Vision, and Vercel.

## Architecture

- `src/app` contains App Router pages, route handlers, auth callback, and protected admin UI.
- `src/lib/actions.ts` contains server actions for complaint creation, upvotes, assignment, and status updates.
- `src/lib/supabase` contains browser, server, and middleware Supabase clients.
- `src/app/api/analyze/route.ts` validates uploads, rate-limits requests, and calls OpenAI Vision.
- `supabase/schema.sql` contains PostgreSQL tables, indexes, triggers, RLS policies, Storage bucket policy, and Realtime publication.
- `supabase/seed.sql` contains starter anonymous complaint data.
- `docs/architecture.md` describes folder structure, auth flow, and data flow.

## Environment Variables

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
OPENAI_API_KEY=sk-your-openai-key
OPENAI_VISION_MODEL=gpt-4o-mini
```

## Step-by-Step Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Supabase and OpenAI keys.

### 3. Apply the database schema (CRITICAL)

Open your [Supabase dashboard](https://supabase.com/dashboard) → **SQL Editor** → New query.
Paste the entire contents of `supabase/schema.sql` and click **Run**.

This creates all tables, security policies, triggers, and the storage bucket needed for image uploads.

### 4. (Optional) Add seed data

Run `supabase/seed.sql` in the SQL Editor to add sample anonymous complaints.

### 5. Start the dev server

```bash
npm run dev
```

**IMPORTANT**: You must restart the dev server (`Ctrl+C` then `npm run dev`) any time you change `.env.local`.

### 6. Create an admin user

1. Go to `http://localhost:3000/auth/login` and **enable email/password or Google auth** in your Supabase dashboard under **Authentication → Providers**.
2. Sign in through the app.
3. In Supabase SQL Editor, run:

```sql
update public.profiles
set role = 'admin'
where id = '<your-auth-user-id>';
```

Find your user ID in Supabase **Authentication → Users**.

4. Now you can access the admin dashboard at `/admin`.

### 7. Verify everything works

The **ServiceStatus** cards on the homepage show:
- **Supabase**: "connected and schema ready" (green)
- **OpenAI**: "gpt-4o-mini" (green)
- **Maps**: "OpenStreetMap, no card needed" (green)

If any show amber, the corresponding feature will use demo/mock data.

## How demo mode works

Without environment variables (or if the database schema isn't applied), the app gracefully falls back:
- **Supabase missing**: Mock complaints, no auth, no real submissions
- **OpenAI missing**: AI analysis returns a generic fallback result
- **Maps**: Always uses free OpenStreetMap tiles — no token required

## Admin dashboard

The admin dashboard at `/admin` provides:
- Live complaint feed with realtime updates
- Filter by area, category, severity, status
- Update complaint status (pending → in progress → resolved)
- Assign complaints to municipal staff
- Analytics: total, resolved %, average response time, hotspot heatmap
- Interactive map view

## Deployment

1. Push the repository to GitHub.
2. Import the project into Vercel.
3. Add all environment variables in Vercel Project Settings.
4. Add your production URL to Supabase Auth redirect URLs.
5. Deploy.

## Security Notes

- Row-level security is enabled for all application tables.
- Admin routes are protected by middleware and `profiles.role`.
- Uploads are limited to images under 8 MB in both API and server action paths.
- The OpenAI analysis endpoint includes a lightweight IP-based rate limit.
- Complaint images are stored in a dedicated public Supabase Storage bucket.
