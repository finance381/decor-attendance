import { useState, useEffect, useCallback, useRef } from 'react';
import { t, formatDate, dateKey } from './lib/i18n';
import { DEPARTMENTS, LIGHT_WORKERS, isNightShift } from './lib/data';
import { saveAttendance, loadAttendance, subscribeAttendance } from './lib/supabase';
import { saveNightAttendance } from './lib/training';
import { getSession, clearSession, login } from './lib/auth';
import TopBar from './components/TopBar';
import LoginScreen from './components/LoginScreen';
import AdminPanel from './components/AdminPanel';
import ChangePin from './components/ChangePin';
import DeptGrid from './components/DeptGrid';
import SummaryCards from './components/SummaryCards';
import ApproverDropdown from './components/ApproverDropdown';
import WorkerList from './components/WorkerList';
import ActionBar from './components/ActionBar';
import Toast from './components/Toast';
import PunchScreen from './components/PunchScreen';

function getWorkers(deptKey) {
  return deptKey === 'light' ? LIGHT_WORKERS : [];
}

export default function App() {
  const [lang, setLang] = useState(() => localStorage.getItem('ambria-lang') || 'hi');
  const [session, setSession] = useState(() => getSession());
  const [showAdmin, setShowAdmin] = useState(false);
  const [showChangePin, setShowChangePin] = useState(false);
  const [activeDept, setActiveDept] = useState(null);
  const [shiftOverride, setShiftOverride] = useState(null);
  const [attendance, setAttendance] = useState({});
  const [approver, setApprover] = useState('');
  const [toast, setToast] = useState('');
  const [dateStr, setDateStr] = useState(formatDate(lang));
  const channelRef = useRef(null);

  const isNight = shiftOverride === 'night' || (!shiftOverride && isNightShift());

  // Persist language
  useEffect(() => {
    localStorage.setItem('ambria-lang', lang);
  }, [lang]);

  // Auto-open admin if ?admin=1 and user is admin
  useEffect(() => {
    if (session?.is_admin && new URLSearchParams(window.location.search).get('admin') === '1') {
      setShowAdmin(true);
    }
  }, [session]);

  // Update body shift attribute for CSS
  useEffect(() => {
    document.body.dataset.shift = isNight ? 'night' : 'day';
  }, [isNight]);

  // Clock
  useEffect(() => {
    const tick = () => setDateStr(formatDate(lang));
    tick();
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, [lang]);

  // Load attendance from Supabase when dept changes
  useEffect(() => {
    if (!activeDept) return;
    const workers = getWorkers(activeDept);
    const ids = workers.map(w => w.id);
    loadAttendance(ids, dateKey()).then(cloud => {
      if (Object.keys(cloud).length > 0) setAttendance(cloud);
    });

    // Realtime subscription
    if (channelRef.current) channelRef.current.unsubscribe();
    channelRef.current = subscribeAttendance(dateKey(), () => {
      loadAttendance(ids, dateKey()).then(fresh => setAttendance(fresh));
    });

    return () => { if (channelRef.current) channelRef.current.unsubscribe(); };
  }, [activeDept]);

  const toggleLang = () => setLang(l => l === 'hi' ? 'en' : 'hi');

  const handleLogin = async (mobile, pin) => {
    const result = await login(mobile, pin);
    if (result.ok) setSession(getSession());
    return result;
  };

  const handleLogout = () => { clearSession(); setSession(null); };

  const toggleShift = () => {
    setShiftOverride(s => s === 'night' ? 'day' : 'night');
  };

  const selectDept = (key) => {
    setActiveDept(key);
    setAttendance({});
    setApprover('');
  };

  const toggleAttendance = useCallback((workerId, action) => {
    setAttendance(prev => {
      const a = { day: false, night: false, absent: false, ...prev[workerId] };
      if (action === 'absent') {
        a.absent = !a.absent;
        if (a.absent) { a.day = false; a.night = false; }
      } else if (action === 'day') {
        a.day = !a.day;
        if (a.day) a.absent = false;
      } else if (action === 'night') {
        a.night = !a.night;
        if (a.night) a.absent = false;
      }
      return { ...prev, [workerId]: a };
    });
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleSave = async () => {
    if (!approver) return showToast(t('noApprover', lang));
    const hasAny = Object.values(attendance).some(a => a.day || a.night || a.absent);
    if (!hasAny) return showToast(t('noMarked', lang));

    const result = await saveNightAttendance(attendance, approver);
    const workers = getWorkers(activeDept);
    const s = computeSummary(workers, attendance);

    if (result.ok) {
      showToast(t('savedToast', lang, { day: s.day, night: s.night, absent: s.absent }));
    } else {
      showToast(lang === 'hi' ? '❌ सेव नहीं हुआ' : '❌ Save failed');
    }
  };

  const handleReset = () => {
    if (confirm(t('resetConfirm', lang))) {
      setAttendance({});
      setApprover('');
    }
  };

  const workers = activeDept ? getWorkers(activeDept) : [];
  const summary = computeSummary(workers, attendance);

  if (!session) return <LoginScreen lang={lang} onLogin={handleLogin} />;

  if (showAdmin && session?.is_admin) {
    return <AdminPanel lang={lang} session={session} onClose={() => {
      setShowAdmin(false);
      // Clean up URL param if present
      const url = new URL(window.location.href);
      url.searchParams.delete('admin');
      window.history.replaceState({}, '', url.toString());
    }} />;
  }

  return (
    <>
      <TopBar
        lang={lang}
        isNight={isNight}
        onToggleLang={toggleLang}
        onToggleShift={toggleShift}
        session={session}
        onLogout={handleLogout}
        onAdmin={() => setShowAdmin(true)}
        onChangePin={() => setShowChangePin(true)}
      />
      {showChangePin && <ChangePin lang={lang} session={session} onClose={() => setShowChangePin(false)} />}
      <div className="container">
        <div className="date-bar">{dateStr}</div>
        {isNight && <div className="night-banner">{t('nightBanner', lang)}</div>}

        {isNight ? (
          <>
            <DeptGrid lang={lang} activeDept={activeDept} onSelect={selectDept} />
            {activeDept ? (
              <>
                <SummaryCards lang={lang} summary={summary} />
                <ApproverDropdown lang={lang} isNight={isNight} value={approver} onChange={setApprover} />
                <WorkerList lang={lang} workers={workers} attendance={attendance} onToggle={toggleAttendance} />
              </>
            ) : (
              <div className="empty-state">
                <div className="icon">👆</div>
                <p>{lang === 'hi' ? 'ऊपर डिपार्टमेंट चुनें' : 'Select a department above'}</p>
              </div>
            )}
          </>
        ) : (
          <PunchScreen lang={lang} session={session} />
        )}
      </div>
      {isNight && activeDept && <ActionBar lang={lang} onSave={handleSave} onReset={handleReset} />}
      <Toast message={toast} />
    </>
  );
}

function computeSummary(workers, attendance) {
  let day = 0, night = 0, absent = 0, pending = 0;
  for (const w of workers) {
    const a = attendance[w.id];
    if (!a || (!a.day && !a.night && !a.absent)) { pending++; continue; }
    if (a.absent) { absent++; continue; }
    if (a.day) day++;
    if (a.night) night++;
  }
  return { total: workers.length, day, night, absent, pending };
}
