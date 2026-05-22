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
// Owner Dashboard: attendance data for a date range, grouped by department
export async function getAttendanceRange(startDate, endDate) {
  const { data, error } = await supabase
    .from('punch_log')
    .select('worker_id, type, workers!inner(department)')
    .gte('date', startDate)
    .lte('date', endDate);

  if (error || !data) return [];

  const depts = {};
  for (const row of data) {
    const dept = row.workers?.department || 'unknown';
    if (!depts[dept]) depts[dept] = { department: dept, day: 0, night: 0 };
    if (row.type === 'day_in') depts[dept].day++;
    if (row.type === 'night') depts[dept].night++;
  }
  return Object.values(depts);
}

// Owner Dashboard: daily trend data for line chart
export async function getDailyTrend(startDate, endDate) {
  const totalCounts = await getTotalWorkerCounts();
  const totalWorkers = Object.values(totalCounts).reduce((a, b) => a + b, 0);

  const { data, error } = await supabase
    .from('punch_log')
    .select('date, worker_id, type')
    .gte('date', startDate)
    .lte('date', endDate);

  if (error || !data) return [];

  const byDate = {};
  for (const row of data) {
    if (!byDate[row.date]) byDate[row.date] = { date: row.date, day: 0, night: 0, _workers: new Set() };
    if (row.type === 'day_in') byDate[row.date].day++;
    if (row.type === 'night') byDate[row.date].night++;
    byDate[row.date]._workers.add(row.worker_id);
  }

  // Fill missing dates and calculate absent
  const result = [];
  const d = new Date(startDate);
  const end = new Date(endDate);
  while (d <= end) {
    const key = d.toISOString().slice(0, 10);
    const entry = byDate[key] || { date: key, day: 0, night: 0, _workers: new Set() };
    result.push({ date: key, day: entry.day, night: entry.night, absent: totalWorkers - entry._workers.size });
    d.setDate(d.getDate() + 1);
  }
  return result;
}

// Owner Dashboard: workers who didn't punch in during the date range
export async function getAbsentWorkers(startDate, endDate) {
  const [allWorkers, punchData] = await Promise.all([
    supabase.from('workers').select('id, name_hi, name_en, department, rank').eq('status', 'active'),
    supabase.from('punch_log').select('worker_id, date').gte('date', startDate).lte('date', endDate),
  ]);

  if (!allWorkers.data) return [];

  // Count total possible days
  const d = new Date(startDate);
  const end = new Date(endDate);
  let totalDays = 0;
  while (d <= end) { totalDays++; d.setDate(d.getDate() + 1); }

  // Count days each worker punched
  const punchedDays = {};
  for (const row of (punchData.data || [])) {
    if (!punchedDays[row.worker_id]) punchedDays[row.worker_id] = new Set();
    punchedDays[row.worker_id].add(row.date);
  }

  // Find workers with missing days
  return allWorkers.data
    .map(w => ({
      ...w,
      absentDays: totalDays - (punchedDays[w.id]?.size || 0),
    }))
    .filter(w => w.absentDays > 0)
    .sort((a, b) => b.absentDays - a.absentDays);
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