// syncManager.js — online/offline detection + queue flush

import { flushQueue, getPendingCount } from './offlineQueue';
import { recordPunch, saveNightAttendance } from './training';

let onStatusChange = null; // callback: (isOnline, pendingCount) => void

export function initSyncManager(statusCallback) {
  onStatusChange = statusCallback;

  // Initial state
  notifyStatus();

  // Listen for online/offline
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', () => notifyStatus());

  // Also check on app focus (covers iOS PWA resume)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && navigator.onLine) {
      handleOnline();
    }
  });
}

export function destroySyncManager() {
  window.removeEventListener('online', handleOnline);
  window.removeEventListener('offline', () => notifyStatus());
  onStatusChange = null;
}

async function handleOnline() {
  const synced = await flushQueue(recordPunch, saveNightAttendance);
  if (synced > 0) {
    console.log(`[Sync] Flushed ${synced} queued items`);
  }
  notifyStatus();
}

async function notifyStatus() {
  if (!onStatusChange) return;
  const pending = await getPendingCount();
  onStatusChange(navigator.onLine, pending);
}

// Try to register Background Sync (Chromium only)
export async function registerBackgroundSync() {
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    try {
      const reg = await navigator.serviceWorker.ready;
      await reg.sync.register('ambria-sync');
    } catch (e) {
      console.warn('[Sync] Background Sync registration failed:', e);
    }
  }
}

// Call this after a successful queue write
export async function triggerSync() {
  if (navigator.onLine) {
    await handleOnline();
  } else {
    await registerBackgroundSync();
    await notifyStatus();
  }
}