import { supabase } from './supabase';
import bcrypt from 'bcryptjs';

const SESSION_KEY = 'ambria_session';
const DEFAULT_PIN = '0000';

export function getSession() {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY)); }
  catch { return null; }
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

function saveSession(worker) {
  localStorage.setItem(SESSION_KEY, JSON.stringify({
    id: worker.id, name_hi: worker.name_hi, name_en: worker.name_en,
    department: worker.department, rank: worker.rank, site: worker.site,
    status: worker.status, mobile: worker.mobile,
  }));
}

export async function login(mobile, pin) {
  const { data: worker, error } = await supabase
    .from('workers').select('*').eq('mobile', mobile).single();

  if (error || !worker) return { ok: false, error: 'Mobile number not found' };
  if (worker.status === 'inactive') return { ok: false, error: 'Account deactivated' };

  if (worker.locked_until && new Date(worker.locked_until) > new Date()) {
    const mins = Math.ceil((new Date(worker.locked_until) - new Date()) / 60000);
    return { ok: false, error: `Locked. Try after ${mins} min` };
  }

  const match = await bcrypt.compare(pin, worker.pin_hash);
  if (!match) {
    const attempts = (worker.failed_attempts || 0) + 1;
    const updates = { failed_attempts: attempts };
    if (attempts >= 5) {
      updates.locked_until = new Date(Date.now() + 15 * 60000).toISOString();
      updates.failed_attempts = 0;
    }
    await supabase.from('workers').update(updates).eq('id', worker.id);
    return { ok: false, error: attempts >= 5 ? 'Too many attempts. Locked 15 min' : `Wrong PIN (${attempts}/5)` };
  }

  await supabase.from('workers').update({ failed_attempts: 0, locked_until: null }).eq('id', worker.id);
  await supabase.auth.signInAnonymously();
  saveSession(worker);
  return { ok: true, worker };
}

// --- Admin: User Management ---

export async function getDefaultPinHash() {
  return await bcrypt.hash(DEFAULT_PIN, 10);
}

export async function getAllWorkers(department) {
  const query = supabase.from('workers').select('*').order('rank').order('name_en');
  if (department && department !== 'all') query.eq('department', department);
  const { data } = await query;
  return data || [];
}

export async function createWorker({ name_hi, name_en, mobile, department, rank, site, role_hi, role_en }) {
  const id = 'w_' + mobile.replace(/\D/g, '').slice(-10);
  const pin_hash = await getDefaultPinHash();

  const { error } = await supabase.from('workers').insert({
    id, name_hi, name_en, mobile, department,
    rank: parseInt(rank), site: site || null,
    role_hi: role_hi || '', role_en: role_en || '',
    pin_hash, status: 'active', failed_attempts: 0,
  });

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function updateWorker(id, updates) {
  const { error } = await supabase.from('workers').update(updates).eq('id', id);
  return !error;
}

export async function deleteWorker(id) {
  const { error } = await supabase.from('workers').update({ status: 'inactive' }).eq('id', id);
  return !error;
}

export async function resetWorkerPin(id) {
  const pin_hash = await getDefaultPinHash();
  const { error } = await supabase.from('workers')
    .update({ pin_hash, failed_attempts: 0, locked_until: null }).eq('id', id);
  return !error;
}