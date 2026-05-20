import { useState, useEffect } from 'react';
import { getComplianceData } from '../lib/training';
import { DEPARTMENTS, RANKS } from '../lib/data';
import { dateKey } from '../lib/i18n';

export default function ComplianceTab({ lang }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterDept, setFilterDept] = useState('all');
  const [date, setDate] = useState(dateKey());

  useEffect(() => { load(); }, [date, filterDept]);
  const load = async () => { setLoading(true); setData(await getComplianceData(date, filterDept)); setLoading(false); };

  // Group by worker
  const byWorker = {};
  for (const row of data) {
    const wid = row.worker_id;
    if (!byWorker[wid]) byWorker[wid] = { worker: row.workers, day_in: null, day_out: null, night: null };
    byWorker[wid][row.type] = row;
  }
  const rows = Object.values(byWorker);

  const totalWorkers = rows.length;
  const videoComplete = rows.filter(r => r.day_in?.video_completed).length;
  const avgScore = rows.filter(r => r.day_in?.quiz_score != null)
    .reduce((sum, r) => sum + r.day_in.quiz_score, 0) / (totalWorkers || 1);

  return (
    <div>
      <div className="admin-page-header">
        <h1>{lang === 'hi' ? '📋 कम्प्लायंस रिपोर्ट' : '📋 Compliance Report'}</h1>
      </div>

      <div className="admin-filters">
        <input type="date" className="admin-search" value={date} onChange={e => setDate(e.target.value)} />
        <select className="admin-filter-select" value={filterDept} onChange={e => setFilterDept(e.target.value)}>
          <option value="all">{lang === 'hi' ? 'सभी' : 'All Departments'}</option>
          {DEPARTMENTS.map(d => <option key={d.key} value={d.key}>{d.emoji} {d[lang] || d.en}</option>)}
        </select>
      </div>

      <div className="admin-stat-row" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="admin-stat-card">
          <div className="admin-stat-value">{totalWorkers}</div>
          <div className="admin-stat-label">{lang === 'hi' ? 'कुल पंच' : 'Total Punches'}</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-value" style={{ color: 'var(--present)' }}>{videoComplete}</div>
          <div className="admin-stat-label">{lang === 'hi' ? 'वीडियो पूरा' : 'Video Completed'}</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-value" style={{ color: 'var(--primary)' }}>{avgScore.toFixed(1)}</div>
          <div className="admin-stat-label">{lang === 'hi' ? 'औसत स्कोर' : 'Avg Quiz Score'}</div>
        </div>
      </div>

      {loading ? <p className="admin-loading">Loading...</p> : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>{lang === 'hi' ? 'वर्कर' : 'Worker'}</th>
              <th>{lang === 'hi' ? 'डिपार्टमेंट' : 'Dept'}</th>
              <th>🟢 {lang === 'hi' ? 'पंच इन' : 'Punch In'}</th>
              <th>{lang === 'hi' ? 'वीडियो' : 'Video'}</th>
              <th>{lang === 'hi' ? 'स्कोर (इन)' : 'Score (In)'}</th>
              <th>🔴 {lang === 'hi' ? 'पंच आउट' : 'Punch Out'}</th>
              <th>{lang === 'hi' ? 'स्कोर (आउट)' : 'Score (Out)'}</th>
              <th>🌙 {lang === 'hi' ? 'रात' : 'Night'}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const dept = DEPARTMENTS.find(d => d.key === r.worker?.department);
              const timeStr = (punch) => punch ? new Date(punch.punched_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—';
              return (
                <tr key={i}>
                  <td>
                    <div className="cell-name">
                      <span className={`rank-dot r${r.worker?.rank}`}></span>
                      {lang === 'hi' ? r.worker?.name_hi : r.worker?.name_en}
                    </div>
                  </td>
                  <td>{dept ? `${dept.emoji}` : '—'}</td>
                  <td>{timeStr(r.day_in)}</td>
                  <td>{r.day_in?.video_completed ? '✅' : r.day_in ? '❌' : '—'}</td>
                  <td>{r.day_in?.quiz_score != null ? `${r.day_in.quiz_score}/2` : '—'}</td>
                  <td>{timeStr(r.day_out)}</td>
                  <td>{r.day_out?.quiz_score != null ? `${r.day_out.quiz_score}/2` : '—'}</td>
                  <td>{r.night ? `✅ ${timeStr(r.night)}` : '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}