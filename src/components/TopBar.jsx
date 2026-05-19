import { t } from '../lib/i18n';

const LogoutIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const AdminIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.32 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

export default function TopBar({ lang, isNight, onToggleLang, onToggleShift, session, onLogout, onAdmin, onChangePin }) {
  const handleAdminClick = () => {
    const isMobile = window.matchMedia('(max-width: 767px)').matches;
    if (isMobile) {
      // Open in browser tab so admin gets full desktop width
      const url = new URL(window.location.href);
      url.searchParams.set('admin', '1');
      window.open(url.toString(), '_blank');
    } else {
      onAdmin();
    }
  };

  return (
    <div className="top-bar">
      <h1>{t('appTitle', lang)}</h1>
      <div className="top-bar-actions">
        {session?.is_admin && (
          <button className="toggle-btn" onClick={handleAdminClick} title="Admin"><AdminIcon /></button>
        )}
        <button className={`toggle-btn ${isNight ? 'active' : ''}`} onClick={onToggleShift}>
          {isNight ? t('nightShift', lang) : t('dayShift', lang)}
        </button>
        <button className="toggle-btn" onClick={onToggleLang}>
          {lang === 'hi' ? '🇬🇧 EN' : '🇮🇳 हिंदी'}
        </button>
        <button className="toggle-btn" onClick={onChangePin} title="Change PIN">🔑</button>
        <button className="toggle-btn" onClick={onLogout} title="Logout"><LogoutIcon /></button>
      </div>
    </div>
  );
}