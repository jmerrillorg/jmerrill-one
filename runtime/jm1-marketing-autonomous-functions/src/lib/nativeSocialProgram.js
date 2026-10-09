import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ASSET_DIR = join(dirname(fileURLToPath(import.meta.url)), '../assets/approved');
const BRAND = {
  'J Merrill One': {
    logo: 'jm1-one-logo.png',
    logoSha256: 'a7ab3ad897c2ae3e16f63c89b582a434d1b7f0442ab559ccd610312e8c9e912a',
    templates: [
      {
        theme: 'UMBRELLA_GUIDANCE',
        title: 'Start with the question',
        body: 'When a project spans different needs, start by naming the question you need answered and the next decision in front of you. J Merrill One brings distinct organizations together while each brand remains responsible for its own work.',
        link: 'https://www.jmerrill.one/',
        alt: 'J Merrill One brand mark above a simple three-step path: question, people, next decision.'
      },
      {
        theme: 'DIVISION_NAVIGATION',
        title: 'Find the right starting point',
        body: 'Publishing, Financial, Foundation, and Productions serve different purposes. Explore the J Merrill One divisions and choose the path that matches what you are looking for.',
        link: 'https://www.jmerrill.one/',
        alt: 'J Merrill One brand mark beside four labeled paths for Publishing, Financial, Foundation, and Productions.'
      },
      {
        theme: 'CROSS_COMPANY_GUIDANCE',
        title: 'Make the next step clear',
        body: 'A useful handoff begins with a clear question, the right destination, and an agreed next step. J Merrill One offers a starting point for finding the appropriate organization across its divisions.',
        link: 'https://www.jmerrill.one/',
        alt: 'J Merrill One brand mark above a clear handoff diagram with question, destination, and next step.'
      }
    ]
  },
  'J Merrill Publishing': {
    logo: 'jm1-publishing-logo.png',
    logoSha256: 'a7ab3ad897c2ae3e16f63c89b582a434d1b7f0442ab559ccd610312e8c9e912a',
    templates: [
      {
        theme: 'WRITER_TOOL',
        title: 'Bring better questions',
        body: 'Before your next manuscript conversation, write down the reader you hope to reach, what you want them to take away, and the questions you need answered. Clear questions help make a conversation more focused.',
        link: 'https://jmerrill.pub/books',
        alt: 'J Merrill Publishing mark beside a short checklist: reader, takeaway, questions.'
      },
      {
        theme: 'PUBLISHING_PRACTICE',
        title: 'A useful revision pass',
        body: 'During a revision, read one section for structure and another for clarity. Separating those passes can make it easier to notice what the reader needs at each point.',
        link: 'https://jmerrill.pub/books',
        alt: 'J Merrill Publishing mark above an open manuscript with two revision labels: structure and clarity.'
      },
      {
        theme: 'PUBLISHER_IDENTITY',
        title: 'Stories deserve thoughtful care',
        body: 'J Merrill Publishing works with books and the people who create them. Explore the catalog to learn about the titles currently available.',
        link: 'https://jmerrill.pub/books',
        alt: 'J Merrill Publishing mark above a simple row of abstract book spines.'
      }
    ]
  },
  'J Merrill Financial': {
    logo: 'jm1-financial-logo.png',
    logoSha256: '672b52cc3300a4cedcad342b0685cd094b6d7fd5f54d5b61361d8391d9642160',
    templates: [
      {
        theme: 'ESTATE_READINESS',
        title: 'Organize before you meet',
        body: 'Before an estate-planning conversation, gather the questions you want to ask and note where important records are kept. A qualified professional can explain which options fit your circumstances. Educational information only; not legal, tax, or insurance advice.',
        link: 'https://jmerrill.financial/',
        alt: 'J Merrill Financial mark beside a preparation list for questions, records, and people to include.'
      },
      {
        theme: 'FUNERAL_PREPLANNING_EDUCATION',
        title: 'Prepare questions for a funeral home',
        body: 'If your family is considering funeral preplanning, write down preferences and questions to discuss with the funeral home you choose. Ask that provider to explain its services and terms. Details vary by provider. Educational information only; not legal or insurance advice.',
        link: 'https://jmerrill.financial/',
        alt: 'J Merrill Financial mark above a neutral notepad with prompts: preferences, questions, chosen provider.'
      },
      {
        theme: 'FAMILY_PREPARATION',
        title: 'Make important records easier to find',
        body: 'Choose a consistent place for important planning records and let someone you trust know how to find them. Keep a list of the questions you want to raise with the appropriate professional. Educational information only; not legal, tax, or insurance advice.',
        link: 'https://jmerrill.financial/',
        alt: 'J Merrill Financial mark beside a folder and a three-item preparation checklist.'
      }
    ]
  }
};

const PROHIBITED_FINANCIAL = /guarantee|guaranteed|best price|insurance coverage|policy will|portable|portability|we are your funeral home|our funeral home|legal advice|tax advice|partner(?:ship)? with|Blue Nebula|Marlan Gary|Precoa|Funeral Directors Life|FDL|insurance product/i;

export function isApprovedNativeSocialCampaign(campaign) {
  return campaign?.jm1_campaigntype === 'native_social'
    && campaign?.jm1_state === 'PUBLIC_EXECUTION_APPROVED'
    && Object.hasOwn(BRAND, campaign?.jm1_branch);
}

export function nativeSocialCampaignMarker(campaign) {
  return String(campaign?.jm1_idempotencykey || '').replace(/:campaign$/, '');
}

export function buildReviewedNativeSocialContent({ campaign, weekKey, slot, nowIso }) {
  if (!isApprovedNativeSocialCampaign(campaign)) return { ok: false, reason: 'CAMPAIGN_NOT_ELIGIBLE' };
  const brand = BRAND[campaign.jm1_branch];
  const templateIndex = campaign.jm1_branch === 'J Merrill Financial'
    ? (slot - 1) % 2
    : hashInt(`${campaign.jm1_branch}:${weekKey}:${slot}`) % brand.templates.length;
  const template = brand.templates[templateIndex];
  if (campaign.jm1_branch === 'J Merrill Financial' && PROHIBITED_FINANCIAL.test(template.body)) {
    return { ok: false, reason: 'FINANCIAL_CLAIM_REVIEW_REQUIRED' };
  }
  if (!template.title || !template.body || !template.alt || template.body.length > 1800) {
    return { ok: false, reason: 'CONTENT_QUALITY_GATE_FAILED' };
  }
  return {
    ok: true,
    template,
    caption: `${template.body}\n\n${template.link}`,
    stage: `rolling-${weekKey}-${slot}`,
    provenance: `APPROVED_TEMPLATE_SET:v1; campaign=${campaign.jm1_idempotencykey}; theme=${template.theme}; evaluated=${nowIso}`
  };
}

export async function buildNativeSocialCreative({ campaign, content, slot }) {
  if (!isApprovedNativeSocialCampaign(campaign) || !content?.jm1_draftcopy) {
    return { ok: false, reason: 'CONTENT_OR_CAMPAIGN_NOT_ELIGIBLE' };
  }
  if (!matchesApprovedNativeSocialContent(campaign, content)) return { ok: false, reason: 'CONTENT_TEMPLATE_PROVENANCE_MISMATCH' };
  const brand = BRAND[campaign.jm1_branch];
  const logoBytes = readFileSync(join(ASSET_DIR, brand.logo));
  const logoHash = createHash('sha256').update(logoBytes).digest('hex');
  if (logoHash !== brand.logoSha256) return { ok: false, reason: 'APPROVED_LOGO_HASH_MISMATCH' };
  const dataUri = `data:image/png;base64,${logoBytes.toString('base64')}`;
  const titleLines = wrapWords(content.jm1_name, 24).map(escapeXml);
  const palette = campaign.jm1_branch === 'J Merrill Financial'
    ? { ink: '#17333A', accent: '#2C7A72', paper: '#F5F8F6' }
    : campaign.jm1_branch === 'J Merrill One'
      ? { ink: '#20343A', accent: '#B95D3D', paper: '#F7F7F4' }
      : { ink: '#1E353A', accent: '#326A65', paper: '#F6F7F2' };
  const titleSvg = titleLines.map((line, index) => `<tspan x="112" dy="${index ? 64 : 0}">${line}</tspan>`).join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080" viewBox="0 0 1080 1080"><rect width="1080" height="1080" fill="${palette.paper}"/><rect x="72" y="72" width="936" height="936" rx="8" fill="white" stroke="#D9E0DC" stroke-width="3"/><rect x="112" y="112" width="856" height="14" fill="${palette.accent}"/><image href="${dataUri}" x="112" y="168" width="150" height="150" preserveAspectRatio="xMidYMid meet"/><text x="112" y="440" fill="${palette.accent}" font-family="Arial,Helvetica,sans-serif" font-size="34" font-weight="700">${campaign.jm1_branch.toUpperCase()}</text><text x="112" y="548" fill="${palette.ink}" font-family="Arial,Helvetica,sans-serif" font-size="48" font-weight="700">${titleSvg}</text><path d="M112 690h180" stroke="${palette.accent}" stroke-width="8"/><text x="112" y="930" fill="${palette.ink}" font-family="Arial,Helvetica,sans-serif" font-size="28">A practical note from ${campaign.jm1_branch}</text></svg>`;
  const pngBytes = await sharp(Buffer.from(svg)).png().toBuffer();
  const sha256 = createHash('sha256').update(pngBytes).digest('hex');
  return {
    ok: true,
    svg,
    pngBytes,
    mimeType: 'image/png',
    sha256,
    logoHash,
    dimensions: '1080x1080',
    altText: `${campaign.jm1_branch} graphic titled ${content.jm1_name}; the full educational copy accompanies the post.`,
    assetPath: `runtime-generated://jm1/${nativeSocialCampaignMarker(campaign)}/${content.jm1_stage}/EDITORIAL_CARD.png`,
    rightsProvenance: `JM1_OWNED_BRAND_MARK_HASH_VERIFIED:${logoHash}; APPROVED_TEMPLATE_SET:v1`,
    publicReady: 'PASS',
    slot
  };
}

export function matchesApprovedNativeSocialContent(campaign, content) {
  const match = String(content?.jm1_stage || '').match(/^rolling-(\d{4}-\d{2}-\d{2})-(\d+)$/);
  if (!isApprovedNativeSocialCampaign(campaign) || !match || content.jm1_branch !== campaign.jm1_branch) return false;
  const [, weekKey, slotText] = match;
  const expected = buildReviewedNativeSocialContent({ campaign, weekKey, slot: Number(slotText), nowIso: '2026-01-01T00:00:00.000Z' });
  return expected.ok
    && content.jm1_name === expected.template.title
    && content.jm1_draftcopy === expected.caption
    && String(content.jm1_copybrief || '').includes('APPROVED_TEMPLATE_SET:v1')
    && String(content.jm1_copybrief || '').includes(`theme=${expected.template.theme}`);
}

export function nativeSocialScheduledAt(stage, platform) {
  const match = String(stage || '').match(/^rolling-(\d{4}-\d{2}-\d{2})-(\d+)$/);
  if (!match || !['1', '2'].includes(match[2])) return '';
  const [, weekStart, slot] = match;
  const day = easternDateKey(addDays(new Date(`${weekStart}T12:00:00Z`), slot === '1' ? 1 : 4));
  const hour = platform === 'facebook' ? (slot === '1' ? 10 : 14)
    : platform === 'instagram' ? (slot === '1' ? 11 : 15)
      : (slot === '1' ? 12 : 16);
  return easternDateTimeIso(new Date(`${day}T12:00:00Z`), hour);
}

export function planNativeSocialGaps({ campaign, socialRows, nowIso, destinationByPlatform, approvedRequestMarkers = [], readbackComplete = true }) {
  if (!isApprovedNativeSocialCampaign(campaign) || !readbackComplete || !Array.isArray(socialRows)) return [];
  const now = new Date(nowIso);
  const horizonEnd = new Date(easternDateTimeIso(addDays(easternMidnight(now), 14), 0));
  const platforms = ['facebook', 'instagram', 'linkedin'];
  const plans = [];
  const monday = startOfEasternWeek(now);
  for (let weekStart = monday; weekStart < horizonEnd; weekStart = addDays(weekStart, 7)) {
    const weekKey = easternDateKey(weekStart);
    const dates = [addDays(weekStart, 1), addDays(weekStart, 4)];
    const existingByPlatform = new Map(platforms.map((platform) => [platform, socialRows.filter((row) =>
      row.jm1_platform === platform
      && String(row.jm1_branch || campaign.jm1_branch) === campaign.jm1_branch
      && normalizeDestinations(destinationByPlatform[platform]).includes(normalizeDestination(row.jm1_requesteddestination))
      && occupiesCadence(row, approvedRequestMarkers)
      && isInEasternWeek(row.jm1_requestedschedule || row.jm1_actualschedule, weekStart)
    )]));
    const bookedDates = new Map(platforms.map((platform) => [platform, new Set((existingByPlatform.get(platform) || [])
      .map((row) => row.jm1_requestedschedule || row.jm1_actualschedule)
      .filter(Boolean)
      .map((value) => easternDateKey(new Date(value))))]));
    for (let slot = 0; slot < 2; slot += 1) {
      const date = dates[slot];
      const dayKey = easternDateKey(date);
      const slotKey = `${weekKey}-${slot + 1}`;
      const platformsForSlot = platforms.filter((platform) => {
        const occupied = bookedDates.get(platform);
        if (occupied.has(dayKey) || occupied.size >= 2) return false;
        if ([...occupied].some((bookedDay) => Math.abs(Date.parse(`${bookedDay}T12:00:00Z`) - Date.parse(`${dayKey}T12:00:00Z`)) < 2 * 86400000)) return false;
        const platformSchedule = nativeSocialScheduledAt(`rolling-${weekKey}-${slot + 1}`, platform);
        if (!platformSchedule || new Date(platformSchedule) < now || new Date(platformSchedule) >= horizonEnd) return false;
        const alreadyCreated = socialRows.some((row) => String(row.jm1_idempotencykey || '').includes(`rolling-${slotKey}`)
          && row.jm1_platform === platform
          && normalizeDestinations(destinationByPlatform[platform]).includes(normalizeDestination(row.jm1_requesteddestination)));
        return !alreadyCreated;
      });
      if (!platformsForSlot.length) continue;
      const scheduleByPlatform = Object.fromEntries(platformsForSlot.map((platform) => [
        platform,
        nativeSocialScheduledAt(`rolling-${weekKey}-${slot + 1}`, platform)
      ]));
      const scheduledAt = Object.values(scheduleByPlatform).sort()[0];
      plans.push({ weekKey, slot: slot + 1, slotKey, scheduledAt, scheduleByPlatform, platforms: platformsForSlot });
      for (const platform of platformsForSlot) bookedDates.get(platform).add(dayKey);
    }
  }
  return plans;
}

function occupiesCadence(row, approvedRequestMarkers) {
  if ([
    'NATIVE_RESERVATION_VERIFIED', 'NATIVE_RESERVATION_TIMEZONE_UNVERIFIED', 'NATIVE_BOOKED_VERIFIED',
    'PUBLISHED_VERIFIED'
  ].includes(row.jm1_status)) return true;
  const requestPrefix = approvedRequestMarkers.find((marker) => String(row.jm1_idempotencykey || '').startsWith(`${marker}:social:`));
  return Boolean(requestPrefix && [
    'PUBLIC_READY_SCHEDULED_ELIGIBLE', 'PUBLISHING_CLAIMED', 'PLATFORM_ACCEPTED', 'READBACK_PENDING',
    'RETRY_REQUIRED'
  ].includes(row.jm1_status));
}

function startOfEasternWeek(date) {
  const key = easternDateKey(date);
  const [year, month, day] = key.split('-').map(Number);
  const local = new Date(Date.UTC(year, month - 1, day));
  const weekday = (local.getUTCDay() + 6) % 7;
  return new Date(Date.UTC(year, month - 1, day - weekday, 12));
}

function easternMidnight(date) {
  const [year, month, day] = easternDateKey(date).split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day, 12));
}

function isInEasternWeek(value, monday) {
  if (!value) return false;
  const day = startOfEasternWeek(new Date(value));
  return day.getTime() === monday.getTime();
}

function easternDateKey(date) {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(date);
  const part = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${part.year}-${part.month}-${part.day}`;
}

function easternDateTimeIso(date, hour) {
  const [year, month, day] = easternDateKey(date).split('-').map(Number);
  let candidate = new Date(Date.UTC(year, month - 1, day, hour));
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const local = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hourCycle: 'h23' }).formatToParts(candidate);
    const part = Object.fromEntries(local.map(({ type, value }) => [type, value]));
    const seen = Date.UTC(Number(part.year), Number(part.month) - 1, Number(part.day), Number(part.hour));
    const wanted = Date.UTC(year, month - 1, day, hour);
    candidate = new Date(candidate.getTime() + wanted - seen);
  }
  return candidate.toISOString();
}

function addDays(date, days) { return new Date(date.getTime() + days * 86400000); }
function normalizeDestinations(value) { return (Array.isArray(value) ? value : [value]).map(normalizeDestination).filter(Boolean); }
function normalizeDestination(value) { return String(value || '').toLowerCase().replace(/[^a-z0-9]/g, ''); }
function hashInt(value) { return createHash('sha256').update(value).digest().readUInt32BE(0); }
function wrapWords(value, limit) {
  const lines = [];
  let line = '';
  for (const word of String(value || '').split(/\s+/)) {
    if (line && `${line} ${word}`.length > limit) {
      lines.push(line);
      line = word;
    } else line = line ? `${line} ${word}` : word;
  }
  if (line) lines.push(line);
  return lines;
}
function escapeXml(value) { return String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;'); }
