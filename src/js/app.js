/**
 * AMBRIA Attendance — Main App
 * Phase 1A: Local-first with Supabase sync (plugged in Week 2)
 */

import { t, getLang, toggleLang, formatDate, dateKey } from './i18n.js';
import { DEPARTMENTS, RANKS, LIGHT_WORKERS, getAvailableApprovers, isNightShift } from './data.js';
import { saveAttendance, loadAttendance, subscribeAttendance } from './supabase.js';

// --- State ---
let activeDept = null;
let shiftOverride = null; // null = auto-detect, 'day' | 'night'
let attendance = {};       // { workerId: { day: bool, night: bool, absent: bool } }

// --- DOM Cache ---
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

// --- Init ---
document.addEventListener('DOMContentLoaded', () => {
  registerSW();
  render();
  startClock();

  // Re-render on language change
  document.addEventListener('lang-change', render);
});

// --- Service Worker ---
function registerSW() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
}

// --- Clock (update time every 30s, shift auto-detect every minute) ---
function startClock() {
  const update = () => {
    const dateBar = $('#date-bar');
    if (dateBar) dateBar.textContent = formatDate();

    // Auto-detect shift if no override
    if (!shiftOverride) {
      const night = isNightShift();
      document.body.dataset.shift = night ? 'night' : 'day';
    }
  };
  update();
  setInterval(update, 30000);
}

// ============================
//  RENDER
// ============================
function render() {
  const app = $('#app');
  const lang = getLang();

  app.innerHTML = `
    ${renderTopBar()}
    <div class="container">
      <div id="date-bar" class="date-bar">${formatDate()}</div>
      <div class="night-banner">${t('nightBanner')}</div>
      ${renderDeptGrid()}
      ${activeDept ? renderDeptView() : renderEmptyState()}
    </div>
    ${activeDept ? renderActionBar() : ''}
    <div class="toast" id="toast"></div>
  `;

  bindEvents();
}

// --- Top Bar ---
function renderTopBar() {
  const lang = getLang();
  const isNight = shiftOverride === 'night' || (!shiftOverride && isNightShift());
  return `
    <div class="top-bar">
      <h1>${t('appTitle')}</h1>
      <div class="top-bar-actions">
        <button class="toggle-btn ${isNight ? 'active' : ''}" id="shift-toggle">
          ${isNight ? t('nightShift') : t('dayShift')}
        </button>
        <button class="toggle-btn" id="lang-toggle">
          ${lang === 'hi' ? '🇬🇧 EN' : '🇮🇳 हिंदी'}
        </button>
      </div>
    </div>
  `;
}

// --- Department Grid ---
function renderDeptGrid() {
  const lang = getLang();
  return `
    <div class="dept-grid">
      ${DEPARTMENTS.map(d => `
        <button class="dept-btn ${activeDept === d.key ? 'active' : ''}" data-dept="${d.key}">
          ${d.emoji}<br>${d[lang] || d.en}
        </button>
      `).join('')}
    </div>
  `;
}

// --- Empty State ---
function renderEmptyState() {
  return `
    <div class="empty-state">
      <div class="icon">👆</div>
      <p>${getLang() === 'hi' ? 'ऊपर डिपार्टमेंट चुनें' : 'Select a department above'}</p>
    </div>
  `;
}

// --- Department View (Summary + Approver + Workers) ---
function renderDeptView() {
  // For now, only Light dept has workers
  const workers = activeDept === 'light' ? LIGHT_WORKERS : [];
  const summary = computeSummary(workers);

  return `
    ${renderSummary(summary)}
    ${renderApprover()}
    ${renderWorkerList(workers)}
  `;
}

// --- Summary Cards ---
function renderSummary(s) {
  return `
    <div class="summary-row">
      <div class="summary-card total"><div class="num">${s.total}</div><div class="label">${t('total')}</div></div>
      <div class="summary-card day"><div class="num">${s.day}</div><div class="label">${t('dayPresent')}</div></div>
      <div class="summary-card night"><div class="num">${s.night}</div><div class="label">${t('nightPresent')}</div></div>
      <div class="summary-card absent"><div class="num">${s.absent}</div><div class="label">${t('absent')}</div></div>
      <div class="summary-card pending"><div class="num">${s.pending}</div><div class="label">${t('pending')}</div></div>
    </div>
  `;
}

function computeSummary(workers) {
  let day = 0, night = 0, absent = 0, pending = 0;
  for (const w of workers) {
    const a = attendance[w.id];
    if (!a) { pending++; continue; }
    if (a.absent) { absent++; continue; }
    if (a.day) day++;
    if (a.night) night++;
    if (!a.day && !a.night) pending++;
  }
  return { total: workers.length, day, night, absent, pending };
}

// --- Approver Dropdown ---
function renderApprover() {
  const lang = getLang();
  const approvers = getAvailableApprovers();
  return `
    <div class="approver-section">
      <select class="approver-select" id="approver">
        <option value="">${t('selectApprover')}</option>
        ${approvers.map(a => `<option value="${a.id}">${a.label[lang] || a.label.en}</option>`).join('')}
      </select>
    </div>
  `;
}

// --- Worker List (grouped by rank) ---
function renderWorkerList(workers) {
  if (!workers.length) {
    return `<div class="empty-state"><div class="icon">🚧</div><p>${getLang() === 'hi' ? 'वर्कर जल्द जोड़े जाएँगे' : 'Workers coming soon'}</p></div>`;
  }

  const lang = getLang();
  const grouped = {};
  for (const w of workers) {
    (grouped[w.rank] = grouped[w.rank] || []).push(w);
  }

  let html = '';
  for (const rank of [1, 2, 3, 4]) {
    const group = grouped[rank];
    if (!group) continue;
    const r = RANKS[rank];
    html += `
      <div class="rank-group">
        <div class="rank-header r${rank}">${r.short} — ${r.label[lang] || r.label.en}</div>
        ${group.map(w => renderWorkerRow(w, lang)).join('')}
      </div>
    `;
  }
  return html;
}

function renderWorkerRow(w, lang) {
  const a = attendance[w.id] || {};
  const statusIcon = a.absent ? '❌' : (a.day && a.night ? '✅🌙' : a.day ? '✅' : a.night ? '🌙' : '⏳');

  return `
    <div class="worker-row" data-worker="${w.id}">
      <div class="worker-info">
        <div class="worker-name">${w.name[lang] || w.name.en}</div>
        <div class="worker-role">${w.role[lang] || w.role.en}</div>
      </div>
      <div class="worker-status">${statusIcon}</div>
      <div class="att-buttons">
        <button class="att-btn ${a.day ? 'day-on' : ''}" data-action="day" data-wid="${w.id}">✅</button>
        <button class="att-btn ${a.absent ? 'absent-on' : ''}" data-action="absent" data-wid="${w.id}">❌</button>
        <button class="att-btn ${a.night ? 'night-on' : ''}" data-action="night" data-wid="${w.id}">🌙</button>
      </div>
    </div>
  `;
}

// --- Action Bar ---
function renderActionBar() {
  return `
    <div class="action-bar">
      <button class="action-btn reset" id="btn-reset">${t('reset')}</button>
      <button class="action-btn save" id="btn-save">${t('save')}</button>
    </div>
  `;
}

// ============================
//  EVENTS
// ============================
function bindEvents() {
  // Language toggle
  const langBtn = $('#lang-toggle');
  if (langBtn) langBtn.addEventListener('click', toggleLang);

  // Shift toggle
  const shiftBtn = $('#shift-toggle');
  if (shiftBtn) shiftBtn.addEventListener('click', () => {
    if (shiftOverride === 'night') {
      shiftOverride = 'day';
      document.body.dataset.shift = 'day';
    } else {
      shiftOverride = 'night';
      document.body.dataset.shift = 'night';
    }
    render();
  });

  // Department selection
  $$('.dept-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      activeDept = btn.dataset.dept;
      attendance = {}; // Reset for new dept
      render();

      // Load today's attendance from Supabase
      const cloud = await loadAttendance(activeDept, dateKey());
      if (Object.keys(cloud).length > 0) {
        attendance = cloud;
        render();
      }

      // Subscribe to realtime changes
      subscribeAttendance(dateKey(), () => {
        loadAttendance(activeDept, dateKey()).then(fresh => {
          attendance = fresh;
          render();
        });
      });
    });
  });

  // Attendance 3-button toggles (event delegation)
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.att-btn');
    if (!btn) return;

    const wid = btn.dataset.wid;
    const action = btn.dataset.action;
    if (!wid || !action) return;

    if (!attendance[wid]) attendance[wid] = { day: false, night: false, absent: false };
    const a = attendance[wid];

    if (action === 'absent') {
      // Absent toggles off day + night
      a.absent = !a.absent;
      if (a.absent) { a.day = false; a.night = false; }
    } else if (action === 'day') {
      a.day = !a.day;
      if (a.day) a.absent = false;
    } else if (action === 'night') {
      a.night = !a.night;
      if (a.night) a.absent = false;
    }

    render();
  });

  // Save
  const saveBtn = $('#btn-save');
  if (saveBtn) saveBtn.addEventListener('click', handleSave);

  // Reset
  const resetBtn = $('#btn-reset');
  if (resetBtn) resetBtn.addEventListener('click', handleReset);
}

// --- Save ---
async function handleSave() {
  const approver = $('#approver')?.value;
  if (!approver) {
    showToast(t('noApprover'));
    return;
  }

  const marked = Object.values(attendance).some(a => a.day || a.night || a.absent);
  if (!marked) {
    showToast(t('noMarked'));
    return;
  }

  const workers = activeDept === 'light' ? LIGHT_WORKERS : [];
  const summary = computeSummary(workers);

  // Save to Supabase (falls back to localStorage if offline)
  const result = await saveAttendance(activeDept, dateKey(), attendance, approver);

  if (result.ok) {
    showToast(t('savedToast', { day: summary.day, night: summary.night, absent: summary.absent }));
  } else {
    // Offline fallback — save locally
    const key = `ambria_att_${activeDept}_${dateKey()}`;
    localStorage.setItem(key, JSON.stringify({ attendance, approver, savedAt: new Date().toISOString() }));
    showToast('⚡ Saved offline — will sync when online');
  }
}

// --- Reset ---
function handleReset() {
  const msg = t('resetConfirm');
  if (confirm(msg)) {
    attendance = {};
    render();
  }
}

// --- Toast ---
function showToast(msg) {
  const el = $('#toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 3000);
}
