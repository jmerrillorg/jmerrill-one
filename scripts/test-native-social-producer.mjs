import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildNativeSocialCreative,
  buildReviewedNativeSocialContent,
  isApprovedNativeSocialCampaign,
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
  const existing = [
    { jm1_branch: 'J Merrill One', jm1_platform: 'facebook', jm1_requesteddestination: branchDestinations.facebook,
      jm1_status: 'NATIVE_BOOKED_VERIFIED', jm1_requestedschedule: '2026-10-13T14:00:00Z' },
    { jm1_branch: 'J Merrill One', jm1_platform: 'facebook', jm1_requesteddestination: branchDestinations.facebook,
      jm1_status: 'PUBLIC_READY_SCHEDULED_ELIGIBLE', jm1_requestedschedule: '2026-10-20T14:00:00Z' },
    { jm1_branch: 'J Merrill One', jm1_platform: 'instagram', jm1_requesteddestination: branchDestinations.instagram,
      jm1_status: 'NATIVE_BOOKED_VERIFIED', jm1_requestedschedule: '2026-10-13T14:00:00Z' },
    { jm1_branch: 'J Merrill One', jm1_platform: 'instagram', jm1_requesteddestination: 'wrong-account',
      jm1_status: 'NATIVE_BOOKED_VERIFIED', jm1_requestedschedule: '2026-10-20T14:00:00Z' }
  ];
  const result = planNativeSocialGaps({ campaign: one, socialRows: existing, nowIso: '2026-10-13T15:00:00Z', destinationByPlatform: branchDestinations });
  assert.ok(result.length > 0);
  assert.ok(result.every((item) => item.platforms.includes('instagram') || item.platforms.includes('linkedin')));
  assert.ok(result.every((item) => item.scheduledAt >= '2026-10-13T15:00:00Z' && item.scheduledAt < '2026-10-27T15:00:00Z'));
  assert.equal(result.some((item) => item.platforms.includes('facebook') && item.weekKey === '2026-10-12'), true);
  const repeated = planNativeSocialGaps({ campaign: one, socialRows: [...existing,
    ...result.flatMap((item) => item.platforms.map((platform) => ({ jm1_branch: one.jm1_branch, jm1_platform: platform,
      jm1_requesteddestination: branchDestinations[platform], jm1_status: 'PUBLIC_READY_SCHEDULED_ELIGIBLE',
      jm1_requestedschedule: item.scheduledAt, jm1_idempotencykey: `${one.jm1_idempotencykey.replace(/:campaign$/, '')}:social:rolling-${item.slotKey}:${platform}` })))],
  approvedRequestMarkers: [one.jm1_idempotencykey.replace(/:campaign$/, '')],
  nowIso: '2026-10-13T15:00:00Z', destinationByPlatform: branchDestinations });
  assert.deepEqual(repeated, []);
  assert.deepEqual(planNativeSocialGaps({ campaign: one, socialRows: existing, readbackComplete: false,
    nowIso: '2026-10-13T15:00:00Z', destinationByPlatform: branchDestinations }), []);
});

test('coverage planning moves a slot when a verified booking already occupies its candidate day', () => {
  const one = campaign('J Merrill One');
  const branchDestinations = destinations['J Merrill One'];
  const existing = ['facebook', 'instagram', 'linkedin'].map((platform) => ({
    jm1_branch: one.jm1_branch,
    jm1_platform: platform,
    jm1_requesteddestination: branchDestinations[platform],
    jm1_status: 'NATIVE_BOOKED_VERIFIED',
    jm1_requestedschedule: '2026-10-13T14:00:00Z'
  }));
  const plans = planNativeSocialGaps({ campaign: one, socialRows: existing, nowIso: '2026-10-12T12:00:00Z', destinationByPlatform: branchDestinations });
  const currentWeek = plans.filter((item) => item.weekKey === '2026-10-12');
  assert.equal(currentWeek.length, 1);
  assert.equal(currentWeek[0].slot, 2);
  assert.deepEqual(currentWeek[0].platforms, ['facebook', 'instagram', 'linkedin']);
  assert.equal(currentWeek[0].scheduledAt, '2026-10-16T18:00:00.000Z');
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
  assert.equal(withoutApproval.find((item) => item.weekKey === '2026-10-12' && item.platforms.includes('facebook'))?.slot, 1);
  const withApproval = planNativeSocialGaps({ campaign: one, socialRows: [heldCampaignRequest], approvedRequestMarkers: ['held-author-campaign'], nowIso: '2026-10-12T12:00:00Z', destinationByPlatform: branchDestinations });
  assert.equal(withApproval.find((item) => item.weekKey === '2026-10-12' && item.platforms.includes('facebook'))?.slot, 2);
});

test('scheduled timestamps preserve Eastern wall-clock time across daylight transition', () => {
  const before = nativeSocialScheduledAt('rolling-2026-10-26-1', 'facebook');
  const after = nativeSocialScheduledAt('rolling-2026-11-02-1', 'facebook');
  assert.equal(before, '2026-10-27T14:00:00.000Z');
  assert.equal(nativeSocialScheduledAt('rolling-2026-10-26-2', 'facebook'), '2026-10-30T18:00:00.000Z');
  assert.equal(after, '2026-11-03T15:00:00.000Z');
  assert.equal(nativeSocialScheduledAt('rolling-2026-10-12-1', 'facebook'), '2026-10-13T14:00:00.000Z');
});
