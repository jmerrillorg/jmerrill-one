// JM1 Canon — Telemetry Utilities

const CLIENT_SESSION_KEY = 'jm1_clientSessionId';

export function getClientSessionId(): string {
  if (typeof window === 'undefined') {
    return '';
  }

  let id = sessionStorage.getItem(CLIENT_SESSION_KEY);

  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(CLIENT_SESSION_KEY, id);
  }

  return id;
}

export function generateCorrelationId(): string {
  return crypto.randomUUID();
}

export function getPageUrl(): string {
  if (typeof window === 'undefined') {
    return '';
  }

  return window.location.href;
}

export function getUserAgent(): string {
  if (typeof navigator === 'undefined') {
    return '';
  }

  return navigator.userAgent;
}