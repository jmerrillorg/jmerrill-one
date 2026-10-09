import { matchesApprovedNativeSocialContent } from './nativeSocialProgram.js';

export function approvedContentForSocial(row, contentRows, campaign = null) {
  const key = String(row.jm1_idempotencykey || '');
  const [marker, stageAndPlatform] = key.split(':social:');
  const stage = stageAndPlatform?.split(':')[0];
  if (!marker || !stage) return null;

  const content = contentRows.find((content) =>
    content.jm1_idempotencykey === `${marker}:content:${stage}`
    && content.jm1_branch === row.jm1_branch
    && content.jm1_stage === stage
    && content.jm1_publicreadystate === 'PASS'
  );
  if (!content) return null;
  if (campaign?.jm1_campaigntype === 'native_social' && !matchesApprovedNativeSocialContent(campaign, content)) return null;
  return content;
}
