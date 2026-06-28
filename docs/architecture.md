# CleanCity Architecture

## Product Surface

CleanCity has two primary experiences:

1. Public citizen app: authentication, anonymous or signed reports, AI-assisted image triage, map discovery, complaint details, status tracking, and upvotes.
2. Municipality dashboard: protected admin/staff access, live complaint feed, filtering, assignment, status updates, analytics, and hotspot heatmap.

## System Design

- Next.js 15 App Router handles server-rendered pages, server actions, API routes, and middleware route protection.
- Supabase Auth supports magic-link email and Google OAuth.
- Supabase PostgreSQL stores complaints, profiles, upvotes, assignments, and complaint events.
- Supabase Storage stores complaint images in the `complaint-photos` bucket.
- Supabase Realtime broadcasts complaint changes to the admin dashboard.
- OpenStreetMap tiles rendered with Leaflet provide public and admin issue maps without a paid token.
- OpenAI Vision analysis runs through `/api/analyze`, returning category, severity, summary, confidence, and spam risk.
- Vercel hosts the Next.js app and serverless API routes.

## Folder Structure

```text
src/app                 App Router pages, API routes, auth callbacks
src/components/admin    Admin dashboard, metrics, filters
src/components/auth     Login and OAuth UI
src/components/complaints Citizen complaint UI and tracking
src/components/maps     OpenStreetMap/Leaflet map rendering
src/components/ui       shadcn-style primitives
src/lib                 Actions, data access, env, Supabase clients, AI helpers
src/types               Shared TypeScript domain types
supabase                Schema and seed SQL
docs                    Architecture and setup notes
```

## Authentication Flow

1. Citizen opens `/auth/login`.
2. Email magic link or Google OAuth redirects through Supabase.
3. Supabase returns to `/auth/callback`, where the code is exchanged for a session.
4. Middleware refreshes sessions and protects `/admin`.
5. Admin/staff authorization is determined from `profiles.role`.
6. Anonymous complaints can be submitted without a user session when `is_anonymous` is true.

## Data Flow

1. Citizen selects an image on `/report`.
2. The browser posts the image to `/api/analyze`.
3. OpenAI returns structured triage metadata.
4. The server action validates form data and image constraints.
5. The image is uploaded to Supabase Storage.
6. The complaint row is inserted into PostgreSQL.
7. Supabase Realtime notifies admin clients.
8. Staff assign and update status through server actions.
