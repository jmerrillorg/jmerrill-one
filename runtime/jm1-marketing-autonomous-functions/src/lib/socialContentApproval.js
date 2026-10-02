export function approvedContentForSocial(row, contentRows) {
  const key = String(row.jm1_idempotencykey || '');
  const [marker, stageAndPlatform] = key.split(':social:');
  const stage = stageAndPlatform?.split(':')[0];
  if (!marker || !stage) return null;

  return contentRows.find((content) =>
    content.jm1_idempotencykey === `${marker}:content:${stage}`
    && content.jm1_publicreadystate === 'PASS'
  ) || null;
}
