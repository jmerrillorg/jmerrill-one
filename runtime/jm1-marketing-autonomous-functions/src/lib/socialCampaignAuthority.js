import { isApprovedNativeSocialCampaign } from './nativeSocialProgram.js';

const EXECUTABLE_CAMPAIGN_STATE = 'PUBLIC_EXECUTION_APPROVED';

export function approvedCampaignForSocial(marker, campaigns, branchConfig = {}) {
  if (!marker || !Array.isArray(campaigns) || campaigns.length !== 1) return null;
  const campaign = campaigns[0];
  if (campaign.jm1_idempotencykey !== `${marker}:campaign`
    || campaign.jm1_state !== EXECUTABLE_CAMPAIGN_STATE
    || !Object.values(branchConfig).some((branch) => branch.active && branch.branchName === campaign.jm1_branch)) return null;
  if (campaign.jm1_campaigntype === 'native_social') return isApprovedNativeSocialCampaign(campaign) ? campaign : null;
  return campaign.jm1_campaigntype === 'featured_author_month' && campaign.jm1_branch === 'J Merrill Publishing'
    ? campaign
    : null;
}
