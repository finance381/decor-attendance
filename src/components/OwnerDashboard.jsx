import { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { getAttendanceRange, getDailyTrend, getAbsentWorkers, getTotalWorkerCounts } from '../lib/admin';
import { DEPARTMENTS } from '../lib/data';
import { dateKey } from '../lib/i18n';

const RANGE_OPTIONS = [
  { key: 'today', hi: 'आज', en: 'Today' },
  { key: '7d', hi: 'पिछले 7 दिन', en: 'Last 7 Days' },
  { key: '30d', hi: 'पिछले 30 दिन', en: 'Last 30 Days' },
  { key: 'custom', hi: 'कस्टम', en: 'Custom' },
];

function getDateRange(rangeKey) {
  const today = new Date();
  const end = dateKey(today);
  if (rangeKey === 'today') return { start: end, end };
  if (rangeKey === '7d') {
    const d = new Date(today); d.setDate(d.getDate() - 6);
    return { start: dateKey(d), end };
  }
  if (rangeKey === '30d') {
    const d = new Date(today); d.setDate(d.getDate() - 29);
    return { start: dateKey(d), end };
  }
  return { start: end, end };
}

const COLORS = {
  day: '#10b981',
  night: '#6366f1',
  absent: '#ef4444',
  pending: '#f59e0b',
};

const DEPT_COLORS = ['#667eea', '#764ba2', '#f59e0b', '#10b981', '#ef4444', '#6366f1', '#3b82f6', '#f97316', '#22c55e', '#ec4899'];

export default function OwnerDashboard({ lang }) {
  const [range, setRange] = useState('today');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [loading, setLoading] = useState(true);
  const [deptData, setDeptData] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [absentList, setAbsentList] = useState([]);
  const [workerCounts, setWorkerCounts] = useState({});

  useEffect(() => { loadData(); }, [range, customStart, customEnd]);

  const loadData = async () => {
    setLoading(true);
    const { start, end } = range === 'custom'
      ? { start: customStart || dateKey(), end: customEnd || dateKey() }
      : getDateRange(range);

    const [dept, trend, absent, counts] = await Promise.all([
      getAttendanceRange(start, end),
      getDailyTrend(start, end),
      getAbsentWorkers(start, end),
      getTotalWorkerCounts(),
    ]);

    setDeptData(dept);
    setTrendData(trend);
    setAbsentList(absent);
    setWorkerCounts(counts);
    setLoading(false);
  };

  const totalWorkers = Object.values(workerCounts).reduce((a, b) => a + b, 0);
  const totalDay = deptData.reduce((a, d) => a + d.day, 0);
  const totalNight = deptData.reduce((a, d) => a + d.night, 0);
  const days = trendData.length || 1;
  const avgAttendance = totalWorkers > 0
    ? Math.round((totalDay / (totalWorkers * days)) * 100)
    : 0;

  // Prepare chart data
  const barData = DEPARTMENTS.map(d => {
    const found = deptData.find(x => x.department === d.key);
    return {
      name: d[lang] || d.en,
      [lang === 'hi' ? 'दिन' : 'Day']: found?.day || 0,
      [lang === 'hi' ? 'रात' : 'Night']: found?.night || 0,
    };
  }).filter(d => d[lang === 'hi' ? 'दिन' : 'Day'] > 0 || d[lang === 'hi' ? 'रात' : 'Night'] > 0);

  const lineData = trendData.map(t => ({
    date: t.date.slice(5), // MM-DD
    [lang === 'hi' ? 'दिन' : 'Day']: t.day,
    [lang === 'hi' ? 'रात' : 'Night']: t.night,
    [lang === 'hi' ? 'अनुपस्थित' : 'Absent']: t.absent,
  }));

  // Pie data for today's status distribution
  const pieData = [
    { name: lang === 'hi' ? 'दिन' : 'Day', value: totalDay, color: COLORS.day },
    { name: lang === 'hi' ? 'रात' : 'Night', value: totalNight, color: COLORS.night },
    { name: lang === 'hi' ? 'अनुपस्थित' : 'Absent', value: absentList.length, color: COLORS.absent },
  ].filter(d => d.value > 0);

  return (
    <div>
      <div className="admin-page-header">
        <h1>{lang === 'hi' ? '📈 ओनर डैशबोर्ड' : '📈 Owner Dashboard'}</h1>
      </div>

      {/* Range selector */}
      <div className="dash-range-bar">
        {RANGE_OPTIONS.map(r => (
          <button key={r.key}
            className={`dash-range-btn ${range === r.key ? 'active' : ''}`}
            onClick={() => setRange(r.key)}>
            {r[lang]}
          </button>
        ))}
        {range === 'custom' && (
          <div className="dash-custom-range">
            <input type="date" className="admin-search" value={customStart}
              onChange={e => setCustomStart(e.target.value)} />
            <span>→</span>
            <input type="date" className="admin-search" value={customEnd}
              onChange={e => setCustomEnd(e.target.value)} />
          </div>
        )}
      </div>

      {loading ? <p className="admin-loading">{lang === 'hi' ? '⏳ लोड हो रहा है...' : '⏳ Loading...'}</p> : (
        <>
          {/* Stat cards */}
          <div className="admin-stat-row">
            <div className="admin-stat-card">
              <div className="admin-stat-value">{totalWorkers}</div>
              <div className="admin-stat-label">{lang === 'hi' ? 'कुल वर्कर' : 'Total Workers'}</div>
            </div>
            <div className="admin-stat-card">
              <div className="admin-stat-value" style={{ color: COLORS.day }}>{totalDay}</div>
              <div className="admin-stat-label">{lang === 'hi' ? 'दिन पंच' : 'Day Punches'}</div>
            </div>
            <div className="admin-stat-card">
              <div className="admin-stat-value" style={{ color: COLORS.night }}>{totalNight}</div>
              <div className="admin-stat-label">{lang === 'hi' ? 'रात पंच' : 'Night Punches'}</div>
            </div>
            <div className="admin-stat-card">
              <div className="admin-stat-value" style={{ color: COLORS.day }}>{avgAttendance}%</div>
              <div className="admin-stat-label">{lang === 'hi' ? 'औसत उपस्थिति' : 'Avg Attendance'}</div>
            </div>
          </div>

          {/* Charts row */}
          <div className="dash-charts-row">
            {/* Department bar chart */}
            <div className="dash-chart-card">
              <h3 className="dash-chart-title">{lang === 'hi' ? 'डिपार्टमेंट वाइज़ उपस्थिति' : 'Attendance by Department'}</h3>
              {barData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={barData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} angle={-30} textAnchor="end" height={60} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey={lang === 'hi' ? 'दिन' : 'Day'} fill={COLORS.day} radius={[4, 4, 0, 0]} />
                    <Bar dataKey={lang === 'hi' ? 'रात' : 'Night'} fill={COLORS.night} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="dash-no-data">{lang === 'hi' ? 'कोई डेटा नहीं' : 'No data'}</p>
              )}
            </div>

            {/* Pie chart */}
            <div className="dash-chart-card">
              <h3 className="dash-chart-title">{lang === 'hi' ? 'स्टेटस वितरण' : 'Status Distribution'}</h3>
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="dash-no-data">{lang === 'hi' ? 'कोई डेटा नहीं' : 'No data'}</p>
              )}
            </div>
          </div>

          {/* Trend line chart (only for multi-day ranges) */}
          {trendData.length > 1 && (
            <div className="dash-chart-card dash-chart-full">
              <h3 className="dash-chart-title">{lang === 'hi' ? 'दैनिक ट्रेंड' : 'Daily Trend'}</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={lineData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey={lang === 'hi' ? 'दिन' : 'Day'} stroke={COLORS.day} strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey={lang === 'hi' ? 'रात' : 'Night'} stroke={COLORS.night} strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey={lang === 'hi' ? 'अनुपस्थित' : 'Absent'} stroke={COLORS.absent} strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Absent workers table */}
          {absentList.length > 0 && (
            <div style={{ marginTop: 32 }}>
              <h2 className="admin-section-title">
                {lang === 'hi' ? `❌ अनुपस्थित वर्कर (${absentList.length})` : `❌ Absent Workers (${absentList.length})`}
              </h2>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>{lang === 'hi' ? 'नाम' : 'Name'}</th>
                    <th>{lang === 'hi' ? 'डिपार्टमेंट' : 'Department'}</th>
                    <th>{lang === 'hi' ? 'रैंक' : 'Rank'}</th>
                    <th>{lang === 'hi' ? 'अनुपस्थित दिन' : 'Days Absent'}</th>
                  </tr>
                </thead>
                <tbody>
                  {absentList.map((w, i) => {
                    const dept = DEPARTMENTS.find(d => d.key === w.department);
                    return (
                      <tr key={i}>
                        <td>
                          <div className="cell-name">
                            <span className={`rank-dot r${w.rank}`}></span>
                            {lang === 'hi' ? w.name_hi : w.name_en}
                          </div>
                        </td>
                        <td>{dept ? `${dept.emoji} ${dept[lang] || dept.en}` : '—'}</td>
                        <td><span className={`rank-badge r${w.rank}`}>R{w.rank}</span></td>
                        <td className="cell-absent">{w.absentDays}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}