import { DEPARTMENTS } from '../lib/data';

export default function DeptGrid({ lang, activeDept, onSelect, allowedDepts }) {
  const depts = allowedDepts ? DEPARTMENTS.filter(d => allowedDepts.includes(d.key)) : DEPARTMENTS;
  return (
    <div className="dept-grid">
      {depts.map(d => (
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
