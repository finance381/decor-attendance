import { useState, useEffect } from 'react';
import { getAssignment, getPunchStatus, recordPunch } from '../lib/training';
import VideoPlayer from './VideoPlayer';
import QuizView from './QuizView';

export default function PunchScreen({ lang, session }) {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState('home'); // home | video | quiz | done
  const [punchType, setPunchType] = useState(null); // day_in | day_out
  const [assignment, setAssignment] = useState(null);

  useEffect(() => { loadStatus(); }, []);

  const loadStatus = async () => {
    setLoading(true);
    try {
      const s = await getPunchStatus(session.id);
      setStatus(s);
    } catch {
      // Offline — use empty status, let worker punch (will queue)
      setStatus({ day_in: null, day_out: null, night: null });
    }
    setLoading(false);
  };

  const startPunch = async (type) => {
    setPunchType(type);
    const assignType = type === 'day_in' ? 'punch_in' : 'punch_out';
    const a = await getAssignment(session.id, session.department, assignType);
    setAssignment(a);

    if (a) {
      setStep('video');
    } else {
      // No training assigned — punch directly
      await recordPunch({ workerId: session.id, type });
      await loadStatus();
      setStep('home');
    }
  };

  const handleVideoComplete = () => {
    if (assignment?.questions?.length > 0) {
      setStep('quiz');
    } else {
      // No quiz — record punch with video only
      finishPunch(null, null);
    }
  };

  const finishPunch = async (quizAnswers, quizScore) => {
    setStep('done');
    await recordPunch({
      workerId: session.id,
      type: punchType,
      assignmentId: assignment?.id,
      quizAnswers,
      quizScore,
      videoCompleted: true,
    });
    await loadStatus();
    setTimeout(() => setStep('home'), 2000);
  };

  if (loading) return <div className="punch-loading">{lang === 'hi' ? '⏳ लोड हो रहा है...' : '⏳ Loading...'}</div>;

  if (step === 'video' && assignment) {
    return (
      <div className="punch-flow">
        <h2 className="punch-flow-title">{assignment.title || (lang === 'hi' ? 'ट्रेनिंग वीडियो' : 'Training Video')}</h2>
        <VideoPlayer youtubeUrl={assignment.youtube_url} onComplete={handleVideoComplete} lang={lang} />
      </div>
    );
  }

  if (step === 'quiz' && assignment?.questions?.length > 0) {
    return (
      <div className="punch-flow">
        <QuizView questions={assignment.questions} lang={lang}
          onSubmit={(answers, score) => finishPunch(answers, score)} />
      </div>
    );
  }

  if (step === 'done') {
    const offlineMsg = !navigator.onLine;
    return (
      <div className="punch-flow">
        <div className="punch-success">
          <div style={{ fontSize: 64 }}>{offlineMsg ? '📡' : '✅'}</div>
          <h2>{offlineMsg
            ? (lang === 'hi' ? 'पंच सेव हुआ — ऑनलाइन होने पर सिंक होगा' : 'Punch saved — will sync when online')
            : (lang === 'hi' ? 'पंच रिकॉर्ड हो गया!' : 'Punch recorded!')
          }</h2>
        </div>
      </div>
    );
  }

  // Home
  const hasPunchedIn = !!status?.day_in;
  const hasPunchedOut = !!status?.day_out;
  const name = lang === 'hi' ? session.name_hi : session.name_en;

  return (
    <div className="punch-home">
      <div className="punch-greeting">
        <h2>☀️ {lang === 'hi' ? `नमस्ते, ${name}` : `Hello, ${name}`}</h2>
      </div>

      <div className="punch-status-card">
        <div className="punch-status-row">
          <span>{lang === 'hi' ? 'पंच इन' : 'Punch In'}</span>
          <span>{hasPunchedIn ? `✅ ${new Date(status.day_in.punched_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}` : '⏳'}</span>
        </div>
        <div className="punch-status-row">
          <span>{lang === 'hi' ? 'पंच आउट' : 'Punch Out'}</span>
          <span>{hasPunchedOut ? `✅ ${new Date(status.day_out.punched_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}` : '⏳'}</span>
        </div>
        {hasPunchedIn && status.day_in.quiz_score !== null && (
          <div className="punch-status-row">
            <span>{lang === 'hi' ? 'क्विज़ स्कोर' : 'Quiz Score'}</span>
            <span>{status.day_in.quiz_score}/2</span>
          </div>
        )}
      </div>

      {!hasPunchedIn && (
        <button className="punch-btn punch-in" onClick={() => startPunch('day_in')}>
          🟢 {lang === 'hi' ? 'पंच इन करें' : 'PUNCH IN'}
        </button>
      )}

      {hasPunchedIn && !hasPunchedOut && (
        <button className="punch-btn punch-out" onClick={() => startPunch('day_out')}>
          🔴 {lang === 'hi' ? 'पंच आउट करें' : 'PUNCH OUT'}
        </button>
      )}

      {hasPunchedIn && hasPunchedOut && (
        <p className="punch-done-msg">
          {lang === 'hi' ? '✅ आज की हाज़िरी पूरी हो गई' : '✅ Today\'s attendance complete'}
        </p>
      )}
    </div>
  );
}