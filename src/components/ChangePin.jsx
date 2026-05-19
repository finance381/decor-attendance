import { useState } from 'react';
import { changePin } from '../lib/auth';

export default function ChangePin({ lang, session, onClose }) {
  const [current, setCurrent] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async () => {
    if (current.length !== 4) return setError(lang === 'hi' ? 'मौजूदा PIN डालें' : 'Enter current PIN');
    if (newPin.length !== 4) return setError(lang === 'hi' ? 'नया 4 अंक PIN डालें' : 'Enter new 4-digit PIN');
    if (newPin !== confirm) return setError(lang === 'hi' ? 'PIN मैच नहीं हुआ' : 'PINs do not match');
    if (newPin === current) return setError(lang === 'hi' ? 'नया PIN अलग होना चाहिए' : 'New PIN must be different');

    setLoading(true);
    setError('');
    const result = await changePin(session.id, current, newPin);
    setLoading(false);

    if (result.ok) setDone(true);
    else setError(result.error);
  };

  if (done) {
    return (
      <div className="admin-overlay" onClick={onClose}>
        <div className="admin-panel" onClick={e => e.stopPropagation()}>
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <div style={{ fontSize: 48 }}>✅</div>
            <p style={{ marginTop: 12, fontWeight: 600 }}>
              {lang === 'hi' ? 'PIN बदल गया!' : 'PIN changed!'}
            </p>
            <button className="auth-btn primary" style={{ marginTop: 16, maxWidth: 200 }} onClick={onClose}>
              {lang === 'hi' ? 'बंद करें' : 'Close'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-overlay" onClick={onClose}>
      <div className="admin-panel" onClick={e => e.stopPropagation()}>
        <div className="admin-header">
          <h2>{lang === 'hi' ? '🔑 PIN बदलें' : '🔑 Change PIN'}</h2>
          <button className="toggle-btn" onClick={onClose}>✕</button>
        </div>

        <div className="auth-field">
          <label>{lang === 'hi' ? 'मौजूदा PIN' : 'Current PIN'}</label>
          <input type="password" inputMode="numeric" maxLength={4} placeholder="••••"
            value={current} onChange={e => setCurrent(e.target.value.replace(/\D/g, ''))} />
        </div>
        <div className="auth-field">
          <label>{lang === 'hi' ? 'नया PIN' : 'New PIN'}</label>
          <input type="password" inputMode="numeric" maxLength={4} placeholder="••••"
            value={newPin} onChange={e => setNewPin(e.target.value.replace(/\D/g, ''))} />
        </div>
        <div className="auth-field">
          <label>{lang === 'hi' ? 'नया PIN दोबारा' : 'Confirm New PIN'}</label>
          <input type="password" inputMode="numeric" maxLength={4} placeholder="••••"
            value={confirm} onChange={e => setConfirm(e.target.value.replace(/\D/g, ''))} />
        </div>

        {error && <div className="auth-error">{error}</div>}

        <button className="auth-btn primary" onClick={handleSubmit} disabled={loading}>
          {loading ? '...' : (lang === 'hi' ? '💾 PIN बदलें' : '💾 Change PIN')}
        </button>
      </div>
    </div>
  );
}