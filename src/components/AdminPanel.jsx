import { useState, useEffect } from 'react';
import { getAllWorkers, createWorker, updateWorker, deleteWorker, resetWorkerPin } from '../lib/auth';
import { getDepartmentSummaries, getTotalWorkerCounts } from '../lib/admin';
import TrainingTab from './TrainingTab';
import ComplianceTab from './ComplianceTab';
import OwnerDashboard from './OwnerDashboard';
import { DEPARTMENTS, RANKS } from '../lib/data';
import { dateKey, formatDate } from '../lib/i18n';

export default function AdminPanel({ lang, session, onClose }) {
  const [tab, setTab] = useState('overview');

  return (
    <div className="admin-dash">
      <div className="admin-sidebar">
        <div className="admin-logo">
          <h2>AMBRIA</h2>
          <span>{lang === 'hi' ? 'एडमिन डैश' : 'Admin Dash'}</span>
        </div>
        <nav className="admin-nav">
          <button className={`admin-nav-btn ${tab === 'overview' ? 'active' : ''}`}
            onClick={() => setTab('overview')}>
            <span className="nav-icon">📊</span>
            {lang === 'hi' ? 'ओवरव्यू' : 'Overview'}
          </button>
          <button className={`admin-nav-btn ${tab === 'training' ? 'active' : ''}`}
            onClick={() => setTab('training')}>
            <span className="nav-icon">🎬</span>
            {lang === 'hi' ? 'ट्रेनिंग' : 'Training'}
          </button>
          <button className={`admin-nav-btn ${tab === 'compliance' ? 'active' : ''}`}
            onClick={() => setTab('compliance')}>
            <span className="nav-icon">📋</span>
            {lang === 'hi' ? 'कम्प्लायंस' : 'Compliance'}
          </button>
          <button className={`admin-nav-btn ${tab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setTab('dashboard')}>
            <span className="nav-icon">📈</span>
            {lang === 'hi' ? 'ओनर डैश' : 'Owner Dash'}
          </button>
        </nav>
        <button className="admin-nav-btn admin-close-btn" onClick={onClose}>
          <span className="nav-icon">←</span>
          {lang === 'hi' ? 'वापस जाएं' : 'Back to App'}
        </button>
      </div>
      <div className="admin-content">
        {tab === 'overview' && <OverviewTab lang={lang} />}
        {tab === 'users' && <UsersTab lang={lang} session={session} />}
        {tab === 'training' && <TrainingTab lang={lang} session={session} />}
        {tab === 'compliance' && <ComplianceTab lang={lang} />}
        {tab === 'dashboard' && <OwnerDashboard lang={lang} />}
      </div>
    </div>
  );
}

/* ===== OVERVIEW TAB ===== */
function OverviewTab({ lang }) {
  const [summaries, setSummaries] = useState([]);
  const [workerCounts, setWorkerCounts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getDepartmentSummaries(), getTotalWorkerCounts()]).then(([s, c]) => {
      setSummaries(s);
      setWorkerCounts(c);
      setLoading(false);
    });
  }, []);

  const today = formatDate(lang);
  const totalWorkers = Object.values(workerCounts).reduce((a, b) => a + b, 0);
  const totalDay = summaries.reduce((a, s) => a + s.day, 0);
  const totalNight = summaries.reduce((a, s) => a + s.night, 0);
  const totalAbsent = summaries.reduce((a, s) => a + s.absent, 0);

  return (
    <div>
      <div className="admin-page-header">
        <h1>{lang === 'hi' ? '📊 आज का ओवरव्यू' : '📊 Today\'s Overview'}</h1>
        <p className="admin-date">{today}</p>
      </div>

      {loading ? <p className="admin-loading">Loading...</p> : (
        <>
          <div className="admin-stat-row">
            <StatCard label={lang === 'hi' ? 'कुल वर्कर' : 'Total Workers'} value={totalWorkers} color="var(--text)" />
            <StatCard label={lang === 'hi' ? 'दिन उपस्थित' : 'Day Present'} value={totalDay} color="var(--present)" />
            <StatCard label={lang === 'hi' ? 'रात उपस्थित' : 'Night Present'} value={totalNight} color="var(--night-color)" />
            <StatCard label={lang === 'hi' ? 'अनुपस्थित' : 'Absent'} value={totalAbsent} color="var(--absent)" />
          </div>

          <h2 className="admin-section-title">{lang === 'hi' ? 'डिपार्टमेंट वाइज़' : 'By Department'}</h2>
          <table className="admin-table">
            <thead>
              <tr>
                <th>{lang === 'hi' ? 'डिपार्टमेंट' : 'Department'}</th>
                <th>{lang === 'hi' ? 'कुल' : 'Total'}</th>
                <th>✅ {lang === 'hi' ? 'दिन' : 'Day'}</th>
                <th>🌙 {lang === 'hi' ? 'रात' : 'Night'}</th>
                <th>❌ {lang === 'hi' ? 'अनुपस्थित' : 'Absent'}</th>
                <th>⏳ {lang === 'hi' ? 'बाकी' : 'Pending'}</th>
              </tr>
            </thead>
            <tbody>
              {DEPARTMENTS.map(dept => {
                const s = summaries.find(x => x.department === dept.key) || { day: 0, night: 0, absent: 0, total: 0 };
                const total = workerCounts[dept.key] || 0;
                return (
                  <tr key={dept.key}>
                    <td><span className="dept-tag">{dept.emoji} {dept[lang] || dept.en}</span></td>
                    <td>{total}</td>
                    <td className="cell-day">{s.day}</td>
                    <td className="cell-night">{s.night}</td>
                    <td className="cell-absent">{s.absent}</td>
                    <td className="cell-pending">{s.absent > 0 ? s.absent : '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div className="admin-stat-card">
      <div className="admin-stat-value" style={{ color }}>{value}</div>
      <div className="admin-stat-label">{label}</div>
    </div>
  );
}

/* ===== USERS TAB ===== */
function UsersTab({ lang, session }) {
  const [workers, setWorkers] = useState([]);
  const [filterDept, setFilterDept] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editWorker, setEditWorker] = useState(null);

  useEffect(() => { loadWorkers(); }, [filterDept]);

  const loadWorkers = async () => {
    setLoading(true);
    setWorkers(await getAllWorkers(filterDept));
    setLoading(false);
  };

  const filtered = workers.filter(w => {
    if (!search) return true;
    const q = search.toLowerCase();
    return w.name_en?.toLowerCase().includes(q) || w.name_hi?.includes(q) || w.mobile?.includes(q);
  });

  const handleDelete = async (w) => {
    if (!confirm(lang === 'hi' ? `${w.name_hi} को हटाएं?` : `Deactivate ${w.name_en}?`)) return;
    await deleteWorker(w.id);
    loadWorkers();
  };

  const handleResetPin = async (w) => {
    if (!confirm(lang === 'hi' ? `${w.name_hi} का PIN रीसेट (0000)?` : `Reset ${w.name_en}'s PIN to 0000?`)) return;
    await resetWorkerPin(w.id);
    alert(lang === 'hi' ? 'PIN → 0000' : 'PIN reset to 0000');
  };

  if (showForm) {
    return (
      <div>
        <div className="admin-page-header">
          <h1>{editWorker ? (lang === 'hi' ? '✏️ एडिट वर्कर' : '✏️ Edit Worker') : (lang === 'hi' ? '＋ नया वर्कर' : '＋ New Worker')}</h1>
        </div>
        <WorkerForm
          lang={lang}
          worker={editWorker}
          onSave={async (data) => {
            if (editWorker) {
              await updateWorker(editWorker.id, data);
            } else {
              const result = await createWorker(data);
              if (!result.ok) { alert(result.error); return; }
            }
            setShowForm(false);
            setEditWorker(null);
            loadWorkers();
          }}
          onCancel={() => { setShowForm(false); setEditWorker(null); }}
        />
      </div>
    );
  }

  return (
    <div>
      <div className="admin-page-header">
        <h1>{lang === 'hi' ? '👥 यूज़र मैनेजमेंट' : '👥 User Management'}</h1>
        <button className="admin-add-btn" onClick={() => { setEditWorker(null); setShowForm(true); }}>
          ＋ {lang === 'hi' ? 'नया वर्कर' : 'New Worker'}
        </button>
      </div>

      <div className="admin-filters">
        <input className="admin-search" placeholder={lang === 'hi' ? '🔍 नाम या मोबाइल खोजें...' : '🔍 Search name or mobile...'}
          value={search} onChange={e => setSearch(e.target.value)} />
        <select className="admin-filter-select" value={filterDept} onChange={e => setFilterDept(e.target.value)}>
          <option value="all">{lang === 'hi' ? 'सभी डिपार्टमेंट' : 'All Departments'}</option>
          {DEPARTMENTS.map(d => <option key={d.key} value={d.key}>{d.emoji} {d[lang] || d.en}</option>)}
        </select>
      </div>

      <p className="admin-count">
        {filtered.filter(w => w.status === 'active').length} {lang === 'hi' ? 'एक्टिव' : 'active'} / {filtered.length} {lang === 'hi' ? 'कुल' : 'total'}
      </p>

      {loading ? <p className="admin-loading">Loading...</p> : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>{lang === 'hi' ? 'नाम' : 'Name'}</th>
              <th>{lang === 'hi' ? 'मोबाइल' : 'Mobile'}</th>
              <th>{lang === 'hi' ? 'डिपार्टमेंट' : 'Department'}</th>
              <th>{lang === 'hi' ? 'रैंक' : 'Rank'}</th>
              <th>{lang === 'hi' ? 'रोल' : 'Designation'}</th>
              <th>{lang === 'hi' ? 'स्टेटस' : 'Status'}</th>
              <th>{lang === 'hi' ? 'एक्शन' : 'Actions'}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(w => {
              const dept = DEPARTMENTS.find(d => d.key === w.department);
              return (
                <tr key={w.id} className={w.status === 'inactive' ? 'row-inactive' : ''}>
                  <td>
                    <div className="cell-name">
                      <span className={`rank-dot r${w.rank}`}></span>
                      <div>
                        <div>{lang === 'hi' ? w.name_hi : w.name_en}</div>
                        <div className="cell-sub">{lang === 'hi' ? w.name_en : w.name_hi}</div>
                      </div>
                    </div>
                  </td>
                  <td className="cell-mono">{w.mobile || '—'}</td>
                  <td>{dept ? `${dept.emoji} ${dept[lang] || dept.en}` : '—'}</td>
                  <td><span className={`rank-badge r${w.rank}`}>{RANKS[w.rank]?.short || `R${w.rank}`}</span></td>
                  <td>{(lang === 'hi' ? w.role_hi : w.role_en) || '—'}</td>
                  <td><span className={`status-badge ${w.status}`}>{w.status}</span></td>
                  <td>
                    <div className="action-btns">
                      <button className="tbl-btn" onClick={() => { setEditWorker(w); setShowForm(true); }} title="Edit">✏️</button>
                      <button className="tbl-btn" onClick={() => handleResetPin(w)} title="Reset PIN">🔑</button>
                      {w.status === 'active' && (
                        <button className="tbl-btn danger" onClick={() => handleDelete(w)} title="Deactivate">🚫</button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

/* ===== WORKER FORM ===== */
function WorkerForm({ lang, worker, onSave, onCancel }) {
  const [form, setForm] = useState({
    name_hi: worker?.name_hi || '', name_en: worker?.name_en || '',
    mobile: worker?.mobile || '', department: worker?.department || '',
    rank: String(worker?.rank || 4), site: worker?.site || '',
    role_hi: worker?.role_hi || '', role_en: worker?.role_en || '',
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="admin-form">
      <div className="admin-form-grid">
        <div className="auth-field">
          <label>{lang === 'hi' ? 'नाम (हिंदी)' : 'Name (Hindi)'}</label>
          <input value={form.name_hi} onChange={e => set('name_hi', e.target.value)} />
        </div>
        <div className="auth-field">
          <label>{lang === 'hi' ? 'नाम (English)' : 'Name (English)'}</label>
          <input value={form.name_en} onChange={e => set('name_en', e.target.value)} />
        </div>
        <div className="auth-field">
          <label>{lang === 'hi' ? 'मोबाइल' : 'Mobile'}</label>
          <input type="tel" inputMode="numeric" maxLength={10} value={form.mobile}
            onChange={e => set('mobile', e.target.value.replace(/\D/g, ''))} disabled={!!worker} />
        </div>
        <div className="auth-field">
          <label>{lang === 'hi' ? 'डिपार्टमेंट' : 'Department'}</label>
          <select value={form.department} onChange={e => set('department', e.target.value)}>
            <option value="">— Select —</option>
            {DEPARTMENTS.map(d => <option key={d.key} value={d.key}>{d.emoji} {d[lang] || d.en}</option>)}
          </select>
        </div>
        <div className="auth-field">
          <label>{lang === 'hi' ? 'रैंक' : 'Rank'}</label>
          <select value={form.rank} onChange={e => set('rank', e.target.value)}>
            <option value="1">R1 — {lang === 'hi' ? 'डिपार्टमेंट हेड' : 'Dept Head'}</option>
            <option value="2">R2 — {lang === 'hi' ? 'स्टॉक कीपर' : 'Stock Keeper'}</option>
            <option value="3">R3 — {lang === 'hi' ? 'साइट मेन' : 'Site Main'}</option>
            <option value="4">R4 — {lang === 'hi' ? 'हेल्पर' : 'Helper'}</option>
          </select>
        </div>
        <div className="auth-field">
          <label>{lang === 'hi' ? 'रोल (हिंदी)' : 'Designation (Hindi)'}</label>
          <input value={form.role_hi} onChange={e => set('role_hi', e.target.value)} />
        </div>
        <div className="auth-field">
          <label>{lang === 'hi' ? 'रोल (English)' : 'Designation (English)'}</label>
          <input value={form.role_en} onChange={e => set('role_en', e.target.value)} />
        </div>
      </div>

      <div className="admin-form-actions">
        <button className="auth-btn secondary" style={{ border: '1px solid var(--border)', maxWidth: 200 }} onClick={onCancel}>
          {lang === 'hi' ? 'रद्द करें' : 'Cancel'}
        </button>
        <button className="auth-btn primary" style={{ maxWidth: 200 }} onClick={() => onSave(worker ? {
          name_hi: form.name_hi, name_en: form.name_en, department: form.department,
          rank: parseInt(form.rank), site: form.site, role_hi: form.role_hi, role_en: form.role_en,
        } : form)}>
          {lang === 'hi' ? '💾 सेव' : '💾 Save'}
        </button>
      </div>

      {!worker && (
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 16 }}>
          {lang === 'hi' ? 'डिफ़ॉल्ट PIN: 0000' : 'Default PIN: 0000'}
        </p>
      )}
    </div>
  );
}