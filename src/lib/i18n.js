/**
 * AMBRIA i18n — Bilingual Hindi / English
 */

const STRINGS = {
  appTitle:       { hi: 'AMBRIA हाज़िरी', en: 'AMBRIA Attendance' },
  appSubtitle:    { hi: 'मल्टी-डिपार्टमेंट अटेंडेंस', en: 'Multi-Department Attendance' },
  dayShift:       { hi: '☀️ दिन', en: '☀️ Day' },
  nightShift:     { hi: '🌙 रात', en: '🌙 Night' },
  nightBanner:    { hi: '⚠️ रात की शिफ्ट — सिर्फ़ Head / Site Sup अप्रूव कर सकते हैं', en: '⚠️ Night Shift — Only Head / Site Sup can approve' },
  deptLight:      { hi: '💡 लाइट', en: '💡 Light' },
  deptFlower:     { hi: '🌸 फ्लावर', en: '🌸 Flower' },
  deptFurniture:  { hi: '🪑 फर्नीचर', en: '🪑 Furniture' },
  deptStructure:  { hi: '🏗️ स्ट्रक्चर', en: '🏗️ Structure' },
  deptTenting:    { hi: '⛺ टेंटिंग', en: '⛺ Tenting' },
  deptPaint:      { hi: '🎨 पेंट', en: '🎨 Paint' },
  deptCarpenter:  { hi: '🪚 कारपेंटर', en: '🪚 Carpenter' },
  deptFabric:     { hi: '🧵 फैब्रिक', en: '🧵 Fabric' },
  deptTransport:  { hi: '🚛 ट्रांसपोर्ट', en: '🚛 Transport' },
  deptSiteOps:    { hi: '🏟️ साइट ऑप्स', en: '🏟️ Site Ops' },
  rank1:          { hi: 'डिपार्टमेंट हेड', en: 'Department Head' },
  rank2:          { hi: 'स्टॉक कीपर', en: 'Stock Keeper' },
  rank3:          { hi: 'साइट मेन', en: 'Site Main' },
  rank4:          { hi: 'हेल्पर', en: 'Helper' },
  total:          { hi: 'कुल', en: 'Total' },
  dayPresent:     { hi: '✅ दिन', en: '✅ Day' },
  nightPresent:   { hi: '🌙 रात', en: '🌙 Night' },
  absent:         { hi: '❌ अनुपस्थित', en: '❌ Absent' },
  pending:        { hi: '⏳ बाकी', en: '⏳ Pending' },
  save:           { hi: '💾 सेव करें', en: '💾 Save' },
  reset:          { hi: '🔄 रीसेट', en: '🔄 Reset' },
  selectApprover: { hi: 'अप्रूवर चुनें', en: 'Select Approver' },
  savedToast:     { hi: 'सेव हो गया! दिन: {day}, रात: {night}, अनुपस्थित: {absent}', en: 'Saved! Day: {day}, Night: {night}, Absent: {absent}' },
  resetConfirm:   { hi: 'क्या आप रीसेट करना चाहते हैं?', en: 'Are you sure you want to reset?' },
  noApprover:     { hi: 'कृपया अप्रूवर चुनें', en: 'Please select an approver' },
  noMarked:       { hi: 'कम से कम एक वर्कर मार्क करें', en: 'Mark at least one worker' },
  login:          { hi: 'लॉग इन', en: 'Log In' },
  register:       { hi: 'रजिस्टर करें', en: 'Register' },
  name:           { hi: 'नाम', en: 'Name' },
  mobile:         { hi: 'मोबाइल नंबर', en: 'Mobile Number' },
  pin:            { hi: '4-अंक PIN', en: '4-Digit PIN' },
  forgotPin:      { hi: 'PIN भूल गए?', en: 'Forgot PIN?' },
  pendingApproval:{ hi: 'अप्रूवल का इंतज़ार...', en: 'Waiting for approval...' },
  sunday: { hi: 'रविवार', en: 'Sunday' }, monday: { hi: 'सोमवार', en: 'Monday' },
  tuesday: { hi: 'मंगलवार', en: 'Tuesday' }, wednesday: { hi: 'बुधवार', en: 'Wednesday' },
  thursday: { hi: 'गुरुवार', en: 'Thursday' }, friday: { hi: 'शुक्रवार', en: 'Friday' },
  saturday: { hi: 'शनिवार', en: 'Saturday' },
  january: { hi: 'जनवरी', en: 'January' }, february: { hi: 'फ़रवरी', en: 'February' },
  march: { hi: 'मार्च', en: 'March' }, april: { hi: 'अप्रैल', en: 'April' },
  may: { hi: 'मई', en: 'May' }, june: { hi: 'जून', en: 'June' },
  july: { hi: 'जुलाई', en: 'July' }, august: { hi: 'अगस्त', en: 'August' },
  september: { hi: 'सितम्बर', en: 'September' }, october: { hi: 'अक्टूबर', en: 'October' },
  november: { hi: 'नवम्बर', en: 'November' }, december: { hi: 'दिसम्बर', en: 'December' }
};

const DAYS = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
const MONTHS = ['january','february','march','april','may','june','july','august','september','october','november','december'];

export function t(key, lang, vars = {}) {
  const entry = STRINGS[key];
  if (!entry) return `[${key}]`;
  let str = entry[lang] || entry.en || `[${key}]`;
  for (const [k, v] of Object.entries(vars)) {
    str = str.replace(`{${k}}`, v);
  }
  return str;
}

export function formatDate(lang, date = new Date()) {
  const day = t(DAYS[date.getDay()], lang);
  const month = t(MONTHS[date.getMonth()], lang);
  const d = date.getDate();
  const y = date.getFullYear();
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  return `${day}, ${d} ${month} ${y} • 🕐 ${hh}:${mm}`;
}

export function dateKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}
