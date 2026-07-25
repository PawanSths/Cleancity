- `src/app` contains App Router pages, route handlers, auth callback, and protected admin UI.
- `src/lib/actions.ts` contains server actions for complaint creation, upvotes, assignment, and status updates.
- `src/lib/supabase` contains browser, server, and middleware Supabase clients.
- `src/app/api/analyze/route.ts` validates uploads, rate-limits requests, and calls OpenAI Vision.
- `supabase/schema.sql` contains PostgreSQL tables, indexes, triggers, RLS policies, Storage bucket policy, and Realtime publication.
- `supabase/seed.sql` contains starter anonymous complaint data.
- `docs/architecture.md` describes folder structure, auth flow, and data flow.

#To start the app
npm run dev





