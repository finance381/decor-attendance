import { useState } from 'react';

const SLIDES = {
  hi: [
    { icon: '📲', title: 'ऐप इंस्टॉल करें', desc: 'WhatsApp लिंक खोलें → "होम स्क्रीन पर जोड़ें" दबाएं → ऐप तैयार!' },
    { icon: '🔑', title: 'लॉगिन करें', desc: 'अपना मोबाइल नंबर और 4 अंकों का PIN डालें। पहली बार PIN: 0000' },
    { icon: '✅', title: 'हाज़िरी लगाएं', desc: 'पंच इन → ट्रेनिंग वीडियो देखें → क्विज़ दें → पंच आउट करें' },
  ],
  en: [
    { icon: '📲', title: 'Install the App', desc: 'Open WhatsApp link → Tap "Add to Home Screen" → App ready!' },
    { icon: '🔑', title: 'Login', desc: 'Enter your mobile number and 4-digit PIN. First time PIN: 0000' },
    { icon: '✅', title: 'Mark Attendance', desc: 'Punch In → Watch training video → Take quiz → Punch Out' },
  ],
};

export default function OnboardingCarousel({ lang, onClose }) {
  const [slide, setSlide] = useState(0);
  const slides = SLIDES[lang] || SLIDES.en;

  return (
    <div className="onboarding-overlay" onClick={onClose}>
      <div className="onboarding-card" onClick={e => e.stopPropagation()}>
        <button className="onboarding-close" onClick={onClose}>✕</button>

        <div className="onboarding-slide">
          <div className="onboarding-icon">{slides[slide].icon}</div>
          <h2 className="onboarding-title">{slides[slide].title}</h2>
          <p className="onboarding-desc">{slides[slide].desc}</p>
        </div>

        <div className="onboarding-dots">
          {slides.map((_, i) => (
            <span key={i} className={`onboarding-dot ${i === slide ? 'active' : ''}`} onClick={() => setSlide(i)} />
          ))}
        </div>

        <div className="onboarding-actions">
          {slide > 0 && (
            <button className="onboarding-btn secondary" onClick={() => setSlide(s => s - 1)}>
              {lang === 'hi' ? '← पीछे' : '← Back'}
            </button>
          )}
          {slide < slides.length - 1 ? (
            <button className="onboarding-btn primary" onClick={() => setSlide(s => s + 1)}>
              {lang === 'hi' ? 'आगे →' : 'Next →'}
            </button>
          ) : (
            <button className="onboarding-btn primary" onClick={onClose}>
              {lang === 'hi' ? 'शुरू करें 🚀' : 'Get Started 🚀'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}