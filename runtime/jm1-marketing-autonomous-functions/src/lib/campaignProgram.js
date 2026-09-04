import { createHash } from 'node:crypto';

import { FEATURED_AUTHOR_AUTHORITIES, featuredAuthorMarker } from './runtime.js';

const DEFAULT_STAGE_POLICY = [
  {
    key: 'month_introduction',
    label: 'INTRO',
    earliestDayOffset: 0,
    archetypes: ['AUTHOR_EDITORIAL'],
    introStage: true,
    copyIntent: 'Introduce the featured author and the reason readers should pay attention this month.'
  },
  {
    key: 'title_discovery',
    label: 'TITLE_DISCOVERY',
    earliestDayOffset: 2,
    archetypes: ['BOOK_DISCOVERY', 'BOOK_AND_AUTHOR', 'TYPOGRAPHIC_PRE_COVER'],
    copyIntent: 'Help readers discover one eligible title without repeating the introductory post.'
  },
  {
    key: 'author_continuation',
    label: 'AUTHOR_CONTINUATION',
    earliestDayOffset: 6,
    archetypes: ['AUTHOR_EDITORIAL', 'BEHIND_THE_BOOK'],
    copyIntent: 'Continue the author relationship with a people-first angle.'
  },
  {
    key: 'mid_month_engagement',
    label: 'MID_MONTH_ENGAGEMENT',
    earliestDayOffset: 13,
    archetypes: ['READER_QUESTION', 'QUOTE_OR_THEME'],
    copyIntent: 'Invite reader reflection without over-promoting the same title or CTA.'
  },
  {
    key: 'additional_title_discovery',
    label: 'ADDITIONAL_TITLE_DISCOVERY',
    earliestDayOffset: 18,
    archetypes: ['EVERGREEN_DISCOVERY', 'TYPOGRAPHIC_PRE_COVER'],
    copyIntent: 'Introduce an additional eligible title angle using only resolved or cover-safe assets.'
  },
  {
    key: 'month_close_continuation',
    label: 'MONTH_CLOSE',
    earliestDayOffset: 27,
    archetypes: ['AUTHOR_EDITORIAL', 'READER_QUESTION'],
    copyIntent: 'Close the month with continuity and a clear next relationship step.'
  }
];

export function campaignMarker(campaign) {
  return String(campaign.jm1_idempotencykey || '').replace(/:campaign$/, '');
}

export function resolveCampaignProgram(campaign, nowIso) {
  const start = dateOrNull(campaign.jm1_start);
  const stop = dateOrNull(campaign.jm1_stop);
  const type = normalize(campaign.jm1_campaigntype);
  const program = normalize(campaign.jm1_program);
  const isFeaturedAuthor = type.includes('featured_author') || program.includes('featured') || program.includes('author');

  if (!isFeaturedAuthor) {
    return {
      ok: false,
      reason: 'UNSUPPORTED_CAMPAIGN_PROGRAM',
      programType: campaign.jm1_program || campaign.jm1_campaigntype || ''
    };
  }

  return {
    ok: true,
    program: 'MONTHLY_FEATURED_AUTHOR',
    branch: campaign.jm1_branch || 'J Merrill Publishing',
    campaignName: campaign.jm1_name || '',
    campaignMonth: start ? start.toISOString().slice(0, 7) : 'UNKNOWN',
    featuredEntity: campaign.jm1_subject || campaign.jm1_name || '',
    audience: campaign.jm1_audience || 'Publishing audience',
    cta: campaign.jm1_cta || 'Follow J Merrill Publishing for Featured Author updates.',
    start,
    stop,
    temporalAuthority: resolveFeaturedAuthorTemporalAuthority(campaign, nowIso),
    titleLifecycle: resolveTitleLifecycle(campaign),
    evaluatedAt: nowIso,
    stages: DEFAULT_STAGE_POLICY
  };
}

export function resolveFeaturedAuthorTemporalAuthority(campaign, nowIso) {
  const campaignMonth = dateOrNull(campaign.jm1_start)?.toISOString().slice(0, 7) || monthFromText(campaign.jm1_name) || 'UNKNOWN';
  const subject = campaign.jm1_subject || campaign.jm1_name || '';
  const branch = campaign.jm1_branch || 'J Merrill Publishing';
  const known = FEATURED_AUTHOR_AUTHORITIES.find((authority) =>
    authority.branch === branch
    && authority.month === campaignMonth
    && normalize(subject).includes(normalize(authority.author).split('_')[0])
  ) || FEATURED_AUTHOR_AUTHORITIES.find((authority) =>
    authority.branch === branch
    && authority.month === campaignMonth
    && normalize(authority.author).includes(normalize(subject).split('_')[0])
  );
  const startsAt = dateOrNull(known?.startsAt) || dateOrNull(campaign.jm1_start);
  const stopsAt = dateOrNull(known?.stopsAt) || dateOrNull(campaign.jm1_stop);
  const now = dateOrNull(nowIso) || new Date();
  const marker = known ? featuredAuthorMarker(known) : campaignMarker(campaign);

  if (startsAt && now < startsAt) {
    return {
      state: 'FUTURE_NEXT_MONTH_PRESTAGED',
      campaignMonth,
      currentMonthReplacementAllowed: false,
      preStageAllowed: true,
      marker,
      reason: 'Featured Author campaign starts after the evaluation date; preserve as future/pre-staged authority.'
    };
  }
  if (startsAt && stopsAt && now >= startsAt && now <= stopsAt) {
    return {
      state: 'ACTIVE_CURRENT_MONTH',
      campaignMonth,
      currentMonthReplacementAllowed: true,
      preStageAllowed: true,
      marker,
      reason: 'Featured Author campaign is inside its governed calendar month.'
    };
  }
  if (stopsAt && now > stopsAt) {
    return {
      state: 'PAST_CONCLUDED_MONTH',
      campaignMonth,
      currentMonthReplacementAllowed: false,
      preStageAllowed: false,
      marker,
      reason: 'Featured Author campaign month has concluded.'
    };
  }
  return {
    state: 'TEMPORAL_AUTHORITY_UNKNOWN',
    campaignMonth,
    currentMonthReplacementAllowed: false,
    preStageAllowed: false,
    marker,
    reason: 'Campaign start/stop dates are not sufficient to assign current-month authority.'
  };
}

export function resolveTitleLifecycle(campaign) {
  const text = `${campaign.jm1_name || ''}\n${campaign.jm1_subject || ''}\n${campaign.jm1_program || ''}\n${campaign.jm1_cta || ''}`;
  return {
    theShift: /shift/i.test(text) || /Sean A Crowley/i.test(text)
      ? 'NEW_RECENTLY_RELEASED_NOT_BACKLIST_NOT_DRAFT'
      : 'NOT_APPLICABLE',
    strategiesForSuccess: /strategies/i.test(text) || /Sean A Crowley/i.test(text)
      ? 'SEPTEMBER_22_2026_RELEASE_LIFECYCLE_PRIORITY'
      : 'NOT_APPLICABLE'
  };
}

export function resolveStageDecision({ campaign, contentRows, creativeRows, socialRows, journeyRows, exceptionRows, nowIso }) {
  const program = resolveCampaignProgram(campaign, nowIso);
  if (!program.ok) return { program, decision: 'DO_NOTHING', reason: program.reason };

  const completedStages = [];
  const materializedStages = [];
  const blockedStages = [];
  for (const stage of program.stages) {
    const stageRows = rowsForStage(stage.key, { contentRows, creativeRows, socialRows });
    if (stageRows.length > 0) materializedStages.push(stage.key);
    if (stageRows.some(isCompletedRow)) completedStages.push(stage.key);
    if (stageRows.some(isBlockedRow)) blockedStages.push(stage.key);
  }

  const introStage = program.stages.find((stage) => stage.introStage);
  const introRows = introStage ? rowsForStage(introStage.key, { contentRows, creativeRows, socialRows }) : [];
  const introEligible = !introRows.some((row) => {
    const state = String(row.jm1_status || row.jm1_publicreadystate || row.jm1_state || '').toUpperCase();
    return ['SCHEDULED_VERIFIED', 'PUBLISHED_VERIFIED', 'COMPLETED', 'PASS'].includes(state);
  });

  const lastPublicExecution = latestSocialExecution(socialRows);
  const fatigue = evaluateFatigue({ socialRows, contentRows, nowIso });
  const activeTitleLimitations = detectTitleLimitations(exceptionRows);
  const socialReady = socialRows.some((row) => ['facebook', 'instagram'].includes(row.jm1_platform) && row.jm1_platformpostid);
  const dynamicsReady = journeyRows.some((row) => row.jm1_dynamicsjourneyid && /PROVEN|IMPLEMENTED|ACTIVE|COMPLETE/i.test(row.jm1_state || ''));
  const pendingStage = program.stages.find((stage) => !materializedStages.includes(stage.key));
  const blockedActiveStage = program.stages.find((stage) => blockedStages.includes(stage.key));

  let nextStage = pendingStage || null;
  let controlDecision = nextStage ? 'GENERATE_NEXT_STAGE' : 'WAIT';
  let reason = nextStage
    ? 'Next configured stage is missing materialized content/creative/social children.'
    : 'All configured stages already have materialized work; wait for execution/readback.';

  if (program.temporalAuthority.state === 'FUTURE_NEXT_MONTH_PRESTAGED') {
    controlDecision = 'OBSERVE_FUTURE_PRESTAGE';
    reason = 'Future Featured Author authority is valid for pre-staging, but it must not replace the active current-month author.';
    nextStage = null;
  } else if (program.temporalAuthority.state === 'PAST_CONCLUDED_MONTH') {
    controlDecision = 'OBSERVE_CONCLUDED_MONTH';
    reason = 'Featured Author month is concluded; do not generate replacement current-month content.';
    nextStage = null;
  } else if (program.temporalAuthority.state !== 'ACTIVE_CURRENT_MONTH') {
    controlDecision = 'HOLD_TEMPORAL_AUTHORITY_UNKNOWN';
    reason = program.temporalAuthority.reason;
    nextStage = null;
  }

  if (fatigue.result === 'DO_NOTHING') {
    controlDecision = 'DO_NOTHING';
    reason = fatigue.reason;
    nextStage = null;
  } else if (!nextStage && blockedActiveStage) {
    controlDecision = 'RESOLVE_EXCEPTION';
    reason = `${blockedActiveStage.label} has held child work that must be resolved before progression.`;
    nextStage = blockedActiveStage;
  }

  const earliestExecutionAt = nextStage ? stageDate(program.start, nextStage.earliestDayOffset, nowIso) : null;

  return {
    program,
    currentStage: blockedActiveStage?.label || lastStageLabel(program.stages, materializedStages) || 'NONE',
    nextEligibleStage: nextStage?.label || 'NONE',
    nextStageKey: nextStage?.key || '',
    earliestExecutionAt,
    controlDecision,
    reason,
    introEligible,
    completedStages,
    materializedStages,
    activeTitleLimitations,
    lastPublicExecution,
    fatigue,
    readiness: {
      dynamicsReady,
      socialReady,
      exceptionsOpen: exceptionRows.filter((row) => !/RESOLVED|CLOSED/i.test(row.jm1_resolutionstate || '')).length,
      journeyRows: journeyRows.length,
      socialRows: socialRows.length,
      creativeRows: creativeRows.length,
      contentRows: contentRows.length
    }
  };
}

export function buildContentWork({ campaign, decision, campaignBind }) {
  const subject = campaign.jm1_subject || 'Featured Author';
  const stageKey = decision.nextStageKey;
  const stage = decision.program.stages.find((item) => item.key === stageKey);
  const intent = stage?.copyIntent || 'Create people-first campaign content.';
  return {
    jm1_name: `${subject} ${sentenceCase(stageKey)}`,
    jm1_branch: decision.program.branch,
    jm1_stage: stageKey,
    jm1_audience: decision.program.audience,
    jm1_copybrief: [
      `Program: ${decision.program.program}`,
      `Stage: ${stage?.label || stageKey}`,
      `Featured entity: ${subject}`,
      `Audience intent: ${intent}`,
      `Branch voice: people-first, why-first, publishing-centered`,
      `Approved CTA: ${decision.program.cta}`,
      'Platform requirement: Facebook, Instagram, and LinkedIn child execution rows after PublicReady PASS',
      `Journey requirement: ${campaign.jm1_journeyrequirement || 'Controlled relationship journey required'}`
    ].join('\n'),
    jm1_draftcopy: `${subject} remains the focus of this Featured Author stage. ${intent} ${decision.program.cta}`,
    jm1_publicreadystate: 'PASS',
    jm1_idempotencykey: `${campaignMarker(campaign)}:content:${stageKey}`,
    ...campaignBind
  };
}

export function selectCreativeArchetype({ stageKey, recentCreativeRows, assetState, platform = 'meta' }) {
  const stage = DEFAULT_STAGE_POLICY.find((item) => item.key === stageKey) || DEFAULT_STAGE_POLICY[0];
  const recentArchetypes = recentCreativeRows
    .map((row) => archetypeFromAssetPath(row.jm1_assetpath))
    .filter(Boolean);
  const candidates = stage.archetypes.filter((archetype) => {
    if (archetype === 'BOOK_DISCOVERY' || archetype === 'BOOK_AND_AUTHOR') return assetState.aPortraitCoverApproved;
    if (archetype === 'AUTHOR_EDITORIAL') return assetState.authorPortraitApproved;
    if (archetype === 'TYPOGRAPHIC_PRE_COVER') return true;
    return true;
  });
  return candidates.find((candidate) => !recentArchetypes.includes(candidate)) || candidates[0] || 'TYPOGRAPHIC_PRE_COVER';
}

export function buildCreativeArtifact({ campaign, content, archetype, assetState, forceLogoFailure = false }) {
  const stage = content.jm1_stage;
  const subject = campaign.jm1_subject || 'Featured Author';
  const logoHash = forceLogoFailure ? '' : assetState.officialLogoHash;
  const svg = [
    '<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080" viewBox="0 0 1080 1080" role="img">',
    '<rect width="1080" height="1080" fill="#111111"/>',
    '<rect x="64" y="64" width="952" height="952" fill="#ffffff" opacity="0.06"/>',
    forceLogoFailure ? '' : '<text x="78" y="146" fill="#ffffff" font-family="Arial, Helvetica, sans-serif" font-size="42" font-weight="700">J MERRILL</text>',
    `<text x="78" y="276" fill="#f4b400" font-family="Arial, Helvetica, sans-serif" font-size="38" font-weight="700">${escapeXml(archetype.replaceAll('_', ' '))}</text>`,
    `<text x="78" y="388" fill="#ffffff" font-family="Arial, Helvetica, sans-serif" font-size="72" font-weight="800">${escapeXml(subject)}</text>`,
    `<text x="78" y="508" fill="#ffffff" font-family="Arial, Helvetica, sans-serif" font-size="46" font-weight="700">${escapeXml(sentenceCase(stage))}</text>`,
    '<text x="78" y="642" fill="#d8d8d8" font-family="Arial, Helvetica, sans-serif" font-size="34">Helping Authors Help Themselves begins with</text>',
    '<text x="78" y="696" fill="#d8d8d8" font-family="Arial, Helvetica, sans-serif" font-size="34">clear, careful invitations into the work.</text>',
    '<text x="78" y="928" fill="#ffffff" font-family="Arial, Helvetica, sans-serif" font-size="32" font-weight="700">J Merrill Publishing</text>',
    '</svg>'
  ].join('');
  return {
    svg,
    sha256: createHash('sha256').update(svg).digest('hex'),
    logoHash,
    dimensions: '1080x1080',
    assetPath: `runtime-generated://jm1/${campaignMarker(campaign)}/${stage}/${archetype}.svg`,
    publicReady: publicReadyGate({ svg, campaign, content, archetype, logoHash, assetState })
  };
}

export function publicReadyGate({ svg, campaign, content, archetype, logoHash, assetState }) {
  const failures = [];
  if (!logoHash || logoHash !== assetState.officialLogoHash) failures.push('OFFICIAL_LOGO_REQUIRED');
  if (/registry|governed service definition|compliance gate|SKU catalog/i.test(svg)) failures.push('INTERNAL_VOCABULARY_EXPOSED');
  if (/fake cover|placeholder cover/i.test(svg)) failures.push('FAKE_COVER_BLOCKED');
  if (!String(svg).includes(campaign.jm1_subject || '')) failures.push('AUTHOR_ACCURACY_REQUIRED');
  if (!String(content.jm1_draftcopy || '').includes(campaign.jm1_subject || '')) failures.push('COPY_AUTHOR_ACCURACY_REQUIRED');
  if (!assetState.aPortraitCoverApproved && ['BOOK_DISCOVERY', 'BOOK_AND_AUTHOR'].includes(archetype)) failures.push('TITLE_COVER_NOT_APPROVED_FOR_ARCHETYPE');
  return {
    state: failures.length === 0 ? 'PASS' : 'REWORK',
    failures
  };
}

export function inferAssetState(exceptionRows) {
  const text = exceptionRows.map((row) => `${row.jm1_name || ''} ${row.jm1_resolutionstate || ''} ${row.jm1_resolution || ''}`).join('\n');
  return {
    officialLogoHash: 'a7ab3ad897c2ae3e16f63c89b582a434d1b7f0442ab559ccd610312e8c9e912a',
    officialLogoApproved: true,
    authorPortraitApproved: /author portrait.*RESOLVED|author_headshot/i.test(text),
    aPortraitCoverApproved: /A Portrait of Paradise cover is resolved|PARTIAL_RESOLVED/i.test(text),
    theGeneralsWillCoverState: /General.s Will/i.test(text) ? 'TITLE_MARKETING_ELIGIBLE_WITHOUT_COVER' : 'UNKNOWN'
  };
}

function evaluateFatigue({ socialRows, contentRows, nowIso }) {
  const now = new Date(nowIso);
  const recentPublished = socialRows.filter((row) => {
    const date = dateOrNull(row.jm1_actualschedule || row.jm1_verifiedat);
    return date && now.getTime() - date.getTime() < 7 * 24 * 60 * 60 * 1000 && /PUBLISHED_VERIFIED/i.test(row.jm1_status || '');
  });
  const introRepeated = contentRows.some((row) => /month_introduction|intro/i.test(row.jm1_stage || '')) && recentPublished.some((row) => /intro/i.test(row.jm1_idempotencykey || ''));
  if (introRepeated) return { result: 'DO_NOTHING', reason: 'Recent introduction already exists; intro repetition blocked.' };
  return {
    result: 'GENERATE_NEXT_STAGE',
    reason: recentPublished.length > 0
      ? 'Recent public output exists, but no configured repetition/fatigue threshold blocks a future-stage materialization.'
      : 'No recent public output blocks future-stage materialization.'
  };
}

function detectTitleLimitations(exceptionRows) {
  const joined = exceptionRows.map((row) => `${row.jm1_name || ''} ${row.jm1_resolution || ''}`).join('\n');
  return {
    theGeneralsWillCover: /General.s Will/i.test(joined) ? 'TITLE_MARKETING_ELIGIBLE_WITHOUT_COVER' : 'UNKNOWN',
    coverDependentArchetypes: /General.s Will/i.test(joined) ? 'HELD' : 'UNKNOWN'
  };
}

function rowsForStage(stageKey, groups) {
  return [...groups.contentRows, ...groups.creativeRows, ...groups.socialRows]
    .filter((row) => String(row.jm1_stage || row.jm1_idempotencykey || '').includes(stageKey));
}

function isCompletedRow(row) {
  const state = String(row.jm1_status || row.jm1_publicreadystate || row.jm1_state || '').toUpperCase();
  return ['PUBLISHED_VERIFIED', 'SCHEDULED_VERIFIED', 'COMPLETED', 'PASS'].includes(state);
}

function isBlockedRow(row) {
  const state = String(row.jm1_status || row.jm1_publicreadystate || row.jm1_state || '').toUpperCase();
  return /HELD|WAIT|EXCEPTION|REWORK|MISSING/.test(state);
}

function latestSocialExecution(rows) {
  return rows
    .filter((row) => row.jm1_actualschedule || row.jm1_verifiedat)
    .sort((a, b) => new Date(b.jm1_actualschedule || b.jm1_verifiedat) - new Date(a.jm1_actualschedule || a.jm1_verifiedat))
    .map((row) => ({
      id: row.jm1_socialexecutionid,
      platform: row.jm1_platform,
      status: row.jm1_status,
      stage: stageFromKey(row.jm1_idempotencykey),
      timestamp: row.jm1_actualschedule || row.jm1_verifiedat
    }))[0] || null;
}

function lastStageLabel(stages, materializedStages) {
  const stage = [...stages].reverse().find((item) => materializedStages.includes(item.key));
  return stage?.label || null;
}

function stageDate(start, offset, nowIso) {
  const base = start || new Date(nowIso);
  const out = new Date(base);
  out.setUTCDate(out.getUTCDate() + offset);
  out.setUTCHours(14, 0, 0, 0);
  return out.toISOString();
}

function archetypeFromAssetPath(path) {
  return String(path || '').match(/AUTHOR_EDITORIAL|BOOK_DISCOVERY|BOOK_AND_AUTHOR|QUOTE_OR_THEME|BEHIND_THE_BOOK|READER_QUESTION|NEW_RELEASE|EVERGREEN_DISCOVERY|TYPOGRAPHIC_PRE_COVER/)?.[0] || '';
}

function stageFromKey(key) {
  return String(key || '').split(':social:')[1]?.split(':')[0] || '';
}

function sentenceCase(value) {
  return String(value || '')
    .replaceAll('_', ' ')
    .replace(/\w\S*/g, (part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase());
}

function normalize(value) {
  return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '_');
}

function monthFromText(value) {
  const lower = String(value || '').toLowerCase();
  const year = lower.match(/20\d{2}/)?.[0] || '2026';
  const month = [
    ['january', '01'],
    ['february', '02'],
    ['march', '03'],
    ['april', '04'],
    ['may', '05'],
    ['june', '06'],
    ['july', '07'],
    ['august', '08'],
    ['september', '09'],
    ['october', '10'],
    ['november', '11'],
    ['december', '12']
  ].find(([name]) => lower.includes(name))?.[1];
  return month ? `${year}-${month}` : '';
}

function dateOrNull(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function escapeXml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}
