import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://jsikrptqndvubcolrlkw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpzaWtycHRxbmR2dWJjb2xybGt3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxNTYzNDAsImV4cCI6MjA5NDczMjM0MH0.LxQidgZTK1qoyXRlZGZIGclirv5q5QVySCIkWPTgjT8';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function saveAttendance(deptKey, date, attendanceMap, approver) {
  const rows = Object.entries(attendanceMap)
    .filter(([_, a]) => a.day || a.night || a.absent)
    .map(([workerId, a]) => ({
      worker_id: workerId,
      date,
      day: !!a.day,
      night: !!a.night,
      absent: !!a.absent,
      approved_by: approver,
      approved_at: new Date().toISOString(),
    }));

  if (!rows.length) return { ok: false, error: 'Nothing to save' };

  const { error } = await supabase
    .from('attendance')
    .upsert(rows, { onConflict: 'worker_id,date' });

  if (error) {
    console.error('Save failed:', error);
    return { ok: false, error: error.message };
  }

  await supabase.from('audit_log').insert({
    action: 'save_attendance',
    performed_by: approver,
    details: { department: deptKey, date, count: rows.length }
  });

  return { ok: true };
}

export async function loadAttendance(workerIds, date) {
  if (!workerIds.length) return {};

  const { data, error } = await supabase
    .from('attendance')
    .select('worker_id, day, night, absent')
    .eq('date', date)
    .in('worker_id', workerIds);

  if (error || !data) return {};

  const map = {};
  for (const row of data) {
    map[row.worker_id] = { day: row.day, night: row.night, absent: row.absent };
  }
  return map;
}

export function subscribeAttendance(date, callback) {
  return supabase
    .channel(`attendance:${date}`)
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'attendance', filter: `date=eq.${date}` },
      callback
    )
    .subscribe();
}
