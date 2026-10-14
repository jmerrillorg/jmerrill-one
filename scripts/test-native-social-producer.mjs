import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildNativeSocialCreative,
  buildReviewedNativeSocialContent,
  isApprovedNativeSocialCampaign,
  matchesApprovedNativeSocialContent,
  nativeSocialChannelGaps,
  nativeSocialDestinationsForBranch,
  nativeSocialScheduledAt,
  planNativeSocialGaps
} from '../runtime/jm1-marketing-autonomous-functions/src/lib/nativeSocialProgram.js';
import { approvedCampaignForSocial } from '../runtime/jm1-marketing-autonomous-functions/src/lib/socialCampaignAuthority.js';
import { approvedContentForSocial } from '../runtime/jm1-marketing-autonomous-functions/src/lib/socialContentApproval.js';

const branches = ['J Merrill One', 'J Merrill Publishing', 'J Merrill Financial'];
const destinations = {
  'J Merrill One': { facebook: '101196349506906', instagram: '17841456905118441', linkedin: '106683183' },
  'J Merrill Publishing': { facebook: '307480763084670', instagram: '17841410046020869', linkedin: '13048648' },
  'J Merrill Financial': { facebook: '1270611542802820', instagram: '17841438473100276', linkedin: '146207089' }
};
function campaign(branch, state = 'PUBLIC_EXECUTION_APPROVED') {
  return { jm1_branch: branch, jm1_campaigntype: 'native_social', jm1_state: state,
    jm1_idempotencykey: `test:${branch.replaceAll(' ', '-').toLowerCase()}:campaign`, jm1_name: `${branch} rolling social` };
}
const branchConfig = Object.fromEntries(branches.map((branch, index) => [`brand${index}`, { active: true, branchName: branch }]));

test('approved native_social authority is exact, branch scoped, and fail closed', () => {
  const one = campaign('J Merrill One');
  assert.equal(isApprovedNativeSocialCampaign(one), true);
  assert.equal(isApprovedNativeSocialCampaign({ ...one, jm1_state: 'HOLD' }), false);
  assert.equal(isApprovedNativeSocialCampaign({ ...one, jm1_branch: 'J Merrill Financial LLC' }), false);
  assert.equal(approvedCampaignForSocial('test:j-merrill-one', [one], branchConfig), one);
  assert.equal(approvedCampaignForSocial('test:j-merrill-one', [{ ...one, jm1_state: 'HOLD' }], branchConfig), null);
  assert.equal(approvedCampaignForSocial('test:j-merrill-one', [{ ...one, jm1_idempotencykey: 'other:campaign' }], branchConfig), null);
});

test('dispatch content must match the social row branch, stage, and public-ready state', () => {
  const authority = campaign('J Merrill Financial');
  const generated = buildReviewedNativeSocialContent({ campaign: authority, weekKey: '2026-10-12', slot: 1, nowIso: '2026-10-13T15:00:00Z' });
  const row = { jm1_branch: 'J Merrill Financial', jm1_idempotencykey: `${authority.jm1_idempotencykey.replace(/:campaign$/, '')}:social:${generated.stage}:facebook` };
  const content = { jm1_branch: 'J Merrill Financial', jm1_stage: generated.stage, jm1_name: generated.template.title, jm1_draftcopy: generated.caption,
    jm1_copybrief: `${generated.provenance}; theme=${generated.template.theme}`,
    jm1_idempotencykey: `${authority.jm1_idempotencykey.replace(/:campaign$/, '')}:content:${generated.stage}`, jm1_publicreadystate: 'PASS' };
  assert.equal(approvedContentForSocial(row, [content], authority), content);
  assert.equal(approvedContentForSocial({ ...row, jm1_branch: 'J Merrill One' }, [content], authority), null);
  assert.equal(approvedContentForSocial(row, [{ ...content, jm1_publicreadystate: 'DRAFT' }], authority), null);
  assert.equal(approvedContentForSocial(row, [{ ...content, jm1_stage: 'other' }], authority), null);
  assert.equal(approvedContentForSocial(row, [{ ...content, jm1_draftcopy: 'unreviewed copy' }], authority), null);
});

test('each brand template passes only under approved campaign authority', async () => {
  for (const branch of branches) {
    const approved = campaign(branch);
    const generated = buildReviewedNativeSocialContent({ campaign: approved, weekKey: '2026-10-12', slot: 1, nowIso: '2026-10-13T15:00:00Z' });
    assert.equal(generated.ok, true, branch);
    assert.ok(generated.template.body.length > 80);
    assert.ok(generated.provenance.includes('APPROVED_TEMPLATE_SET:v1'));
    assert.match(generated.caption, /https:\/\//);
    assert.equal(buildReviewedNativeSocialContent({ campaign: campaign(branch, 'DRAFT'), weekKey: '2026-10-12', slot: 1, nowIso: '2026-10-13T15:00:00Z' }).ok, false);
    const creative = await buildNativeSocialCreative({ campaign: approved, content: { jm1_name: generated.template.title, jm1_stage: generated.stage,
      jm1_draftcopy: generated.caption, jm1_branch: branch, jm1_copybrief: `${generated.provenance}; theme=${generated.template.theme}` }, slot: generated.stage });
    assert.equal(creative.publicReady, 'PASS');
    assert.equal(creative.svg.includes('data:image/png;base64,'), true);
    assert.equal(creative.pngBytes.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
    assert.match(creative.sha256, /^[a-f0-9]{64}$/);
  }
});

test('Financial content avoids regulated, product, and unverified relationship claims', () => {
  for (const slot of [1, 2, 3, 4, 5, 6]) {
    const generated = buildReviewedNativeSocialContent({ campaign: campaign('J Merrill Financial'), weekKey: '2026-10-12', slot, nowIso: '2026-10-13T15:00:00Z' });
    assert.equal(generated.ok, true);
    assert.match(generated.template.body, /Educational information only/);
    assert.doesNotMatch(generated.template.body, /Blue Nebula|Marlan Gary|Precoa|Funeral Directors Life|guaranteed|portable|insurance coverage|legal advice/i);
  }
  const estate = buildReviewedNativeSocialContent({ campaign: campaign('J Merrill Financial'), weekKey: '2026-10-12', slot: 1, nowIso: '2026-10-13T15:00:00Z' });
  const funeral = buildReviewedNativeSocialContent({ campaign: campaign('J Merrill Financial'), weekKey: '2026-10-12', slot: 2, nowIso: '2026-10-13T15:00:00Z' });
  assert.equal(estate.template.theme, 'ESTATE_READINESS');
  assert.equal(funeral.template.theme, 'FUNERAL_PREPLANNING_EDUCATION');
});

test('coverage planning creates only exact-destination gaps, idempotently', () => {
  const one = campaign('J Merrill One');
  const branchDestinations = destinations['J Merrill One'];
  const existing = ['facebook', 'instagram', 'linkedin'].flatMap((platform) =>
    Array.from({ length: 14 }, (_, index) => ({
      jm1_branch: 'J Merrill One', jm1_platform: platform, jm1_requesteddestination: branchDestinations[platform],
      jm1_status: 'NATIVE_RESERVATION_VERIFIED', jm1_requestedschedule: nativeSocialScheduledAt(`daily-2026-10-${String(index + 14).padStart(2, '0')}`, platform)
    })));
  const result = planNativeSocialGaps({ campaign: one, socialRows: existing, nowIso: '2026-10-14T12:17:00Z', destinationByPlatform: branchDestinations });
  assert.equal(result.length, 1);
  assert.equal(result[0].dateKey, '2026-10-28');
  assert.deepEqual(result[0].platforms, ['facebook', 'instagram', 'linkedin']);
  const repeated = planNativeSocialGaps({ campaign: one, socialRows: [...existing,
    ...result.flatMap((item) => item.platforms.map((platform) => ({ jm1_branch: one.jm1_branch, jm1_platform: platform,
      jm1_requesteddestination: branchDestinations[platform], jm1_status: 'PUBLIC_READY_SCHEDULED_ELIGIBLE',
      jm1_requestedschedule: item.scheduleByPlatform[platform], jm1_idempotencykey: `${one.jm1_idempotencykey.replace(/:campaign$/, '')}:social:daily-${item.dateKey}:${platform}` })))],
  approvedRequestMarkers: [one.jm1_idempotencykey.replace(/:campaign$/, '')],
  nowIso: '2026-10-14T12:17:00Z', destinationByPlatform: branchDestinations });
  assert.deepEqual(repeated, []);
  assert.deepEqual(planNativeSocialGaps({ campaign: one, socialRows: existing, readbackComplete: false,
    nowIso: '2026-10-13T15:00:00Z', destinationByPlatform: branchDestinations }), []);
});

test('daily coverage planning creates only the exact missing channel and ignores other destinations', () => {
  const one = campaign('J Merrill One');
  const branchDestinations = destinations['J Merrill One'];
  const existing = Array.from({ length: 14 }, (_, index) => {
    const dateKey = `2026-10-${String(index + 14).padStart(2, '0')}`;
    return ['facebook', 'instagram', 'linkedin'].map((platform) => ({
      jm1_branch: one.jm1_branch, jm1_platform: platform, jm1_requesteddestination: branchDestinations[platform],
      jm1_status: 'NATIVE_BOOKED_VERIFIED', jm1_requestedschedule: nativeSocialScheduledAt(`daily-${dateKey}`, platform)
    }));
  }).flat();
  existing.push(...['facebook', 'instagram', 'linkedin'].map((platform) => ({
    jm1_branch: one.jm1_branch, jm1_platform: platform,
    jm1_requesteddestination: platform === 'instagram' ? 'wrong-account' : branchDestinations[platform],
    jm1_status: 'NATIVE_BOOKED_VERIFIED', jm1_requestedschedule: nativeSocialScheduledAt('daily-2026-10-28', platform)
  })));
  const plans = planNativeSocialGaps({ campaign: one, socialRows: existing, nowIso: '2026-10-14T12:17:00Z', destinationByPlatform: branchDestinations });
  assert.deepEqual(plans.map((item) => item.dateKey), ['2026-10-28']);
  assert.deepEqual(plans[0].platforms, ['instagram']);
});

test('disabled Financial Instagram is excluded without disabling Financial Facebook or LinkedIn', () => {
  const financial = campaign('J Merrill Financial');
  const channels = { ...destinations['J Merrill Financial'], instagram: null };
  const planned = planNativeSocialGaps({ campaign: financial, socialRows: [], nowIso: '2026-10-11T12:00:00Z', destinationByPlatform: channels });
  assert.ok(planned.length > 0);
  assert.ok(planned.every((slot) => !slot.platforms.includes('instagram')));
  assert.ok(planned.some((slot) => slot.platforms.includes('facebook')));
  assert.ok(planned.some((slot) => slot.platforms.includes('linkedin')));
});

test('disabled or unconfigured intended channels remain explicit blocked gaps, never executable destinations', () => {
  const financial = campaign('J Merrill Financial');
  const channels = { ...destinations['J Merrill Financial'], instagram: null };
  const gaps = nativeSocialChannelGaps(channels, { disabledPlatforms: ['instagram'] });
  assert.deepEqual(gaps, [{ platform: 'instagram', state: 'BLOCKED_GAP', reason: 'CHANNEL_DISABLED' }]);
  const planned = planNativeSocialGaps({ campaign: financial, socialRows: [], nowIso: '2026-10-11T12:00:00Z', destinationByPlatform: channels });
  assert.ok(planned.every((slot) => !slot.platforms.includes('instagram')));
  assert.deepEqual(nativeSocialChannelGaps({ facebook: 'page-id', instagram: null, linkedin: null }), [
    { platform: 'instagram', state: 'BLOCKED_GAP', reason: 'DESTINATION_NOT_CONFIGURED' },
    { platform: 'linkedin', state: 'BLOCKED_GAP', reason: 'DESTINATION_NOT_CONFIGURED' }
  ]);
  const unverifiedInstagram = { ...destinations['J Merrill Financial'], instagram: null };
  assert.deepEqual(nativeSocialChannelGaps(unverifiedInstagram, {
    blockedReasonByPlatform: { instagram: 'INSTAGRAM_GRAPH_BUSINESS_ID_UNVERIFIED' }
  }), [{ platform: 'instagram', state: 'BLOCKED_GAP', reason: 'INSTAGRAM_GRAPH_BUSINESS_ID_UNVERIFIED' }]);
  const unverifiedBranch = nativeSocialDestinationsForBranch({
    facebookPageId: '1270611542802820', instagramHandle: 'jmerrillfinancial', instagramEnabled: true,
    linkedinOrganizationId: '146207089'
  });
  assert.equal(unverifiedBranch.destinations.instagram, null);
  assert.deepEqual(unverifiedBranch.blockedChannelGaps, [{
    platform: 'instagram', state: 'BLOCKED_GAP', reason: 'INSTAGRAM_GRAPH_BUSINESS_ID_UNVERIFIED'
  }]);
  assert.ok(planNativeSocialGaps({ campaign: financial, socialRows: [], nowIso: '2026-10-11T12:00:00Z',
    destinationByPlatform: unverifiedBranch.destinations })
    .every((slot) => !slot.platforms.includes('instagram')));
  const disabledBranch = nativeSocialDestinationsForBranch({
    facebookPageId: '1270611542802820', instagramHandle: 'jmerrillfinancial', instagramEnabled: false,
    linkedinOrganizationId: '146207089'
  });
  assert.deepEqual(disabledBranch.blockedChannelGaps, [{
    platform: 'instagram', state: 'BLOCKED_GAP', reason: 'INSTAGRAM_DISABLED_AND_GRAPH_BUSINESS_ID_UNVERIFIED'
  }]);
  assert.equal(disabledBranch.destinations.instagram, null);
});

test('a scheduled-looking API request consumes cadence only under live-approved campaign authority', () => {
  const one = campaign('J Merrill One');
  const branchDestinations = destinations['J Merrill One'];
  const heldCampaignRequest = {
    jm1_branch: one.jm1_branch,
    jm1_platform: 'facebook',
    jm1_requesteddestination: branchDestinations.facebook,
    jm1_status: 'PUBLIC_READY_SCHEDULED_ELIGIBLE',
    jm1_requestedschedule: '2026-10-13T14:00:00Z',
    jm1_idempotencykey: 'held-author-campaign:social:feature-intro:facebook'
  };
  const withoutApproval = planNativeSocialGaps({ campaign: one, socialRows: [heldCampaignRequest], nowIso: '2026-10-12T12:00:00Z', destinationByPlatform: branchDestinations });
  assert.ok(withoutApproval.some((item) => item.dateKey === '2026-10-13' && item.platforms.includes('facebook')));
  const withApproval = planNativeSocialGaps({ campaign: one, socialRows: [heldCampaignRequest], approvedRequestMarkers: ['held-author-campaign'], nowIso: '2026-10-12T12:00:00Z', destinationByPlatform: branchDestinations });
  assert.ok(!withApproval.some((item) => item.dateKey === '2026-10-13' && item.platforms.includes('facebook')));
});

test('scheduled timestamps preserve Eastern wall-clock time across daylight transition', () => {
  const before = nativeSocialScheduledAt('rolling-2026-10-26-1', 'facebook');
  const after = nativeSocialScheduledAt('rolling-2026-11-02-1', 'facebook');
  assert.equal(before, '2026-10-27T14:00:00.000Z');
  assert.equal(nativeSocialScheduledAt('rolling-2026-10-26-2', 'facebook'), '2026-10-30T18:00:00.000Z');
  assert.equal(after, '2026-11-03T15:00:00.000Z');
  assert.equal(nativeSocialScheduledAt('rolling-2026-10-12-1', 'facebook'), '2026-10-13T14:00:00.000Z');
  assert.equal(nativeSocialScheduledAt('daily-2026-10-28', 'facebook'), '2026-10-28T14:00:00.000Z');
  assert.equal(nativeSocialScheduledAt('daily-2026-10-28', 'instagram'), '2026-10-28T15:00:00.000Z');
  assert.equal(nativeSocialScheduledAt('daily-2026-10-28', 'linkedin'), '2026-10-28T16:00:00.000Z');
  assert.equal(nativeSocialScheduledAt('daily-2026-11-02', 'facebook'), '2026-11-02T15:00:00.000Z');
});

test('daily content has durable date-keyed provenance and retains legacy content validation', () => {
  const one = campaign('J Merrill One');
  const generated = buildReviewedNativeSocialContent({ campaign: one, dateKey: '2026-10-28', nowIso: '2026-10-14T12:17:00Z' });
  assert.equal(generated.stage, 'daily-2026-10-28');
  const content = { jm1_branch: one.jm1_branch, jm1_stage: generated.stage, jm1_name: generated.template.title,
    jm1_draftcopy: generated.caption, jm1_copybrief: `${generated.provenance}; theme=${generated.template.theme}` };
  assert.equal(matchesApprovedNativeSocialContent(one, content), true);
});
