import { supabase } from './supabase';
import { dateKey } from './i18n';

// Get the active training assignment for a worker
export async function getAssignment(workerId, department, type) {
  // 1. Check worker-specific
  const { data: userAssign } = await supabase
    .from('training_assignments')
    .select('*')
    .eq('worker_id', workerId)
    .eq('type', type)
    .eq('is_active', true)
    .limit(1)
    .single();

  if (userAssign) return userAssign;

  // 2. Fallback to department-wide
  const { data: deptAssign } = await supabase
    .from('training_assignments')
    .select('*')
    .eq('department', department)
    .is('worker_id', null)
    .eq('type', type)
    .eq('is_active', true)
    .limit(1)
    .single();

  return deptAssign || null;
}

// Get today's punch status for a worker
export async function getPunchStatus(workerId, date = dateKey()) {
  const { data } = await supabase
    .from('punch_log')
    .select('type, punched_at, quiz_score, video_completed')
    .eq('worker_id', workerId)
    .eq('date', date);

  const status = { day_in: null, day_out: null, night: null };
  for (const row of (data || [])) {
    status[row.type] = row;
  }
  return status;
}

// Record a punch
export async function recordPunch({ workerId, type, assignmentId, quizAnswers, quizScore, videoCompleted, approvedBy }) {
  const { error } = await supabase.from('punch_log').upsert({
    worker_id: workerId,
    date: dateKey(),
    type,
    assignment_id: assignmentId || null,
    quiz_answers: quizAnswers || null,
    quiz_score: quizScore ?? null,
    video_completed: videoCompleted || false,
    approved_by: approvedBy || null,
    punched_at: new Date().toISOString(),
  }, { onConflict: 'worker_id,date,type' });

  return !error;
}

// Night shift bulk save (approver flow)
export async function saveNightAttendance(attendanceMap, approver) {
  const rows = Object.entries(attendanceMap)
    .filter(([_, a]) => a.night)
    .map(([workerId]) => ({
      worker_id: workerId,
      date: dateKey(),
      type: 'night',
      approved_by: approver,
      punched_at: new Date().toISOString(),
    }));

  if (!rows.length) return { ok: false };
  const { error } = await supabase.from('punch_log').upsert(rows, { onConflict: 'worker_id,date,type' });
  return { ok: !error };
}

// Admin: get all assignments
export async function getAssignments(department) {
  const query = supabase.from('training_assignments').select('*').order('created_at', { ascending: false });
  if (department && department !== 'all') query.eq('department', department);
  const { data } = await query;
  return data || [];
}

// Admin: create/update assignment (deactivates old one of same scope+type)
export async function saveAssignment({ id, youtube_url, title, department, worker_id, type, assigned_by, questions }) {
  // Deactivate existing active assignment of same scope + type
  if (!id) {
    const deactivateQuery = supabase
      .from('training_assignments')
      .update({ is_active: false })
      .eq('type', type)
      .eq('is_active', true);

    if (worker_id) {
      deactivateQuery.eq('worker_id', worker_id);
    } else if (department) {
      deactivateQuery.eq('department', department).is('worker_id', null);
    }
    await deactivateQuery;
  }

  if (id) {
    const { error } = await supabase.from('training_assignments')
      .update({ youtube_url, title, department, worker_id, type, questions }).eq('id', id);
    return !error;
  } else {
    const { error } = await supabase.from('training_assignments')
      .insert({ youtube_url, title, department, worker_id, type, assigned_by, questions });
    return !error;
  }
}

export async function deactivateAssignment(id) {
  const { error } = await supabase.from('training_assignments').update({ is_active: false }).eq('id', id);
  return !error;
}

// Admin: compliance data
export async function getComplianceData(date = dateKey(), department) {
  let query = supabase
    .from('punch_log')
    .select('*, workers!inner(name_hi, name_en, department, rank)')
    .eq('date', date);

  if (department && department !== 'all') {
    query = query.eq('workers.department', department);
  }

  const { data } = await query;
  return data || [];
}