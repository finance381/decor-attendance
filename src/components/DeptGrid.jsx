import { DEPARTMENTS } from '../lib/data';

export default function DeptGrid({ lang, activeDept, onSelect }) {
  return (
    <div className="dept-grid">
      {DEPARTMENTS.map(d => (
        <button
          key={d.key}
          className={`dept-btn ${activeDept === d.key ? 'active' : ''}`}
          onClick={() => onSelect(d.key)}
        >
          {d.emoji}<br />{d[lang] || d.en}
        </button>
      ))}
    </div>
  );
}
