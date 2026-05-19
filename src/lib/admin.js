import { supabase } from './supabase';
import { dateKey } from './i18n';

export async function getDepartmentSummaries(date = dateKey()) {
  const { data, error } = await supabase
    .from('attendance')
    .select('worker_id, day, night, absent, workers!inner(department)')
    .eq('date', date);

  if (error || !data) return [];

  const depts = {};
  for (const row of data) {
    const dept = row.workers?.department || 'unknown';
    if (!depts[dept]) depts[dept] = { department: dept, day: 0, night: 0, absent: 0, total: 0 };
    depts[dept].total++;
    if (row.day) depts[dept].day++;
    if (row.night) depts[dept].night++;
    if (row.absent) depts[dept].absent++;
  }

  return Object.values(depts);
}

export async function getTotalWorkerCounts() {
  const { data } = await supabase
    .from('workers')
    .select('department')
    .eq('status', 'active');

  if (!data) return {};
  const counts = {};
  for (const w of data) {
    counts[w.department] = (counts[w.department] || 0) + 1;
  }
  return counts;
}