import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  captionFingerprint,
  buildNativeReservationHold,
  isActionableNativeReservationFailure,
  matchingNativeReservation,
  matchingNativeReservationDisposition,
  nativeReservationAliases,
  NATIVE_RESERVATION_STATUS,
  reservationReadbackComplete,
  VERIFIED_NATIVE_RESERVATION_STATUS
} from '../runtime/jm1-marketing-autonomous-functions/src/lib/nativeReservationGuard.js';

const row = {
  jm1_branch: 'J Merrill One',
  jm1_platform: 'instagram',
  jm1_requesteddestination: 'jmerrillone',
  jm1_requestedmediahash: 'a'.repeat(64)
};
const caption = 'Exact reserved copy';
const reservation = {
  ...row,
  jm1_requesteddestination: '@jmerrillone',
  jm1_status: NATIVE_RESERVATION_STATUS,
  jm1_captionversion: captionFingerprint(caption)
};

assert.equal(matchingNativeReservation(row, caption, [reservation]), reservation);
const sameSlotRow = { ...row, jm1_requestedschedule: '2026-10-13T14:00:00.000Z' };
const sameSlotReservation = { ...reservation, jm1_requestedschedule: '2026-10-13T14:00:00Z' };
assert.equal(matchingNativeReservationDisposition(sameSlotRow, caption, [sameSlotReservation]).disposition, 'EXACT_SLOT');
const sameSlotDifferentCaption = matchingNativeReservationDisposition(sameSlotRow, `${caption} changed`, [sameSlotReservation]);
assert.equal(sameSlotDifferentCaption.disposition, 'SLOT_CONFLICT');
assert.equal(sameSlotDifferentCaption.reservation, sameSlotReservation);
const sameSlotDifferentMedia = matchingNativeReservationDisposition({ ...sameSlotRow, jm1_requestedmediahash: 'b'.repeat(64) }, caption, [sameSlotReservation]);
assert.equal(sameSlotDifferentMedia.disposition, 'SLOT_CONFLICT');
assert.equal(matchingNativeReservationDisposition({ ...sameSlotRow, jm1_platform: 'facebook' }, caption, [sameSlotReservation]), null);
assert.equal(matchingNativeReservationDisposition({ ...sameSlotRow, jm1_branch: 'J Merrill Financial' }, caption, [sameSlotReservation]), null);
const movedSlot = matchingNativeReservationDisposition(sameSlotRow, caption, [{ ...sameSlotReservation,
  jm1_requestedschedule: '2026-10-14T14:00:00Z' }]);
assert.equal(movedSlot.disposition, 'SLOT_CONFLICT');
assert.equal(movedSlot.requestedSchedule, '2026-10-13T14:00:00.000Z');
assert.equal(movedSlot.reservedSchedule, '2026-10-14T14:00:00.000Z');
assert.equal(matchingNativeReservationDisposition(sameSlotRow, caption, [reservation]).disposition, 'SLOT_CONFLICT');
assert.equal(matchingNativeReservationDisposition(sameSlotRow, caption, [sameSlotReservation], undefined,
  '2026-10-13T14:00:01Z').disposition, 'STALE_SLOT');
const conflictHold = buildNativeReservationHold({ row: { ...sameSlotRow, jm1_socialexecutionid: 'api-row', jm1_branch: 'J Merrill One' },
  reservation: { jm1_socialexecutionid: 'native-row' }, disposition: 'SLOT_CONFLICT',
  requestedSchedule: '2026-10-13T14:00:00.000Z', reservedSchedule: '2026-10-14T14:00:00.000Z', nowIso: '2026-10-10T12:00:00Z' });
assert.equal(conflictHold.socialPatch.jm1_status, 'HELD_NATIVE_BOOKING_CONFLICT');
assert.equal(conflictHold.exception.jm1_exceptiontype, 'NATIVE_BOOKING_CONFLICT');
assert.equal(conflictHold.exception.jm1_resolutionstate, 'OPEN');
assert.equal(conflictHold.exception.jm1_idempotencykey, 'api-row:native-booking-conflict:native-row');
assert.ok(!conflictHold.exception.jm1_reason.includes(caption));
const duplicateHold = buildNativeReservationHold({ row: { jm1_socialexecutionid: 'api-row' },
  reservation: { jm1_socialexecutionid: 'native-row' }, disposition: 'EXACT_SLOT',
  requestedSchedule: '2026-10-13T14:00:00.000Z', reservedSchedule: '2026-10-13T14:00:00.000Z', nowIso: '2026-10-10T12:00:00Z' });
assert.equal(duplicateHold.socialPatch.jm1_status, 'HELD_NATIVE_BOOKING_DUPLICATE');
assert.equal(duplicateHold.exception, null);
const staleHold = buildNativeReservationHold({ row: { jm1_socialexecutionid: 'api-row', jm1_branch: 'J Merrill One' },
  reservation: { jm1_socialexecutionid: 'native-row' }, disposition: 'STALE_SLOT',
  requestedSchedule: '2026-10-13T14:00:00.000Z', reservedSchedule: '2026-10-13T14:00:00.000Z', nowIso: '2026-10-13T14:00:01Z' });
assert.equal(staleHold.socialPatch.jm1_status, 'HELD_NATIVE_BOOKING_STALE');
assert.equal(staleHold.exception.jm1_exceptiontype, 'NATIVE_BOOKING_STALE');
assert.equal(staleHold.exception.jm1_idempotencykey, 'api-row:native-booking-stale:native-row');
const bookedReservation = { ...reservation, jm1_status: 'NATIVE_BOOKED_VERIFIED' };
assert.equal(matchingNativeReservation(row, caption, [bookedReservation]), bookedReservation);
const facebookAliases = nativeReservationAliases({ id: '307480763084670', name: 'J Merrill Publishing Inc' });
const facebookRequest = { ...row, jm1_branch: 'J Merrill Publishing', jm1_platform: 'facebook', jm1_requesteddestination: 'J Merrill Publishing Inc' };
const facebookReservation = { ...reservation, ...facebookRequest, jm1_requesteddestination: '307480763084670', jm1_status: VERIFIED_NATIVE_RESERVATION_STATUS };
assert.equal(matchingNativeReservation(facebookRequest, caption, [facebookReservation], facebookAliases), facebookReservation);
const linkedinAliases = nativeReservationAliases({ id: '13048648', name: 'J Merrill Publishing, Inc.' });
const linkedinRequest = { ...facebookRequest, jm1_platform: 'linkedin', jm1_requesteddestination: 'J Merrill Publishing, Inc.' };
const linkedinReservation = { ...facebookReservation, ...linkedinRequest, jm1_requesteddestination: '13048648' };
assert.equal(matchingNativeReservation(linkedinRequest, caption, [linkedinReservation], linkedinAliases), linkedinReservation);
assert.equal(matchingNativeReservation(row, `${caption}!`, [reservation]), null);
assert.equal(matchingNativeReservation({ ...row, jm1_platform: 'facebook' }, caption, [reservation]), null);
assert.equal(matchingNativeReservation({ ...row, jm1_requestedmediahash: 'b'.repeat(64) }, caption, [reservation]), null);
assert.equal(matchingNativeReservation({ ...row, jm1_branch: 'J Merrill Financial' }, caption, [reservation]), null);
assert.equal(matchingNativeReservation(row, caption, [{ ...reservation, jm1_status: 'PUBLISHED_VERIFIED' }]), null);
assert.equal(matchingNativeReservation(row, caption, [{ ...reservation, jm1_status: VERIFIED_NATIVE_RESERVATION_STATUS }]).jm1_status, VERIFIED_NATIVE_RESERVATION_STATUS);
assert.equal(matchingNativeReservation({ ...facebookRequest, jm1_requesteddestination: '104395329284856' }, caption, [facebookReservation], facebookAliases), null);
assert.equal(reservationReadbackComplete({ value: [] }), true);
assert.equal(reservationReadbackComplete({ value: [], '@odata.nextLink': 'https://example.invalid/next' }), false);
assert.equal(isActionableNativeReservationFailure('NATIVE_BOOKING_CONFLICT'), true);
assert.equal(isActionableNativeReservationFailure('NATIVE_BOOKING_STALE'), true);
assert.equal(isActionableNativeReservationFailure('NATIVE_BOOKING_DUPLICATE_SUPPRESSED'), false);
const workerSource = await readFile(new URL('../runtime/jm1-marketing-autonomous-functions/src/functions/socialExecutionWorkerTimer.js', import.meta.url), 'utf8');
const reservationCheckIndex = workerSource.indexOf('const nativeReservation = matchingNativeReservationDisposition(');
const notDueCheckIndex = workerSource.indexOf('const scheduledFor = new Date(row.jm1_requestedschedule);');
assert.ok(reservationCheckIndex >= 0 && notDueCheckIndex > reservationCheckIndex,
  'future-dated API rows must reconcile native reservations before being skipped as not due');
process.stdout.write('native reservation guard: 39 assertions passed\n');
