import { supabase } from './supabase';
import { dateKey } from './i18n';

export async function getDepartmentSummaries(date = dateKey()) {
  // Get punch_log data for the date
  const { data, error } = await supabase
    .from('punch_log')
    .select('worker_id, type, workers!inner(department)')
    .eq('date', date);

  if (error || !data) return [];

  // Get total active workers per department for absent/pending calculation
  const totalCounts = await getTotalWorkerCounts();

  // Collect unique workers and their punch types per department
  const depts = {};
  for (const row of data) {
    const dept = row.workers?.department || 'unknown';
    if (!depts[dept]) depts[dept] = { department: dept, day: 0, night: 0, absent: 0, total: 0, _workers: new Set() };
    depts[dept]._workers.add(row.worker_id);
    if (row.type === 'day_in') depts[dept].day++;
    if (row.type === 'night') depts[dept].night++;
  }

  // Calculate totals and absent (total active - punched workers)
  for (const dept of Object.values(depts)) {
    dept.total = totalCounts[dept.department] || 0;
    dept.absent = dept.total - dept._workers.size;
    if (dept.absent < 0) dept.absent = 0;
    delete dept._workers;
  }

  // Add departments with zero punches (all absent)
  for (const [deptKey, count] of Object.entries(totalCounts)) {
    if (!depts[deptKey]) {
      depts[deptKey] = { department: deptKey, day: 0, night: 0, absent: count, total: count };
    }
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