import { useState } from 'react';

function isIOSSafari() {
  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone;
  return isIOS && !isStandalone;
}

export default function IOSInstallBanner({ lang }) {
  const [dismissed, setDismissed] = useState(() => {
    const ts = localStorage.getItem('ambria-ios-banner-dismissed');
    if (!ts) return false;
    // Show again after 7 days
    return Date.now() - parseInt(ts) < 7 * 24 * 60 * 60 * 1000;
  });

  if (!isIOSSafari() || dismissed) return null;

  const handleDismiss = () => {
    localStorage.setItem('ambria-ios-banner-dismissed', String(Date.now()));
    setDismissed(true);
  };

  return (
    <div className="ios-banner">
      <button className="ios-banner-close" onClick={handleDismiss}>✕</button>
      <p>
        {lang === 'hi'
          ? '📲 ऐप इंस्टॉल करें: Share बटन (⬆️) → "Add to Home Screen" दबाएं'
          : '📲 Install app: Tap Share (⬆️) → "Add to Home Screen"'
        }
      </p>
    </div>
  );
}