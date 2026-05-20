import { useState, useEffect } from 'react';
import { getAssignments, saveAssignment, deactivateAssignment } from '../lib/training';
import { getAllWorkers } from '../lib/auth';
import WorkerMultiSelect from './WorkerMultiSelect';
import { DEPARTMENTS } from '../lib/data';

export default function TrainingTab({ lang, session }) {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [filterDept, setFilterDept] = useState('all');

  useEffect(() => { load(); }, [filterDept]);
  const load = async () => { setLoading(true); setAssignments(await getAssignments(filterDept)); setLoading(false); };

  const handleDeactivate = async (a) => {
    if (!confirm(lang === 'hi' ? 'इसे बंद करें?' : 'Deactivate this?')) return;
    await deactivateAssignment(a.id);
    load();
  };

  if (showForm) {
    return <AssignmentForm lang={lang} session={session} item={editItem}
      onSave={async (data) => { if (data) await saveAssignment(data); setShowForm(false); setEditItem(null); load(); }}
      onCancel={() => { setShowForm(false); setEditItem(null); }} />;
  }

  return (
    <div>
      <div className="admin-page-header">
        <h1>{lang === 'hi' ? '🎬 ट्रेनिंग मैनेजमेंट' : '🎬 Training Management'}</h1>
        <button className="admin-add-btn" onClick={() => { setEditItem(null); setShowForm(true); }}>
          ＋ {lang === 'hi' ? 'नया असाइनमेंट' : 'New Assignment'}
        </button>
      </div>

      <div className="admin-filters">
        <select className="admin-filter-select" value={filterDept} onChange={e => setFilterDept(e.target.value)}>
          <option value="all">{lang === 'hi' ? 'सभी डिपार्टमेंट' : 'All Departments'}</option>
          {DEPARTMENTS.map(d => <option key={d.key} value={d.key}>{d.emoji} {d[lang] || d.en}</option>)}
        </select>
      </div>

      {loading ? <p className="admin-loading">Loading...</p> : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>{lang === 'hi' ? 'टाइटल' : 'Title'}</th>
              <th>{lang === 'hi' ? 'टाइप' : 'Type'}</th>
              <th>{lang === 'hi' ? 'स्कोप' : 'Scope'}</th>
              <th>{lang === 'hi' ? 'प्रश्न' : 'Questions'}</th>
              <th>{lang === 'hi' ? 'स्टेटस' : 'Status'}</th>
              <th>{lang === 'hi' ? 'एक्शन' : 'Actions'}</th>
            </tr>
          </thead>
          <tbody>
            {assignments.map(a => {
              const dept = DEPARTMENTS.find(d => d.key === a.department);
              return (
                <tr key={a.id} className={a.is_active ? '' : 'row-inactive'}>
                  <td><strong>{a.title}</strong><br /><span className="cell-sub">{a.youtube_url}</span></td>
                  <td>{a.type === 'punch_in' ? '🟢 Punch In' : '🔴 Punch Out'}</td>
                  <td>{a.worker_id ? `👤 ${a.worker_id}` : dept ? `${dept.emoji} ${dept[lang] || dept.en}` : '—'}</td>
                  <td>{a.questions?.length || 0}</td>
                  <td><span className={`status-badge ${a.is_active ? 'active' : 'inactive'}`}>{a.is_active ? 'Active' : 'Inactive'}</span></td>
                  <td>
                    <div className="action-btns">
                      <button className="tbl-btn" onClick={() => { setEditItem(a); setShowForm(true); }}>✏️</button>
                      {a.is_active && <button className="tbl-btn danger" onClick={() => handleDeactivate(a)}>🚫</button>}
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

function AssignmentForm({ lang, session, item, onSave, onCancel }) {
  const [form, setForm] = useState({
    youtube_url: item?.youtube_url || '',
    title: item?.title || '',
    department: item?.department || '',
    worker_ids: item?.worker_id ? [item.worker_id] : [],
    type: item?.type || 'punch_in',
    questions: item?.questions || [
      { question: '', options: ['', '', ''], correct_index: 0 },
      { question: '', options: ['', '', ''], correct_index: 0 },
    ],
  });
  const [workers, setWorkers] = useState([]);

  useEffect(() => { getAllWorkers('all').then(setWorkers); }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const updateQuestion = (qi, field, value) => {
    setForm(f => {
      const qs = [...f.questions];
      qs[qi] = { ...qs[qi], [field]: value };
      return { ...f, questions: qs };
    });
  };

  const updateOption = (qi, oi, value) => {
    setForm(f => {
      const qs = [...f.questions];
      const opts = [...qs[qi].options];
      opts[oi] = value;
      qs[qi] = { ...qs[qi], options: opts };
      return { ...f, questions: qs };
    });
  };

  const addQuestion = () => {
    setForm(f => ({ ...f, questions: [...f.questions, { question: '', options: ['', '', ''], correct_index: 0 }] }));
  };

  const removeQuestion = (qi) => {
    setForm(f => ({ ...f, questions: f.questions.filter((_, i) => i !== qi) }));
  };

  const handleSave = async () => {
    const questions = form.questions.filter(q => q.question.trim());
    const base = {
      youtube_url: form.youtube_url,
      title: form.title,
      department: form.department || null,
      type: form.type,
      assigned_by: session.id,
      questions,
    };

    if (form.worker_ids.length > 0) {
      for (const wid of form.worker_ids) {
        await saveAssignment({ ...base, worker_id: wid });
      }
      onSave(null); // signal done
    } else {
      onSave({ ...base, id: item?.id || undefined, worker_id: null });
    }
  };

  return (
    <div>
      <div className="admin-page-header">
        <h1>{item ? (lang === 'hi' ? '✏️ एडिट' : '✏️ Edit') : (lang === 'hi' ? '＋ नया असाइनमेंट' : '＋ New Assignment')}</h1>
      </div>

      <div className="admin-form" style={{ maxWidth: 800 }}>
        <div className="admin-form-grid">
          <div className="auth-field">
            <label>{lang === 'hi' ? 'वीडियो टाइटल' : 'Video Title'}</label>
            <input value={form.title} onChange={e => set('title', e.target.value)} placeholder="Safety training day 1" />
          </div>
          <div className="auth-field">
            <label>YouTube URL</label>
            <input value={form.youtube_url} onChange={e => set('youtube_url', e.target.value)} placeholder="https://youtu.be/..." />
          </div>
          <div className="auth-field">
            <label>{lang === 'hi' ? 'टाइप' : 'Type'}</label>
            <select value={form.type} onChange={e => set('type', e.target.value)}>
              <option value="punch_in">🟢 Punch In</option>
              <option value="punch_out">🔴 Punch Out</option>
            </select>
          </div>
          <div className="auth-field">
            <label>{lang === 'hi' ? 'डिपार्टमेंट' : 'Department'} ({lang === 'hi' ? 'पूरे डिपार्टमेंट के लिए' : 'for whole dept'})</label>
            <select value={form.department} onChange={e => set('department', e.target.value)}>
              <option value="">— {lang === 'hi' ? 'कोई नहीं' : 'None'} —</option>
              {DEPARTMENTS.map(d => <option key={d.key} value={d.key}>{d.emoji} {d[lang] || d.en}</option>)}
            </select>
          </div>
          <div className="auth-field" style={{ gridColumn: '1 / -1' }}>
            <label>
              {lang === 'hi' ? 'स्पेसिफ़िक वर्कर' : 'Specific Workers'}
              <span style={{ fontWeight: 400, color: 'var(--text-muted)', marginLeft: 6 }}>
                ({lang === 'hi' ? 'ऑप्शनल — डिपार्टमेंट को ओवरराइड करेगा' : 'optional — overrides dept assignment'})
              </span>
            </label>
            <WorkerMultiSelect
              workers={workers.filter(w => w.status === 'active')}
              selected={form.worker_ids}
              onChange={ids => set('worker_ids', ids)}
              lang={lang}
            />
          </div>
        </div>

        <h3 style={{ margin: '24px 0 12px', fontSize: 16 }}>
          {lang === 'hi' ? '📝 क्विज़ प्रश्न' : '📝 Quiz Questions'}
        </h3>

        {form.questions.map((q, qi) => (
          <div key={qi} className="quiz-builder-q">
            <div className="quiz-builder-header">
              <strong>Q{qi + 1}</strong>
              {form.questions.length > 1 && (
                <button className="tbl-btn danger" onClick={() => removeQuestion(qi)}>✕</button>
              )}
            </div>
            <div className="auth-field">
              <input placeholder={lang === 'hi' ? 'प्रश्न लिखें...' : 'Enter question...'} value={q.question}
                onChange={e => updateQuestion(qi, 'question', e.target.value)} />
            </div>
            {q.options.map((opt, oi) => (
              <div key={oi} className="quiz-builder-option">
                <input type="radio" name={`correct_${qi}`} checked={q.correct_index === oi}
                  onChange={() => updateQuestion(qi, 'correct_index', oi)} />
                <input className="quiz-builder-option-input" placeholder={`Option ${oi + 1}`} value={opt}
                  onChange={e => updateOption(qi, oi, e.target.value)} />
              </div>
            ))}
            <button className="tbl-btn" style={{ marginTop: 4, fontSize: 12 }}
              onClick={() => { const opts = [...q.options, '']; updateQuestion(qi, 'options', opts); }}>
              + {lang === 'hi' ? 'ऑप्शन जोड़ें' : 'Add option'}
            </button>
          </div>
        ))}

        <button className="tbl-btn" style={{ marginTop: 12 }} onClick={addQuestion}>
          + {lang === 'hi' ? 'प्रश्न जोड़ें' : 'Add question'}
        </button>

        <div className="admin-form-actions">
          <button className="auth-btn secondary" style={{ border: '1px solid var(--border)', maxWidth: 200 }} onClick={onCancel}>
            {lang === 'hi' ? 'रद्द करें' : 'Cancel'}
          </button>
          <button className="auth-btn primary" style={{ maxWidth: 200 }} onClick={handleSave}>
            {lang === 'hi' ? '💾 सेव' : '💾 Save'}
          </button>
        </div>
      </div>
    </div>
  );
}