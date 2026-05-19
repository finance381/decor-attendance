import { t } from '../lib/i18n';

export default function SummaryCards({ lang, summary }) {
  const cards = [
    { key: 'total',   cls: 'total',   label: t('total', lang) },
    { key: 'day',     cls: 'day',     label: t('dayPresent', lang) },
    { key: 'night',   cls: 'night',   label: t('nightPresent', lang) },
    { key: 'absent',  cls: 'absent',  label: t('absent', lang) },
    { key: 'pending', cls: 'pending', label: t('pending', lang) },
  ];

  return (
    <div className="summary-row">
      {cards.map(c => (
        <div key={c.key} className={`summary-card ${c.cls}`}>
          <div className="num">{summary[c.key]}</div>
          <div className="label">{c.label}</div>
        </div>
      ))}
    </div>
  );
}
