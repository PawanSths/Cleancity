-- Create real users through Supabase Auth first, then promote them:
-- update public.profiles set role = 'admin' where id = '<auth-user-id>';
-- update public.profiles set role = 'staff', area = 'Thamel' where id = '<auth-user-id>';

insert into public.complaints (
  id, user_id, title, description, category, status, severity,
  latitude, longitude, address, area, image_url, ai_summary,
  ai_confidence, ai_spam_score, assigned_to, upvote_count, is_anonymous,
  created_at, resolved_at
)
values
  (
    '10000000-0000-0000-0000-000000000001',
    null,
    'Overflowing roadside garbage',
    'Garbage bags have piled up beside the market lane for three days.',
    'garbage',
    'pending',
    'high',
    27.7168,
    85.3121,
    'Thamel Marg',
    'Thamel',
    'https://images.unsplash.com/photo-1605600659908-0ef719419d41?q=80&w=1200&auto=format&fit=crop',
    'Large garbage accumulation near a public walking corridor.',
    0.91,
    0.04,
    null,
    38,
    true,
    now() - interval '6 hours',
    null
  ),
  (
    '10000000-0000-0000-0000-000000000002',
    null,
    'Broken drain cover',
    'Open drain beside a bus stop is dangerous during evening rush.',
    'drainage',
    'in_progress',
    'critical',
    27.6789,
    85.3187,
    'Pulchowk Road',
    'Patan',
    'https://images.unsplash.com/photo-1578662996442-48f60103fc96?q=80&w=1200&auto=format&fit=crop',
    'Uncovered drainage hazard in a high foot-traffic area.',
    0.87,
    0.08,
    null,
    64,
    true,
    now() - interval '30 hours',
    null
  )
on conflict (id) do nothing;
