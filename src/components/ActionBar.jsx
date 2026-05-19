import { t } from '../lib/i18n';

export default function ActionBar({ lang, onSave, onReset }) {
  return (
    <div className="action-bar">
      <button className="action-btn reset" onClick={onReset}>{t('reset', lang)}</button>
      <button className="action-btn save" onClick={onSave}>{t('save', lang)}</button>
    </div>
  );
}
