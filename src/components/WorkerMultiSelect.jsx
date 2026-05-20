import { useState, useRef, useEffect } from 'react';

export default function WorkerMultiSelect({ workers, selected, onChange, lang }) {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = workers.filter(w => {
    if (selected.includes(w.id)) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return w.name_en?.toLowerCase().includes(q)
      || w.name_hi?.includes(q)
      || w.mobile?.includes(q)
      || w.department?.toLowerCase().includes(q)
      || w.role_en?.toLowerCase().includes(q);
  });

  const toggle = (id) => {
    onChange(selected.includes(id) ? selected.filter(x => x !== id) : [...selected, id]);
  };

  const remove = (id) => onChange(selected.filter(x => x !== id));

  const selectedWorkers = selected.map(id => workers.find(w => w.id === id)).filter(Boolean);

  return (
    <div className="multi-select" ref={ref}>
      <div className="multi-select-box" onClick={() => setOpen(true)}>
        {selectedWorkers.length === 0 && (
          <span className="multi-select-placeholder">
            {lang === 'hi' ? 'वर्कर खोजें और चुनें...' : 'Search and select workers...'}
          </span>
        )}
        <div className="multi-select-tags">
          {selectedWorkers.map(w => (
            <span key={w.id} className="multi-select-tag">
              {w.name_en}
              <button className="multi-select-tag-x" onClick={(e) => { e.stopPropagation(); remove(w.id); }}>×</button>
            </span>
          ))}
        </div>
        <input
          className="multi-select-input"
          value={search}
          onChange={e => { setSearch(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder={selectedWorkers.length > 0 ? (lang === 'hi' ? 'और जोड़ें...' : 'Add more...') : ''}
        />
      </div>

      {open && (
        <div className="multi-select-dropdown">
          {filtered.length === 0 ? (
            <div className="multi-select-empty">
              {lang === 'hi' ? 'कोई वर्कर नहीं मिला' : 'No workers found'}
            </div>
          ) : (
            filtered.slice(0, 20).map(w => (
              <button key={w.id} className="multi-select-option" onClick={() => { toggle(w.id); setSearch(''); }}>
                <div className="multi-select-option-main">
                  <span className={`rank-dot r${w.rank}`}></span>
                  <strong>{lang === 'hi' ? w.name_hi : w.name_en}</strong>
                </div>
                <div className="multi-select-option-sub">
                  {w.mobile} · {w.department} · {w.role_en || `R${w.rank}`}
                </div>
              </button>
            ))
          )}
          {filtered.length > 20 && (
            <div className="multi-select-empty">
              {lang === 'hi' ? `और ${filtered.length - 20} वर्कर — खोजें` : `${filtered.length - 20} more — type to search`}
            </div>
          )}
        </div>
      )}
    </div>
  );
}