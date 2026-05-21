import { useState } from 'react';

const SLIDES = {
  hi: [
    { icon: '👋', title: 'AMBRIA हाज़िरी में स्वागत है', desc: 'यह ऐप आपकी रोज़ाना हाज़िरी, ट्रेनिंग वीडियो और क्विज़ के लिए है।' },
    { icon: '🔑', title: 'लॉगिन करें', desc: 'अपना मोबाइल नंबर और 4 अंकों का PIN डालें। पहली बार PIN: 0000' },
    { icon: '✅', title: 'हाज़िरी लगाएं', desc: 'सुबह पंच इन करें → वीडियो देखें → क्विज़ दें → शाम को पंच आउट करें' },
  ],
  en: [
    { icon: '👋', title: 'Welcome to AMBRIA Attendance', desc: 'This app is for your daily attendance, training videos, and quizzes.' },
    { icon: '🔑', title: 'Login', desc: 'Enter your mobile number and 4-digit PIN. First time PIN: 0000' },
    { icon: '✅', title: 'Mark Attendance', desc: 'Punch In in the morning → Watch video → Take quiz → Punch Out in the evening' },
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