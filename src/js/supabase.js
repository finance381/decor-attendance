/**
 * AMBRIA Supabase Client
 *
 * Plugged in during Week 2.
 * For now, app runs on localStorage only.
 *
 * Setup:
 * 1. Create Supabase project (ap-south-1 / Mumbai)
 * 2. Copy URL + anon key below
 * 3. These are PUBLIC (anon key is safe for client-side)
 *    — real security is enforced via Row Level Security (RLS)
 */

// TODO: Replace with real values from Supabase dashboard
const SUPABASE_URL = '__SUPABASE_URL__';
const SUPABASE_ANON_KEY = '__SUPABASE_ANON_KEY__';

let supabase = null;

export async function getSupabase() {
  if (supabase) return supabase;

  // Don't init if placeholder values
  if (SUPABASE_URL.startsWith('__')) {
    console.warn('⚠️ Supabase not configured — running in local-only mode');
    return null;
  }

  const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return supabase;
}
