import assert from 'node:assert/strict';
import { captionFingerprint, matchingNativeReservation, NATIVE_RESERVATION_STATUS } from '../runtime/jm1-marketing-autonomous-functions/src/lib/nativeReservationGuard.js';

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
assert.equal(matchingNativeReservation(row, `${caption}!`, [reservation]), null);
assert.equal(matchingNativeReservation({ ...row, jm1_platform: 'facebook' }, caption, [reservation]), null);
assert.equal(matchingNativeReservation({ ...row, jm1_requestedmediahash: 'b'.repeat(64) }, caption, [reservation]), null);
assert.equal(matchingNativeReservation({ ...row, jm1_branch: 'J Merrill Financial' }, caption, [reservation]), null);
assert.equal(matchingNativeReservation(row, caption, [{ ...reservation, jm1_status: 'PUBLISHED_VERIFIED' }]), null);
process.stdout.write('native reservation guard: 6 assertions passed\n');
