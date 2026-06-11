import { supabase } from './supabase';

const EMAIL_DOMAIN = '@ambria.app';

function toEmail(mobile) {
  return mobile.replace(/\D/g, '') + EMAIL_DOMAIN;
}

// --- Session ---

export function getSession() {
  try {
    return JSON.parse(localStorage.getItem('ambria_session'));
  } catch { return null; }
}

export function clearSession() {
  localStorage.removeItem('ambria_session');
}

function saveSession(worker) {
  localStorage.setItem('ambria_session', JSON.stringify({
    id: worker.id,
    name_hi: worker.name_hi,
    name_en: worker.name_en,
    department: worker.department,
    rank: worker.rank,
    site: worker.site,
    status: worker.status,
    mobile: worker.mobile,
    is_admin: worker.is_admin,
    auth_uid: worker.auth_uid,
  }));
}

// --- Login ---

export async function login(mobile, pin) {
  const email = toEmail(mobile);

  // Sign in with Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password: pin,
  });

  if (authError) {
    if (authError.message.includes('Invalid login')) {
      return { ok: false, error: 'Wrong mobile or PIN' };
    }
    return { ok: false, error: authError.message };
  }

  // Fetch worker profile
  const { data: worker, error: workerError } = await supabase
    .from('workers')
    .select('*')
    .eq('auth_uid', authData.user.id)
    .single();

  if (workerError || !worker) {
    // Auth user exists but no worker profile
    await supabase.auth.signOut();
    return { ok: false, error: 'Account not set up. Contact admin.' };
  }

  if (worker.status === 'inactive') {
    await supabase.auth.signOut();
    return { ok: false, error: 'Account deactivated' };
  }

  saveSession(worker);
  return { ok: true, worker };
}

// --- Logout ---

export async function logout() {
  await supabase.auth.signOut();
  clearSession();
}

// --- Change PIN (logged-in user) ---

export async function changePin(currentPin, newPin) {
  // Verify current session
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { ok: false, error: 'Not logged in' };

  // Verify current PIN by re-signing in
  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email: session.user.email,
    password: currentPin,
  });

  if (verifyError) return { ok: false, error: 'Current PIN is wrong' };

  // Update password
  const { error } = await supabase.auth.updateUser({ password: newPin });
  if (error) return { ok: false, error: error.message };

  return { ok: true };
}

// --- Admin: User Management ---

export async function getAllWorkers(department) {
  const query = supabase.from('workers').select('*').order('rank').order('name_en');
  if (department && department !== 'all') query.eq('department', department);
  const { data } = await query;
  return data || [];
}

export async function createWorker({ name_hi, name_en, mobile, department, rank, site, role_hi, role_en }) {
  const id = 'w_' + mobile.replace(/\D/g, '').slice(-10);
  const email = toEmail(mobile);

  // Create auth user via DB function
  const { data: uidData, error: uidError } = await supabase.rpc('admin_create_user', {
    user_email: email,
    user_password: '0000',
  });

  if (uidError) {
    if (uidError.message.includes('duplicate') || uidError.message.includes('unique')) {
      return { ok: false, error: 'Mobile number already registered' };
    }
    return { ok: false, error: uidError.message };
  }

  const auth_uid = uidData;

  // Insert worker profile
  const { error } = await supabase.from('workers').insert({
    id, name_hi, name_en, mobile, department,
    rank: parseInt(rank), site: site || null,
    role_hi: role_hi || '', role_en: role_en || '',
    pin_hash: '', status: 'active', auth_uid,
    failed_attempts: 0, is_admin: false,
  });

  if (error) {
    // Rollback: delete auth user
    await supabase.rpc('admin_delete_auth_user', { target_auth_uid: auth_uid });
    return { ok: false, error: error.message };
  }

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
  // Get worker's auth_uid
  const { data: worker } = await supabase.from('workers').select('auth_uid').eq('id', id).single();
  if (!worker?.auth_uid) return false;

  // Reset via DB function
  const { error } = await supabase.rpc('admin_reset_pin', {
    target_auth_uid: worker.auth_uid,
    new_pin: '0000',
  });

  return !error;
}