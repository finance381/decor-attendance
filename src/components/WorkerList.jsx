import { memo } from 'react';
import { RANKS } from '../lib/data';

export default function WorkerList({ lang, workers, attendance, onToggle }) {
  if (!workers.length) {
    return (
      <div className="empty-state">
        <div className="icon">🚧</div>
        <p>{lang === 'hi' ? 'वर्कर जल्द जोड़े जाएँगे' : 'Workers coming soon'}</p>
      </div>
    );
  }

  const grouped = {};
  for (const w of workers) {
    (grouped[w.rank] = grouped[w.rank] || []).push(w);
  }

  return (
    <>
      {[1, 2, 3, 4].map(rank => {
        const group = grouped[rank];
        if (!group) return null;
        const r = RANKS[rank];
        return (
          <div key={rank} className="rank-group">
            <div className={`rank-header r${rank}`}>
              {r.short} — {r[lang] || r.en}
            </div>
            {group.map(w => (
              <WorkerRow
                key={w.id}
                worker={w}
                lang={lang}
                att={attendance[w.id] || {}}
                onToggle={onToggle}
              />
            ))}
          </div>
        );
      })}
    </>
  );
}

const WorkerRow = memo(function WorkerRow({ worker, lang, att, onToggle }) {
  const statusIcon = att.absent ? '❌'
    : (att.day && att.night) ? '✅🌙'
    : att.day ? '✅'
    : att.night ? '🌙'
    : '⏳';

  return (
    <div className="worker-row">
      <div className="worker-info">
        <div className="worker-name">{worker.name[lang] || worker.name.en}</div>
        <div className="worker-role">{worker.role[lang] || worker.role.en}</div>
      </div>
      <div className="worker-status">{statusIcon}</div>
      <div className="att-buttons">
        <button
          className={`att-btn ${att.day ? 'day-on' : ''}`}
          onClick={() => onToggle(worker.id, 'day')}
        >✅</button>
        <button
          className={`att-btn ${att.absent ? 'absent-on' : ''}`}
          onClick={() => onToggle(worker.id, 'absent')}
        >❌</button>
        <button
          className={`att-btn ${att.night ? 'night-on' : ''}`}
          onClick={() => onToggle(worker.id, 'night')}
        >🌙</button>
      </div>
    </div>
  );
});
