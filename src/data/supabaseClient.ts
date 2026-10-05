import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

/** True when the Supabase env vars are configured (so the UI can show a setup hint otherwise). */
export const hasSupabase = Boolean(url && anonKey)

// Falls back to harmless placeholders if env is missing, so the app still loads and can
// show a friendly "configure Supabase" message instead of crashing.
export const supabase = createClient(url ?? 'http://localhost', anonKey ?? 'public-anon-key')
