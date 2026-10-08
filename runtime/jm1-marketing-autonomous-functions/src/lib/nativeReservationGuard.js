import { createHash } from 'node:crypto';

export const NATIVE_RESERVATION_STATUS = 'NATIVE_RESERVATION_TIMEZONE_UNVERIFIED';
export const VERIFIED_NATIVE_RESERVATION_STATUS = 'NATIVE_RESERVATION_VERIFIED';
export const NATIVE_RESERVATION_STATUSES = [NATIVE_RESERVATION_STATUS, VERIFIED_NATIVE_RESERVATION_STATUS];

export function captionFingerprint(caption) {
  return createHash('sha256').update(String(caption || '')).digest('hex');
}

export function matchingNativeReservation(row, caption, reservations) {
  const fingerprint = captionFingerprint(caption);
  const destination = normalizeDestination(row.jm1_requesteddestination);
  return reservations.find((reservation) =>
    NATIVE_RESERVATION_STATUSES.includes(reservation.jm1_status)
    && reservation.jm1_branch === row.jm1_branch
    && reservation.jm1_platform === row.jm1_platform
    && normalizeDestination(reservation.jm1_requesteddestination) === destination
    && reservation.jm1_captionversion === fingerprint
    && reservation.jm1_requestedmediahash === row.jm1_requestedmediahash
  ) || null;
}

function normalizeDestination(value) {
  return String(value || '').trim().replace(/^@/, '').toLowerCase();
}
