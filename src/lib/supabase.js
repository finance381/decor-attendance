import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://jsikrptqndvubcolrlkw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpzaWtycHRxbmR2dWJjb2xybGt3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxNTYzNDAsImV4cCI6MjA5NDczMjM0MH0.LxQidgZTK1qoyXRlZGZIGclirv5q5QVySCIkWPTgjT8';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Legacy saveAttendance removed — all saves now go through punch_log via training.js

export async function loadAttendance(workerIds, date) {
  if (!workerIds.length) return {};

  const { data, error } = await supabase
    .from('punch_log')
    .select('worker_id, type')
    .eq('date', date)
    .in('worker_id', workerIds);

  if (error || !data) return {};

  const map = {};
  for (const row of data) {
    if (!map[row.worker_id]) map[row.worker_id] = { day: false, night: false, absent: false };
    if (row.type === 'day_in') map[row.worker_id].day = true;
    if (row.type === 'night') map[row.worker_id].night = true;
  }
  return map;
}

export function subscribeAttendance(date, callback) {
  return supabase
    .channel(`punch_log:${date}`)
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'punch_log', filter: `date=eq.${date}` },
      callback
    )
    .subscribe();
}
