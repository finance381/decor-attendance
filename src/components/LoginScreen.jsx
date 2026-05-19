import { useState } from 'react';
import { t } from '../lib/i18n';

export default function LoginScreen({ lang, onLogin }) {
  const [mobile, setMobile] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (mobile.length < 10) return setError(lang === 'hi' ? '10 अंक का मोबाइल नंबर डालें' : 'Enter 10-digit mobile number');
    if (pin.length !== 4) return setError(lang === 'hi' ? '4 अंक का PIN डालें' : 'Enter 4-digit PIN');
    setLoading(true);
    setError('');
    const result = await onLogin(mobile, pin);
    setLoading(false);
    if (!result.ok) setError(result.error);
  };

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <h1 className="auth-title">AMBRIA हाज़िरी</h1>
        <p className="auth-subtitle">{t('login', lang)}</p>

        <div className="auth-field">
          <label>{t('mobile', lang)}</label>
          <input type="tel" inputMode="numeric" maxLength={10} placeholder="9876543210"
            value={mobile} onChange={e => setMobile(e.target.value.replace(/\D/g, ''))} />
        </div>

        <div className="auth-field">
          <label>{t('pin', lang)}</label>
          <input type="password" inputMode="numeric" maxLength={4} placeholder="••••"
            value={pin} onChange={e => setPin(e.target.value.replace(/\D/g, ''))} />
        </div>

        {error && <div className="auth-error">{error}</div>}

        <button className="auth-btn primary" onClick={handleSubmit} disabled={loading}>
          {loading ? '...' : t('login', lang)}
        </button>

        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, marginTop: 12 }}>
          {lang === 'hi' ? 'PIN नहीं पता? अपने डिपार्टमेंट हेड से बात करें' : "Don't know your PIN? Contact your Department Head"}
        </p>
      </div>
    </div>
  );
}