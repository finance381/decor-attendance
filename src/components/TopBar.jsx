import { t } from '../lib/i18n';

export default function TopBar({ lang, isNight, onToggleLang, onToggleShift, session, onLogout, onAdmin }) {
  return (
    <div className="top-bar">
      <h1>{t('appTitle', lang)}</h1>
      <div className="top-bar-actions">
        {session?.rank <= 2 && (
          <button className="toggle-btn" onClick={onAdmin}>👑</button>
        )}
        <button className={`toggle-btn ${isNight ? 'active' : ''}`} onClick={onToggleShift}>
          {isNight ? t('nightShift', lang) : t('dayShift', lang)}
        </button>
        <button className="toggle-btn" onClick={onToggleLang}>
          {lang === 'hi' ? '🇬🇧 EN' : '🇮🇳 हिंदी'}
        </button>
        <button className="toggle-btn" onClick={onLogout}>🚪</button>
      </div>
    </div>
  );
}