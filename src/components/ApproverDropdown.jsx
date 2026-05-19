import { t } from '../lib/i18n';
import { getAvailableApprovers } from '../lib/data';

export default function ApproverDropdown({ lang, isNight, value, onChange }) {
  const approvers = getAvailableApprovers();

  return (
    <div className="approver-section">
      <select
        className="approver-select"
        value={value}
        onChange={e => onChange(e.target.value)}
      >
        <option value="">{t('selectApprover', lang)}</option>
        {approvers.map(a => (
          <option key={a.id} value={a.id}>
            {a.label[lang] || a.label.en}
          </option>
        ))}
      </select>
    </div>
  );
}
