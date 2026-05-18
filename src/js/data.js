/**
 * AMBRIA Data — Departments, Workers, Approvers
 * Light Department (32 workers) fully mapped as pilot.
 * Other departments: structure ready, workers TBD.
 */

// --- Department Registry ---
export const DEPARTMENTS = [
  { key: 'light',     emoji: '💡', hi: 'लाइट',      en: 'Light',     head: 'guddu',     stockKeeper: 'kapil' },
  { key: 'flower',    emoji: '🌸', hi: 'फ्लावर',     en: 'Flower',    head: 'sudhir',    stockKeeper: 'vikas' },
  { key: 'furniture', emoji: '🪑', hi: 'फर्नीचर',    en: 'Furniture', head: 'umakant',   stockKeeper: 'shiv_asare' },
  { key: 'structure', emoji: '🏗️', hi: 'स्ट्रक्चर',  en: 'Structure', head: 'birendra',  stockKeeper: 'ravi_ranjan' },
  { key: 'tenting',   emoji: '⛺', hi: 'टेंटिंग',    en: 'Tenting',   head: 'neeraj',    stockKeeper: 'neeraj' },
  { key: 'paint',     emoji: '🎨', hi: 'पेंट',       en: 'Paint',     head: 'arjun',     stockKeeper: null },
  { key: 'carpenter', emoji: '🪚', hi: 'कारपेंटर',   en: 'Carpenter', head: 'jitendra',  stockKeeper: null },
  { key: 'fabric',    emoji: '🧵', hi: 'फैब्रिक',    en: 'Fabric',    head: 'kripashankar', stockKeeper: null },
  { key: 'transport', emoji: '🚛', hi: 'ट्रांसपोर्ट', en: 'Transport', head: 'rajkumar',  stockKeeper: null },
  { key: 'site_ops',  emoji: '🏟️', hi: 'साइट ऑप्स',  en: 'Site Ops',  head: 'ravi_gupta', stockKeeper: null }
];

// --- Rank Config ---
export const RANKS = {
  1: { label: { hi: 'डिपार्टमेंट हेड', en: 'Dept Head' }, color: '#ef4444', short: 'R1' },
  2: { label: { hi: 'स्टॉक कीपर',     en: 'Stock Keeper' }, color: '#f97316', short: 'R2' },
  3: { label: { hi: 'साइट मेन',       en: 'Site Main' },    color: '#3b82f6', short: 'R3' },
  4: { label: { hi: 'हेल्पर',         en: 'Helper' },       color: '#22c55e', short: 'R4' }
};

// --- Sites ---
export const SITES = {
  exotica:      { hi: 'एक्सोटिका (Aura + Valancia)', en: 'Exotica (Aura + Valancia)', supervisor: 'manish' },
  pushpanjali:  { hi: 'पुष्पांजलि (AP)',              en: 'Pushpanjali (AP)',            supervisor: 'chandan' },
  manaktala:    { hi: 'मानकतला (Emerald + Astonia)',  en: 'Manaktala (Emerald + Astonia)', supervisor: 'raju' },
  restro:       { hi: 'रेस्ट्रो',                     en: 'Restro',                      supervisor: 'mohit' },
  outdoor_1:    { hi: 'आउटडोर साइट 1',               en: 'Outdoor Site 1',              supervisor: null },
  outdoor_2:    { hi: 'आउटडोर साइट 2',               en: 'Outdoor Site 2',              supervisor: null },
  outdoor_3:    { hi: 'आउटडोर साइट 3',               en: 'Outdoor Site 3',              supervisor: null },
  outdoor_4:    { hi: 'आउटडोर साइट 4',               en: 'Outdoor Site 4',              supervisor: null },
  outdoor_5:    { hi: 'आउटडोर साइट 5',               en: 'Outdoor Site 5',              supervisor: null },
  outdoor_6:    { hi: 'आउटडोर साइट 6',               en: 'Outdoor Site 6',              supervisor: null },
  godown:       { hi: 'गोदाम',                        en: 'Godown',                      supervisor: null }
};

// --- Light Department Workers (32) — PILOT ---
export const LIGHT_WORKERS = [
  // Rank 1 — Department Head
  { id: 'guddu',     name: { hi: 'गुड्डू जी', en: 'Guddu Ji' },         rank: 1, site: 'godown',      role: { hi: 'डिपार्टमेंट हेड', en: 'Department Head' } },

  // Rank 2 — Stock Keeper + Godown
  { id: 'kapil',     name: { hi: 'कपिल जी', en: 'Kapil Ji' },           rank: 2, site: 'godown',      role: { hi: 'स्टॉक कीपर', en: 'Stock Keeper' } },
  { id: 'gd_h1',     name: { hi: 'गोदाम हेल्पर 1', en: 'Godown Helper 1' }, rank: 2, site: 'godown',  role: { hi: 'गोदाम हेल्पर', en: 'Godown Helper' } },
  { id: 'gd_h2',     name: { hi: 'गोदाम हेल्पर 2', en: 'Godown Helper 2' }, rank: 2, site: 'godown',  role: { hi: 'गोदाम हेल्पर', en: 'Godown Helper' } },

  // Rank 3 — Site Mains (4 Indoor + 6 Outdoor)
  { id: 'sm_exo',    name: { hi: 'साइट मेन — एक्सोटिका', en: 'Site Main — Exotica' },       rank: 3, site: 'exotica',     role: { hi: 'इंडोर साइट मेन', en: 'Indoor Site Main' } },
  { id: 'sm_ap',     name: { hi: 'साइट मेन — पुष्पांजलि', en: 'Site Main — Pushpanjali' },   rank: 3, site: 'pushpanjali', role: { hi: 'इंडोर साइट मेन', en: 'Indoor Site Main' } },
  { id: 'sm_manak',  name: { hi: 'साइट मेन — मानकतला', en: 'Site Main — Manaktala' },         rank: 3, site: 'manaktala',   role: { hi: 'इंडोर साइट मेन', en: 'Indoor Site Main' } },
  { id: 'sm_restro', name: { hi: 'साइट मेन — रेस्ट्रो', en: 'Site Main — Restro' },           rank: 3, site: 'restro',      role: { hi: 'इंडोर साइट मेन', en: 'Indoor Site Main' } },
  { id: 'sm_out1',   name: { hi: 'आउटडोर मेन 1', en: 'Outdoor Main 1' },  rank: 3, site: 'outdoor_1',  role: { hi: 'आउटडोर साइट मेन', en: 'Outdoor Site Main' } },
  { id: 'sm_out2',   name: { hi: 'आउटडोर मेन 2', en: 'Outdoor Main 2' },  rank: 3, site: 'outdoor_2',  role: { hi: 'आउटडोर साइट मेन', en: 'Outdoor Site Main' } },
  { id: 'sm_out3',   name: { hi: 'आउटडोर मेन 3', en: 'Outdoor Main 3' },  rank: 3, site: 'outdoor_3',  role: { hi: 'आउटडोर साइट मेन', en: 'Outdoor Site Main' } },
  { id: 'sm_out4',   name: { hi: 'आउटडोर मेन 4', en: 'Outdoor Main 4' },  rank: 3, site: 'outdoor_4',  role: { hi: 'आउटडोर साइट मेन', en: 'Outdoor Site Main' } },
  { id: 'sm_out5',   name: { hi: 'आउटडोर मेन 5', en: 'Outdoor Main 5' },  rank: 3, site: 'outdoor_5',  role: { hi: 'आउटडोर साइट मेन', en: 'Outdoor Site Main' } },
  { id: 'sm_out6',   name: { hi: 'आउटडोर मेन 6', en: 'Outdoor Main 6' },  rank: 3, site: 'outdoor_6',  role: { hi: 'आउटडोर साइट मेन', en: 'Outdoor Site Main' } },

  // Rank 4 — Helpers (20)
  { id: 'h_gd1',     name: { hi: 'गोदाम हेल्पर A', en: 'Godown Helper A' },   rank: 4, site: 'godown',      role: { hi: 'गोदाम हेल्पर', en: 'Godown Helper' } },
  { id: 'h_gd2',     name: { hi: 'गोदाम हेल्पर B', en: 'Godown Helper B' },   rank: 4, site: 'godown',      role: { hi: 'गोदाम हेल्पर', en: 'Godown Helper' } },
  { id: 'h_exo',     name: { hi: 'हेल्पर — एक्सोटिका', en: 'Helper — Exotica' },         rank: 4, site: 'exotica',     role: { hi: 'इंडोर हेल्पर', en: 'Indoor Helper' } },
  { id: 'h_ap',      name: { hi: 'हेल्पर — पुष्पांजलि', en: 'Helper — Pushpanjali' },     rank: 4, site: 'pushpanjali', role: { hi: 'इंडोर हेल्पर', en: 'Indoor Helper' } },
  { id: 'h_manak',   name: { hi: 'हेल्पर — मानकतला', en: 'Helper — Manaktala' },           rank: 4, site: 'manaktala',   role: { hi: 'इंडोर हेल्पर', en: 'Indoor Helper' } },
  { id: 'h_restro',  name: { hi: 'हेल्पर — रेस्ट्रो', en: 'Helper — Restro' },             rank: 4, site: 'restro',      role: { hi: 'इंडोर हेल्पर', en: 'Indoor Helper' } },
  { id: 'h_out1a',   name: { hi: 'आउटडोर हेल्पर 1A', en: 'Outdoor Helper 1A' }, rank: 4, site: 'outdoor_1', role: { hi: 'आउटडोर हेल्पर', en: 'Outdoor Helper' } },
  { id: 'h_out1b',   name: { hi: 'आउटडोर हेल्पर 1B', en: 'Outdoor Helper 1B' }, rank: 4, site: 'outdoor_1', role: { hi: 'आउटडोर हेल्पर', en: 'Outdoor Helper' } },
  { id: 'h_out2a',   name: { hi: 'आउटडोर हेल्पर 2A', en: 'Outdoor Helper 2A' }, rank: 4, site: 'outdoor_2', role: { hi: 'आउटडोर हेल्पर', en: 'Outdoor Helper' } },
  { id: 'h_out2b',   name: { hi: 'आउटडोर हेल्पर 2B', en: 'Outdoor Helper 2B' }, rank: 4, site: 'outdoor_2', role: { hi: 'आउटडोर हेल्पर', en: 'Outdoor Helper' } },
  { id: 'h_out3a',   name: { hi: 'आउटडोर हेल्पर 3A', en: 'Outdoor Helper 3A' }, rank: 4, site: 'outdoor_3', role: { hi: 'आउटडोर हेल्पर', en: 'Outdoor Helper' } },
  { id: 'h_out3b',   name: { hi: 'आउटडोर हेल्पर 3B', en: 'Outdoor Helper 3B' }, rank: 4, site: 'outdoor_3', role: { hi: 'आउटडोर हेल्पर', en: 'Outdoor Helper' } },
  { id: 'h_out4a',   name: { hi: 'आउटडोर हेल्पर 4A', en: 'Outdoor Helper 4A' }, rank: 4, site: 'outdoor_4', role: { hi: 'आउटडोर हेल्पर', en: 'Outdoor Helper' } },
  { id: 'h_out4b',   name: { hi: 'आउटडोर हेल्पर 4B', en: 'Outdoor Helper 4B' }, rank: 4, site: 'outdoor_4', role: { hi: 'आउटडोर हेल्पर', en: 'Outdoor Helper' } },
  { id: 'h_out5a',   name: { hi: 'आउटडोर हेल्पर 5A', en: 'Outdoor Helper 5A' }, rank: 4, site: 'outdoor_5', role: { hi: 'आउटडोर हेल्पर', en: 'Outdoor Helper' } },
  { id: 'h_out5b',   name: { hi: 'आउटडोर हेल्पर 5B', en: 'Outdoor Helper 5B' }, rank: 4, site: 'outdoor_5', role: { hi: 'आउटडोर हेल्पर', en: 'Outdoor Helper' } },
  { id: 'h_flex1',   name: { hi: 'फ्लेक्स हेल्पर 1', en: 'Flex Helper 1' },     rank: 4, site: 'godown',    role: { hi: 'फ्लेक्सिबल हेल्पर', en: 'Flexible Helper' } },
  { id: 'h_flex2',   name: { hi: 'फ्लेक्स हेल्पर 2', en: 'Flex Helper 2' },     rank: 4, site: 'godown',    role: { hi: 'फ्लेक्सिबल हेल्पर', en: 'Flexible Helper' } }
];

// --- Approvers (6-Layer System) ---
export const APPROVERS = {
  // Always available (Day + Night)
  always: [
    { id: 'guddu',     label: { hi: 'गुड्डू जी (डिपार्टमेंट हेड)', en: 'Guddu Ji (Dept Head)' }, layer: 1 },
    { id: 'site_sup',  label: { hi: 'साइट सुपरवाइज़र', en: 'Site Supervisor' }, layer: 2 }
  ],
  // Day-only (hidden after 7 PM)
  dayOnly: [
    { id: 'om',        label: { hi: 'ओम शर्मा जी (प्रोडक्शन हेड)', en: 'Om Sharma Ji (Production Head)' }, layer: 3 },
    { id: 'tarun',     label: { hi: 'तरुण जी (डेकोर हेड)', en: 'Tarun Ji (Decor Head)' }, layer: 4 },
    { id: 'cross_sr',  label: { hi: 'क्रॉस-डिपार्टमेंट सीनियर', en: 'Cross-Dept Senior' }, layer: 5 }
  ]
};

/**
 * Get approvers available for the current time.
 * After 7 PM → only Head + Site Supervisor.
 */
export function getAvailableApprovers(hour = new Date().getHours()) {
  const isNight = hour >= 19 || hour < 7;
  return isNight ? APPROVERS.always : [...APPROVERS.always, ...APPROVERS.dayOnly];
}

/**
 * Check if current time is night shift.
 */
export function isNightShift(hour = new Date().getHours()) {
  return hour >= 19 || hour < 7;
}
