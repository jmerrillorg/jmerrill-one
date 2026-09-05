type Row = Record<string, unknown>;

export type MarketingCommandCenter = {
  generatedAt: string;
  current: { featuredAuthor: string; titleCampaigns: number; acquisition: string; reader: string; brand: string };
  upcoming: { nextFeaturedAuthor: string; launches: string[]; scheduledExecutions: number; reactivationCandidates: number };
  health: Array<{ name: string; state: string }>;
  catalog: { sourceRows: number; canonicalWorks: number; formatProducts: number; reservedIsbns: number; marketingEligible: number; rightsHeld: number };
  assets: { registeredFiles: number; worksReady: number; worksPartial: number; worksMissing: number; primaryCovers: number; attention: Array<{ title: string; author: string; state: string }> };
  exceptions: Array<{ name: string; type: string; owner: string; state: string }>;
  executions: Array<{ name: string; platform: string; state: string; scheduled: string }>;
};

export async function loadMarketingCommandCenter(): Promise<MarketingCommandCenter> {
  const config = dataverseConfig();
  const token = await dataverseToken(config);
  const [campaigns, social, journeys, creatives, exceptions, controls, credentials, catalogWorks, assetTotals, primaryCovers] = await Promise.all([
    query(config, token, "/jm1_campaignauthorities?$select=jm1_name,jm1_branch,jm1_program,jm1_campaigntype,jm1_subject,jm1_start,jm1_stop,jm1_state&$orderby=modifiedon desc&$top=50"),
    query(config, token, "/jm1_socialexecutions?$select=jm1_name,jm1_platform,jm1_status,jm1_requestedschedule,jm1_platformpostid,jm1_readbackstate&$orderby=modifiedon desc&$top=100"),
    query(config, token, "/jm1_journeyexecutions?$select=jm1_name,jm1_state,jm1_dynamicsjourneyid&$orderby=modifiedon desc&$top=50"),
    query(config, token, "/jm1_creativeworks?$select=jm1_name,jm1_publicreadystate,jm1_assethash&$orderby=modifiedon desc&$top=50"),
    query(config, token, "/jm1_marketingexceptions?$select=jm1_name,jm1_exceptiontype,jm1_resolutionstate,jm1_authorityrequired,jm1_exceptionowner&$orderby=modifiedon desc&$top=50"),
    query(config, token, "/jm1_marketingcontrolloops?$select=jm1_name,jm1_state,jm1_controldecision,jm1_evaluatedat&$orderby=modifiedon desc&$top=20"),
    query(config, token, "/jm1_credentialmonitors?$select=jm1_name,jm1_platform,jm1_currentcredentialstate,jm1_expiresat&$orderby=modifiedon desc&$top=20"),
    query(config, token, "/jm1pub_titles?$select=jm1pub_titlename,jm1pub_authorname,jm1pub_marketingauthoritystate,jm1pub_rightsholdstate,jm1pub_assetregistrystatus&$filter=jm1pub_catalogcorrelationid%20eq%20'JMP-CATALOG-CANONICAL-20260905'&$top=500"),
    query(config, token, "/jm1pub_productionassets?$apply=aggregate($count%20as%20Total)"),
    query(config, token, "/jm1pub_productionassets?$select=jm1pub_productionassetid&$filter=jm1pub_assetstate%20eq%20'GOVERNED_PRIMARY'&$top=500"),
  ]);

  const activeCampaigns = campaigns.filter((row) => !/INACTIVE|RETIRED|COMPLETE/i.test(text(row.jm1_state)));
  const openExceptions = exceptions.filter((row) => !/RESOLVED|SUPERSEDED|CLOSED/i.test(text(row.jm1_resolutionstate)));
  const founderExceptions = openExceptions.filter((row) =>
    !/NO_WORK_DUE|WAITING_FOR_SCHEDULE|FATIGUE_HELD|LINKEDIN.*REVIEW/i.test([row.jm1_exceptiontype, row.jm1_resolutionstate].map(text).join(" ")),
  );
  const latestControl = controls[0];
  const currentFeatured = activeCampaigns.find((row) => /Sean A Crowley/i.test([row.jm1_name, row.jm1_subject].map(text).join(" ")));
  const nextFeatured = activeCampaigns.find((row) => /Iyorwuese Hagher/i.test([row.jm1_name, row.jm1_subject].map(text).join(" ")));
  const credentialFailure = credentials.some((row) => /EXPIRED|FAILED|INVALID/i.test(text(row.jm1_currentcredentialstate)));
  const metaReadback = social.some((row) => ["facebook", "instagram"].includes(text(row.jm1_platform).toLowerCase()) && text(row.jm1_platformpostid));
  const assetStatus = (row: Row) => Number(row.jm1pub_assetregistrystatus);
  const worksReady = catalogWorks.filter((row) => assetStatus(row) === 100000003).length;
  const worksPartial = catalogWorks.filter((row) => assetStatus(row) === 100000002).length;
  const worksMissing = catalogWorks.filter((row) => [100000000, 100000004].includes(assetStatus(row))).length;

  return {
    generatedAt: new Date().toISOString(),
    current: {
      featuredAuthor: text(currentFeatured?.jm1_subject) || "Sean A Crowley I",
      titleCampaigns: activeCampaigns.filter((row) => /title|author|featured|launch/i.test([row.jm1_program, row.jm1_campaigntype, row.jm1_name].map(text).join(" "))).length,
      acquisition: stateForCampaign(activeCampaigns, /acquisition|inquiry|prospect/i),
      reader: stateForCampaign(activeCampaigns, /reader|audience/i),
      brand: stateForCampaign(activeCampaigns, /brand|evergreen|Helping Authors/i),
    },
    upcoming: {
      nextFeaturedAuthor: text(nextFeatured?.jm1_subject) || "Iyorwuese Hagher",
      launches: activeCampaigns.filter((row) => /launch|Strategies|2026-09-22/i.test([row.jm1_name, row.jm1_start].map(text).join(" "))).map((row) => text(row.jm1_name)).slice(0, 6),
      scheduledExecutions: social.filter((row) => /SCHEDULED|NOT_DUE|ELIGIBLE/i.test(text(row.jm1_status))).length,
      reactivationCandidates: activeCampaigns.filter((row) => /reactivation/i.test([row.jm1_program, row.jm1_campaigntype, row.jm1_name].map(text).join(" "))).length,
    },
    health: [
      { name: "Control Loop", state: text(latestControl?.jm1_state) || "WAITING_FOR_NEXT_TIMER" },
      { name: "Creative Worker", state: creatives.some((row) => text(row.jm1_assethash)) ? "ASSET_READBACK_PRESENT" : "WAITING_FOR_WORK" },
      { name: "Social Worker", state: social.some((row) => /FAILED|DEAD_LETTERED|READBACK_MISMATCH/i.test(text(row.jm1_status))) ? "ATTENTION_REQUIRED" : "HEALTHY" },
      { name: "Credential Monitor", state: credentialFailure ? "ATTENTION_REQUIRED" : "HEALTHY" },
      { name: "Dynamics", state: journeys.some((row) => text(row.jm1_dynamicsjourneyid)) ? "ACTIVE_OR_PROVEN" : "CONTROLLED_BOUNDARY" },
      { name: "Meta", state: metaReadback ? "READBACK_PRESENT" : "READY" },
      { name: "LinkedIn", state: "EXTERNAL_REVIEW_ONLY" },
      { name: "Media Registry", state: creatives.some((row) => text(row.jm1_assethash)) ? "HEALTHY" : "NO_ASSET_READBACK" },
    ],
    catalog: {
      sourceRows: 411,
      canonicalWorks: 129,
      formatProducts: 300,
      reservedIsbns: 111,
      marketingEligible: catalogWorks.filter((row) => text(row.jm1pub_marketingauthoritystate) === "MARKETING_ELIGIBLE").length,
      rightsHeld: catalogWorks.filter((row) => text(row.jm1pub_rightsholdstate) !== "NO_RIGHTS_HOLD_FOUND").length,
    },
    assets: {
      registeredFiles: Number(assetTotals[0]?.Total || 0),
      worksReady,
      worksPartial,
      worksMissing,
      primaryCovers: primaryCovers.length,
      attention: catalogWorks.filter((row) => assetStatus(row) !== 100000003).map((row) => ({
        title: text(row.jm1pub_titlename), author: text(row.jm1pub_authorname),
        state: assetStatus(row) === 100000004 ? "MISSING" : "PARTIAL_OR_AMBIGUOUS",
      })).slice(0, 20),
    },
    exceptions: founderExceptions.map((row) => ({
      name: text(row.jm1_name),
      type: text(row.jm1_exceptiontype),
      owner: text(row.jm1_exceptionowner || row.jm1_authorityrequired),
      state: text(row.jm1_resolutionstate),
    })).slice(0, 10),
    executions: social.map((row) => ({
      name: text(row.jm1_name),
      platform: text(row.jm1_platform),
      state: text(row.jm1_status || row.jm1_readbackstate),
      scheduled: text(row.jm1_requestedschedule),
    })).slice(0, 12),
  };
}

function dataverseConfig() {
  const resource = process.env.DATAVERSE_RESOURCE_URL || "";
  const apiBase = process.env.DATAVERSE_WEB_API_BASE_URL || `${resource}/api/data/v9.2`;
  const tenantId = process.env.DATAVERSE_TENANT_ID || "";
  const clientId = process.env.DATAVERSE_CLIENT_ID || "";
  const clientSecret = process.env.DATAVERSE_CLIENT_SECRET || "";
  if (!resource || !tenantId || !clientId || !clientSecret) throw new Error("Marketing Command Center data authority is not configured.");
  return { resource: resource.replace(/\/$/, ""), apiBase: apiBase.replace(/\/$/, ""), tenantId, clientId, clientSecret };
}

async function dataverseToken(config: ReturnType<typeof dataverseConfig>) {
  const body = new URLSearchParams({ grant_type: "client_credentials", client_id: config.clientId, client_secret: config.clientSecret, scope: `${config.resource}/.default` });
  const response = await fetch(`https://login.microsoftonline.com/${config.tenantId}/oauth2/v2.0/token`, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body, cache: "no-store" });
  if (!response.ok) throw new Error(`Dataverse identity failed (${response.status}).`);
  const result = (await response.json()) as { access_token?: string };
  if (!result.access_token) throw new Error("Dataverse identity returned no token.");
  return result.access_token;
}

async function query(config: ReturnType<typeof dataverseConfig>, token: string, path: string): Promise<Row[]> {
  const response = await fetch(`${config.apiBase}${path}`, { headers: { Authorization: `Bearer ${token}`, Accept: "application/json", "OData-Version": "4.0", "OData-MaxVersion": "4.0" }, cache: "no-store" });
  if (!response.ok) throw new Error(`Marketing read failed (${response.status}).`);
  return ((await response.json()) as { value?: Row[] }).value || [];
}

function stateForCampaign(rows: Row[], pattern: RegExp) {
  const row = rows.find((item) => pattern.test([item.jm1_program, item.jm1_campaigntype, item.jm1_name].map(text).join(" ")));
  return row ? text(row.jm1_state) || "ACTIVE" : "READY_NOT_ACTIVE";
}

function text(value: unknown) {
  return typeof value === "string" ? value : "";
}
