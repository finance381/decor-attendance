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
const SUPABASE_URL = 'https://jsikrptqndvubcolrlkw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpzaWtycHRxbmR2dWJjb2xybGt3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxNTYzNDAsImV4cCI6MjA5NDczMjM0MH0.LxQidgZTK1qoyXRlZGZIGclirv5q5QVySCIkWPTgjT8';

let supabase = null;

export async function getSupabase() {
  if (supabase) return supabase;

  const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return supabase;
}

// Save attendance for a department + date
export async function saveAttendance(deptKey, date, attendanceMap, approver) {
  const db = await getSupabase();
  if (!db) return { ok: false, error: 'No database connection' };

  const rows = Object.entries(attendanceMap).map(([workerId, a]) => ({
    worker_id: workerId,
    date: date,
    day: !!a.day,
    night: !!a.night,
    absent: !!a.absent,
    approved_by: approver,
    approved_at: new Date().toISOString(),
    site: a.site || null
  }));

  const { error } = await db
    .from('attendance')
    .upsert(rows, { onConflict: 'worker_id,date' });

  if (error) {
    console.error('Save failed:', error);
    return { ok: false, error: error.message };
  }

  // Audit log
  await db.from('audit_log').insert({
    action: 'save_attendance',
    performed_by: approver,
    details: { department: deptKey, date, count: rows.length }
  });

  return { ok: true };
}

// Load attendance for a department + date
export async function loadAttendance(deptKey, date) {
  const db = await getSupabase();
  if (!db) return {};

  const { data, error } = await db
    .from('attendance')
    .select('worker_id, day, night, absent, approved_by')
    .eq('date', date)
    .in('worker_id', await getWorkerIds(deptKey));

  if (error || !data) return {};

  const map = {};
  for (const row of data) {
    map[row.worker_id] = { day: row.day, night: row.night, absent: row.absent };
  }
  return map;
}

// Get worker IDs for a department
async function getWorkerIds(deptKey) {
  const db = await getSupabase();
  const { data } = await db
    .from('workers')
    .select('id')
    .eq('department', deptKey);
  return data ? data.map(w => w.id) : [];
}

// Subscribe to realtime attendance changes for a date
export function subscribeAttendance(date, callback) {
  getSupabase().then(db => {
    if (!db) return;
    db.channel(`attendance:${date}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'attendance', filter: `date=eq.${date}` },
        (payload) => callback(payload)
      )
      .subscribe();
  });
}
