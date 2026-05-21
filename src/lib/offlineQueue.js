// offlineQueue.js — IndexedDB queue for offline punch/night saves

const DB_NAME = 'ambria-offline';
const DB_VERSION = 1;
const PUNCH_STORE = 'pending_punches';
const NIGHT_STORE = 'pending_night';

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(PUNCH_STORE)) {
        db.createObjectStore(PUNCH_STORE, { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains(NIGHT_STORE)) {
        db.createObjectStore(NIGHT_STORE, { keyPath: 'id', autoIncrement: true });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function txWrite(db, storeName, data) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const req = store.add(data);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function txGetAll(db, storeName) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function txDelete(db, storeName, id) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

// Queue a punch for later sync
export async function queuePunch(punchData) {
  const db = await openDB();
  await txWrite(db, PUNCH_STORE, { ...punchData, queuedAt: new Date().toISOString() });
}

// Queue night attendance for later sync
export async function queueNightAttendance(attendanceMap, approver) {
  const db = await openDB();
  await txWrite(db, NIGHT_STORE, { attendanceMap, approver, queuedAt: new Date().toISOString() });
}

// Get count of pending items (for UI badge)
export async function getPendingCount() {
  try {
    const db = await openDB();
    const punches = await txGetAll(db, PUNCH_STORE);
    const nights = await txGetAll(db, NIGHT_STORE);
    return punches.length + nights.length;
  } catch {
    return 0;
  }
}

// Flush all queued items to Supabase
export async function flushQueue(recordPunchFn, saveNightFn) {
  const db = await openDB();
  let synced = 0;

  // Flush punches
  const punches = await txGetAll(db, PUNCH_STORE);
  for (const p of punches) {
    const { id, queuedAt, ...punchData } = p;
    const ok = await recordPunchFn(punchData);
    if (ok) {
      await txDelete(db, PUNCH_STORE, id);
      synced++;
    }
  }

  // Flush night attendance
  const nights = await txGetAll(db, NIGHT_STORE);
  for (const n of nights) {
    const { id, queuedAt, attendanceMap, approver } = n;
    const result = await saveNightFn(attendanceMap, approver);
    if (result.ok) {
      await txDelete(db, NIGHT_STORE, id);
      synced++;
    }
  }

  return synced;
}