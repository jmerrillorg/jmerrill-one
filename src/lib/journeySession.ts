import type { Journey } from '@/lib/journeys';

const STORAGE_KEY = 'jm1:journey:v1';

type StoredJourney = {
  journey: Journey;
  savedAt: number;
};

function isBrowser() {
  return typeof window !== 'undefined';
}

function safeParse(raw: string | null): StoredJourney | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredJourney;
  } catch {
    return null;
  }
}

/**
 * Session-first persistence (browser-only)
 */
export function saveJourney(
  journey: Journey,
  mode: 'session' | 'local' = 'session'
) {
  if (!isBrowser()) return;

  const payload: StoredJourney = { journey, savedAt: Date.now() };
  const serialized = JSON.stringify(payload);

  if (mode === 'local') {
    window.localStorage.setItem(STORAGE_KEY, serialized);
  } else {
    window.sessionStorage.setItem(STORAGE_KEY, serialized);
  }
}

export function loadJourney(
  mode: 'session' | 'local' = 'session'
): Journey | null {
  if (!isBrowser()) return null;

  const raw =
    mode === 'local'
      ? window.localStorage.getItem(STORAGE_KEY)
      : window.sessionStorage.getItem(STORAGE_KEY);

  const parsed = safeParse(raw);
  return parsed?.journey ?? null;
}

export function clearJourney(mode: 'session' | 'local' = 'session') {
  if (!isBrowser()) return;

  if (mode === 'local') {
    window.localStorage.removeItem(STORAGE_KEY);
  } else {
    window.sessionStorage.removeItem(STORAGE_KEY);
  }
}