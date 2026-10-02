const EXECUTABLE_CAMPAIGN_STATE = 'PUBLIC_EXECUTION_APPROVED';

export function approvedCampaignForSocial(marker, campaigns) {
  if (!marker || !Array.isArray(campaigns) || campaigns.length !== 1) return null;
  const campaign = campaigns[0];
  return campaign.jm1_idempotencykey === `${marker}:campaign`
    && campaign.jm1_branch === 'J Merrill Publishing'
    && campaign.jm1_state === EXECUTABLE_CAMPAIGN_STATE
    ? campaign
    : null;
}
