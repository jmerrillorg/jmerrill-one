export function retentionCutoff(now) {
  const cutoff = new Date(now);
  cutoff.setUTCFullYear(cutoff.getUTCFullYear() - 1);
  return cutoff;
}

export function eligibleForDeletion(row, cutoff) {
  return Boolean(
    row.jm1_closedat &&
    new Date(row.jm1_closedat) <= cutoff &&
    !row.jm1_retentionhold &&
    !row.jm1_transferredat &&
    !row.jm1_authoritativerecord
  );
}
