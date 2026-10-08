import { createHash } from 'node:crypto';

export const NATIVE_RESERVATION_STATUS = 'NATIVE_RESERVATION_TIMEZONE_UNVERIFIED';

export function captionFingerprint(caption) {
  return createHash('sha256').update(String(caption || '')).digest('hex');
}

export function matchingNativeReservation(row, caption, reservations) {
  const fingerprint = captionFingerprint(caption);
  const destination = normalizeDestination(row.jm1_requesteddestination);
  return reservations.find((reservation) =>
    reservation.jm1_status === NATIVE_RESERVATION_STATUS
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
