import { createHash } from 'node:crypto';

export const NATIVE_RESERVATION_STATUS = 'NATIVE_RESERVATION_TIMEZONE_UNVERIFIED';
export const VERIFIED_NATIVE_RESERVATION_STATUS = 'NATIVE_RESERVATION_VERIFIED';
export const NATIVE_RESERVATION_STATUSES = [NATIVE_RESERVATION_STATUS, VERIFIED_NATIVE_RESERVATION_STATUS, 'NATIVE_BOOKED_VERIFIED'];

export function captionFingerprint(caption) {
  return createHash('sha256').update(String(caption || '')).digest('hex');
}

export function matchingNativeReservation(row, caption, reservations, destinationAliases = [row.jm1_requesteddestination]) {
  return matchingNativeReservationDisposition(row, caption, reservations, destinationAliases)?.reservation || null;
}

export function matchingNativeReservationDisposition(row, caption, reservations, destinationAliases = [row.jm1_requesteddestination], nowIso) {
  const fingerprint = captionFingerprint(caption);
  const allowedDestinations = new Set(destinationAliases.map(normalizeDestination));
  if (!allowedDestinations.has(normalizeDestination(row.jm1_requesteddestination))) return null;
  const inScope = (reservation) =>
    NATIVE_RESERVATION_STATUSES.includes(reservation.jm1_status)
    && reservation.jm1_branch === row.jm1_branch
    && reservation.jm1_platform === row.jm1_platform
    && allowedDestinations.has(normalizeDestination(reservation.jm1_requesteddestination));
  const sameSlot = reservations.find((reservation) => inScope(reservation)
    && Date.parse(reservation.jm1_requestedschedule || '') === Date.parse(row.jm1_requestedschedule || ''));
  const sameContent = reservations.find((reservation) => inScope(reservation)
    && reservation.jm1_captionversion === fingerprint
    && reservation.jm1_requestedmediahash === row.jm1_requestedmediahash);
  const match = sameSlot || sameContent;
  if (!match) return null;

  const requestedTime = Date.parse(row.jm1_requestedschedule || '');
  const reservedTime = Date.parse(match.jm1_requestedschedule || '');
  const observedTime = Date.parse(nowIso || '');
  const slotMatches = Number.isFinite(requestedTime) && requestedTime === reservedTime;
  const contentMatches = match.jm1_captionversion === fingerprint
    && match.jm1_requestedmediahash === row.jm1_requestedmediahash;
  return {
    reservation: match,
    disposition: slotMatches && contentMatches && Number.isFinite(observedTime) && reservedTime < observedTime
      ? 'STALE_SLOT'
      : slotMatches && contentMatches ? 'EXACT_SLOT' : 'SLOT_CONFLICT',
    requestedSchedule: Number.isFinite(requestedTime) ? new Date(requestedTime).toISOString() : null,
    reservedSchedule: Number.isFinite(reservedTime) ? new Date(reservedTime).toISOString() : null
  };
}

function normalizeDestination(value) {
  return String(value || '').trim().replace(/^@/, '').toLowerCase().replace(/[.,]/g, '');
}

export function nativeReservationAliases(destination) {
  return [...new Set([destination.id, destination.name, destination.handle].filter(Boolean))];
}

export function isActionableNativeReservationFailure(state) {
  return state === 'NATIVE_BOOKING_CONFLICT' || state === 'NATIVE_BOOKING_STALE';
}

export function buildNativeReservationHold({ row, reservation, disposition, requestedSchedule, reservedSchedule, nowIso }) {
  const conflict = disposition !== 'EXACT_SLOT';
  const stale = disposition === 'STALE_SLOT';
  const state = stale ? 'HELD_NATIVE_BOOKING_STALE'
    : conflict ? 'HELD_NATIVE_BOOKING_CONFLICT' : 'HELD_NATIVE_BOOKING_DUPLICATE';
  const exceptionType = stale ? 'NATIVE_BOOKING_STALE' : 'NATIVE_BOOKING_CONFLICT';
  const reason = stale
    ? `Matching native booking ${reservation.jm1_socialexecutionid} owns expired slot ${reservedSchedule}, with no publication proof on this API request. API dispatch remains held for reconciliation.`
    : conflict
      ? `Matching native booking ${reservation.jm1_socialexecutionid} conflicts with requested slot ${requestedSchedule || 'missing/invalid'}; native slot is ${reservedSchedule || 'missing/invalid'}. API dispatch remains held pending reconciliation.`
      : `Matching native booking ${reservation.jm1_socialexecutionid} already owns the exact requested slot ${requestedSchedule}. API dispatch was suppressed.`;
  return {
    state,
    socialPatch: {
      jm1_status: state,
      jm1_errorcode: state,
      jm1_errormessage: reason,
      jm1_readbackstate: state,
      jm1_verifiedat: nowIso
    },
    exception: conflict ? {
      jm1_name: stale ? 'Social native booking stale reservation' : 'Social native booking conflict',
      jm1_branch: row.jm1_branch,
      jm1_campaign: row.jm1_name || '',
      jm1_workrecord: row.jm1_socialexecutionid,
      jm1_exceptiontype: exceptionType,
      jm1_severity: 'P1',
      jm1_reason: reason,
      jm1_resolutionstate: 'OPEN',
      jm1_resolution: 'Reconcile the exact native booking and schedule before releasing this API request.',
      jm1_authorityrequired: 'JM1 marketing runtime operator',
      jm1_createdat: nowIso,
      jm1_idempotencykey: `${row.jm1_socialexecutionid}:native-booking-${stale ? 'stale' : 'conflict'}:${reservation.jm1_socialexecutionid}`
    } : null
  };
}

export function reservationReadbackComplete(response) {
  return !response?.['@odata.nextLink'];
}
