import assert from 'node:assert/strict';
import {
  captionFingerprint,
  matchingNativeReservation,
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
process.stdout.write('native reservation guard: 12 assertions passed\n');
