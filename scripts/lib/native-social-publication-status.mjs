const recordableStatuses = new Set([
  'NATIVE_BOOKED_VERIFIED',
  'NATIVE_BOOKING_PENDING',
  'NATIVE_RESERVATION_VERIFIED',
  'PUBLISHED_VERIFIED'
]);

export function canReconcileNativePublication(status) {
  return recordableStatuses.has(status);
}
