# Ratong Gemini Tutor

Deployed Supabase Edge Function: `ratong-gemini-tutor`.

Required Edge Function secret: `GEMINI_API_KEY`.
Optional secret: `GEMINI_MODEL` (defaults to `gemini-3.8-flash`).

The Gemini API key is read only by the Edge Function. Never place it in the public website source. The function requires a valid Supabase user JWT, checks `public.profiles.account_status`, and consumes per-user daily quota through `public.ai_tutor_consume_quota`.

Set secrets in Supabase Dashboard → Edge Functions → Secrets. Supabase makes newly set secrets available to deployed functions without redeployment.
