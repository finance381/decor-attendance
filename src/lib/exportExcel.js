import * as XLSX from 'xlsx';
import { supabase } from './supabase';
import { DEPARTMENTS } from './data';

// Export single-day report (for OverviewTab)
export async function exportDayReport(date, summaries, workerCounts, lang) {
  const detail = await fetchDetailData(date, date);
  const summarySheet = buildSummarySheet(summaries, workerCounts, lang);
  const detailSheet = buildDetailSheet(detail, lang);

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, summarySheet, lang === 'hi' ? 'सारांश' : 'Summary');
  XLSX.utils.book_append_sheet(wb, detailSheet, lang === 'hi' ? 'विवरण' : 'Detail');

  XLSX.writeFile(wb, `Decor_Attendance_${date}.xlsx`);
}

// Export date-range report (for Owner Dashboard)
export async function exportRangeReport(startDate, endDate, deptData, lang) {
  const detail = await fetchDetailData(startDate, endDate);

  // Build summary from deptData
  const summaryRows = DEPARTMENTS.map(d => {
    const found = deptData.find(x => x.department === d.key);
    return {
      [lang === 'hi' ? 'डिपार्टमेंट' : 'Department']: d[lang] || d.en,
      [lang === 'hi' ? 'दिन' : 'Day']: found?.day || 0,
      [lang === 'hi' ? 'रात' : 'Night']: found?.night || 0,
    };
  }).filter(r => r[lang === 'hi' ? 'दिन' : 'Day'] > 0 || r[lang === 'hi' ? 'रात' : 'Night'] > 0);

  const summarySheet = XLSX.utils.json_to_sheet(summaryRows);
  const detailSheet = buildDetailSheet(detail, lang);

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, summarySheet, lang === 'hi' ? 'सारांश' : 'Summary');
  XLSX.utils.book_append_sheet(wb, detailSheet, lang === 'hi' ? 'विवरण' : 'Detail');

  const fileName = startDate === endDate
    ? `Decor_Attendance_${startDate}.xlsx`
    : `Decor_Attendance_${startDate}_to_${endDate}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

// Fetch detailed punch data with worker info
async function fetchDetailData(startDate, endDate) {
  const { data } = await supabase
    .from('punch_log')
    .select('worker_id, date, type, punched_at, quiz_score, video_completed, workers!inner(name_hi, name_en, department, rank)')
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true });

  return data || [];
}

function buildSummarySheet(summaries, workerCounts, lang) {
  const rows = DEPARTMENTS.map(d => {
    const s = summaries.find(x => x.department === d.key) || { day: 0, night: 0, absent: 0 };
    const total = workerCounts[d.key] || 0;
    return {
      [lang === 'hi' ? 'डिपार्टमेंट' : 'Department']: d[lang] || d.en,
      [lang === 'hi' ? 'कुल' : 'Total']: total,
      [lang === 'hi' ? 'दिन' : 'Day']: s.day,
      [lang === 'hi' ? 'रात' : 'Night']: s.night,
      [lang === 'hi' ? 'अनुपस्थित' : 'Absent']: s.absent,
    };
  });
  return XLSX.utils.json_to_sheet(rows);
}

function buildDetailSheet(data, lang) {
  // Group by worker+date
  const map = {};
  for (const row of data) {
    const key = `${row.worker_id}_${row.date}`;
    if (!map[key]) {
      const dept = DEPARTMENTS.find(d => d.key === row.workers?.department);
      map[key] = {
        [lang === 'hi' ? 'तारीख' : 'Date']: row.date,
        [lang === 'hi' ? 'नाम' : 'Name']: lang === 'hi' ? row.workers?.name_hi : row.workers?.name_en,
        [lang === 'hi' ? 'डिपार्टमेंट' : 'Department']: dept ? (dept[lang] || dept.en) : '—',
        [lang === 'hi' ? 'रैंक' : 'Rank']: `R${row.workers?.rank}`,
        [lang === 'hi' ? 'पंच इन' : 'Punch In']: '',
        [lang === 'hi' ? 'पंच आउट' : 'Punch Out']: '',
        [lang === 'hi' ? 'रात' : 'Night']: '',
        [lang === 'hi' ? 'वीडियो' : 'Video']: '',
        [lang === 'hi' ? 'क्विज़ स्कोर' : 'Quiz Score']: '',
      };
    }
    const entry = map[key];
    const time = row.punched_at ? new Date(row.punched_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '';
    if (row.type === 'day_in') {
      entry[lang === 'hi' ? 'पंच इन' : 'Punch In'] = time;
      entry[lang === 'hi' ? 'वीडियो' : 'Video'] = row.video_completed ? '✅' : '❌';
      entry[lang === 'hi' ? 'क्विज़ स्कोर' : 'Quiz Score'] = row.quiz_score != null ? `${row.quiz_score}/2` : '—';
    }
    if (row.type === 'day_out') entry[lang === 'hi' ? 'पंच आउट' : 'Punch Out'] = time;
    if (row.type === 'night') entry[lang === 'hi' ? 'रात' : 'Night'] = `✅ ${time}`;
  }

  const rows = Object.values(map).sort((a, b) => {
    const dateKey = lang === 'hi' ? 'तारीख' : 'Date';
    return a[dateKey].localeCompare(b[dateKey]);
  });

  return XLSX.utils.json_to_sheet(rows);
}