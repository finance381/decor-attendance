import { useState, useEffect } from 'react';
import { getAllWorkers, createWorker, updateWorker, deleteWorker, resetWorkerPin } from '../lib/auth';
import { DEPARTMENTS, RANKS } from '../lib/data';

export default function AdminPanel({ lang, session, onClose }) {
  const [workers, setWorkers] = useState([]);
  const [filterDept, setFilterDept] = useState(session.department);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editWorker, setEditWorker] = useState(null);

  useEffect(() => { loadWorkers(); }, [filterDept]);

  const loadWorkers = async () => {
    setLoading(true);
    setWorkers(await getAllWorkers(filterDept));
    setLoading(false);
  };

  const handleDelete = async (w) => {
    const name = w.name_hi || w.name_en;
    if (!confirm(lang === 'hi' ? `${name} को हटाएं?` : `Deactivate ${name}?`)) return;
    await deleteWorker(w.id);
    loadWorkers();
  };

  const handleResetPin = async (w) => {
    const name = w.name_hi || w.name_en;
    if (!confirm(lang === 'hi' ? `${name} का PIN रीसेट करें (0000)?` : `Reset ${name}'s PIN to 0000?`)) return;
    await resetWorkerPin(w.id);
    alert(lang === 'hi' ? 'PIN रीसेट हो गया → 0000' : 'PIN reset to 0000');
  };

  const handleEdit = (w) => {
    setEditWorker(w);
    setShowForm(true);
  };

  const handleAdd = () => {
    setEditWorker(null);
    setShowForm(true);
  };

  return (
    <div className="admin-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="admin-panel">
        <div className="admin-header">
          <h2>{lang === 'hi' ? '👑 यूज़र मैनेजमेंट' : '👑 User Management'}</h2>
          <button className="toggle-btn" onClick={onClose}>✕</button>
        </div>

        {showForm ? (
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
              loadWorkers();
            }}
            onCancel={() => setShowForm(false)}
          />
        ) : (
          <>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <select className="approver-select" style={{ flex: 1 }}
                value={filterDept} onChange={e => setFilterDept(e.target.value)}>
                <option value="all">{lang === 'hi' ? 'सभी डिपार्टमेंट' : 'All Departments'}</option>
                {DEPARTMENTS.map(d => (
                  <option key={d.key} value={d.key}>{d.emoji} {d[lang] || d.en}</option>
                ))}
              </select>
              <button className="auth-btn primary" style={{ width: 'auto', padding: '10px 16px', margin: 0 }}
                onClick={handleAdd}>＋</button>
            </div>

            {loading ? (
              <p style={{ textAlign: 'center', padding: 20, color: 'var(--text-muted)' }}>Loading...</p>
            ) : (
              <>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>
                  {workers.filter(w => w.status === 'active').length} {lang === 'hi' ? 'एक्टिव वर्कर' : 'active workers'}
                </p>
                {workers.map(w => (
                  <div key={w.id} className="worker-row" style={{ opacity: w.status === 'inactive' ? 0.4 : 1 }}>
                    <div className="worker-info">
                      <div className="worker-name">
                        <span className={`rank-dot r${w.rank}`}></span>
                        {lang === 'hi' ? w.name_hi : w.name_en}
                      </div>
                      <div className="worker-role">
                        {w.mobile} • {RANKS[w.rank]?.[lang] || `R${w.rank}`}
                        {w.department && ` • ${DEPARTMENTS.find(d => d.key === w.department)?.[lang] || w.department}`}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="att-btn" onClick={() => handleEdit(w)} title="Edit">✏️</button>
                      <button className="att-btn" onClick={() => handleResetPin(w)} title="Reset PIN">🔑</button>
                      {w.status === 'active' && (
                        <button className="att-btn" onClick={() => handleDelete(w)} title="Deactivate">🚫</button>
                      )}
                    </div>
                  </div>
                ))}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function WorkerForm({ lang, worker, onSave, onCancel }) {
  const [form, setForm] = useState({
    name_hi: worker?.name_hi || '',
    name_en: worker?.name_en || '',
    mobile: worker?.mobile || '',
    department: worker?.department || '',
    rank: String(worker?.rank || 4),
    site: worker?.site || '',
    role_hi: worker?.role_hi || '',
    role_en: worker?.role_en || '',
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div>
      <h3 style={{ marginBottom: 16 }}>
        {worker ? (lang === 'hi' ? '✏️ एडिट वर्कर' : '✏️ Edit Worker') : (lang === 'hi' ? '＋ नया वर्कर' : '＋ New Worker')}
      </h3>

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
          onChange={e => set('mobile', e.target.value.replace(/\D/g, ''))}
          disabled={!!worker} />
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
        <input value={form.role_hi} onChange={e => set('role_hi', e.target.value)} placeholder="e.g. इंडोर साइट मेन" />
      </div>
      <div className="auth-field">
        <label>{lang === 'hi' ? 'रोल (English)' : 'Designation (English)'}</label>
        <input value={form.role_en} onChange={e => set('role_en', e.target.value)} placeholder="e.g. Indoor Site Main" />
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        <button className="auth-btn secondary" style={{ border: '1px solid var(--border)' }} onClick={onCancel}>
          {lang === 'hi' ? 'रद्द करें' : 'Cancel'}
        </button>
        <button className="auth-btn primary" onClick={() => onSave(worker ? {
          name_hi: form.name_hi, name_en: form.name_en, department: form.department,
          rank: parseInt(form.rank), site: form.site, role_hi: form.role_hi, role_en: form.role_en,
        } : form)}>
          {lang === 'hi' ? '💾 सेव' : '💾 Save'}
        </button>
      </div>

      {!worker && (
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 12, textAlign: 'center' }}>
          {lang === 'hi' ? 'डिफ़ॉल्ट PIN: 0000 — वर्कर बाद में बदल सकता है' : 'Default PIN: 0000 — worker can change later'}
        </p>
      )}
    </div>
  );
}