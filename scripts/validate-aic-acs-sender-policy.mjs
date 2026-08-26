import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const senderPolicy = JSON.parse(
  readFileSync("docs/governance/JM1-ACS-SENDER-IDENTITY-v1.policy.json", "utf8"),
);
const humanFirstPolicy = JSON.parse(
  readFileSync("docs/governance/JM1-HUMAN-FIRST-WHY-FIRST-v1.policy.json", "utf8"),
);

function validateIdentity(message) {
  const profile = senderPolicy.registry[message.brand];
  if (!profile) return { decision: "DENY", code: "ACS_BRAND_UNKNOWN" };
  if (message.from !== profile.acsFrom) {
    return { decision: "DENY", code: "ACS_BRAND_SENDER_MISMATCH" };
  }
  if (message.replyTo !== profile.replyTo) {
    return { decision: "DENY", code: "ACS_REPLY_TO_MISMATCH" };
  }
  if (message.duplicateSignature) {
    return { decision: "DENY", code: "ACS_DUPLICATE_SIGNATURE_BLOCKED" };
  }
  if (message.brand === "AIC" && message.planningCenterAsSenderAuthority) {
    return { decision: "DENY", code: "ACS_PLANNING_CENTER_AUTHORITY_MISMATCH" };
  }
  if (message.brand === "AIC" && message.wrongParticipantOrEvent) {
    return { decision: "DENY", code: "ACS_RELATIONSHIP_CONTEXT_MISMATCH" };
  }
  if (message.brand === "AIC" && message.exposesInternalSystemLanguage) {
    return { decision: "DENY", code: "ACS_INTERNAL_LANGUAGE_EXPOSED" };
  }
  if (message.brand === "AIC" && message.highRisk) {
    return { decision: "HUMAN_REVIEW_REQUIRED", code: "ACS_HIGH_RISK_HUMAN_REVIEW_REQUIRED" };
  }
  return { decision: "ALLOW", code: "ALLOW" };
}

assert.deepEqual(senderPolicy.acsDomains, ["email.jmerrill.one", "email.agapeic.org"]);
assert.equal(senderPolicy.aic, undefined);
assert.ok(!senderPolicy.failureCodes.includes("AIC_SENDER_IDENTITY_FOUNDER_DECISION_REQUIRED"));

const aic = senderPolicy.registry.AIC;
assert.equal(aic.brand, "AIC");
assert.equal(aic.organization, "Agape International Cathedral");
assert.equal(aic.acsFrom, "aic@email.agapeic.org");
assert.equal(aic.replyTo, "aic@agapeic.org");
assert.equal(aic.replyMailboxAuthority, "aic@agapeic.org");
assert.equal(aic.humanFirstPolicy, "JM1-HUMAN-FIRST-WHY-FIRST-v1");
assert.equal(aic.brandOverlay, "AIC");
assert.equal(aic.planningCenterBoundary, "PLANNING_CENTER_REMAINS_MINISTRY_EVENT_REGISTRATION_SOURCE_OF_RECORD");

const aicHumanFirst = humanFirstPolicy.brandProfiles.aic;
assert.equal(aicHumanFirst.status, "ENTERPRISE_OUTBOUND_RUNTIME_COMMISSIONED");
assert.equal(aicHumanFirst.from, "aic@email.agapeic.org");
assert.equal(aicHumanFirst.replyTo, "aic@agapeic.org");
assert.equal(aicHumanFirst.replyMailboxAuthority, "aic@agapeic.org");
assert.equal(aicHumanFirst.runtimeClassification, "SHARED_ACS_RELAY_BOUND");

assert.deepEqual(
  validateIdentity({
    brand: "AIC",
    from: "aic@email.agapeic.org",
    replyTo: "aic@agapeic.org",
  }),
  { decision: "ALLOW", code: "ALLOW" },
);
assert.deepEqual(
  validateIdentity({
    brand: "AIC",
    from: "publishing@email.jmerrill.one",
    replyTo: "aic@agapeic.org",
  }),
  { decision: "DENY", code: "ACS_BRAND_SENDER_MISMATCH" },
);
assert.deepEqual(
  validateIdentity({
    brand: "AIC",
    from: "one@email.jmerrill.one",
    replyTo: "aic@agapeic.org",
  }),
  { decision: "DENY", code: "ACS_BRAND_SENDER_MISMATCH" },
);
assert.deepEqual(
  validateIdentity({
    brand: "AIC",
    from: "aic@email.agapeic.org",
    replyTo: "aic@agapeic.org",
    wrongParticipantOrEvent: true,
  }),
  { decision: "DENY", code: "ACS_RELATIONSHIP_CONTEXT_MISMATCH" },
);
assert.deepEqual(
  validateIdentity({
    brand: "AIC",
    from: "aic@email.agapeic.org",
    replyTo: "aic@agapeic.org",
    exposesInternalSystemLanguage: true,
  }),
  { decision: "DENY", code: "ACS_INTERNAL_LANGUAGE_EXPOSED" },
);
assert.deepEqual(
  validateIdentity({
    brand: "AIC",
    from: "aic@email.agapeic.org",
    replyTo: "aic@agapeic.org",
    highRisk: true,
  }),
  { decision: "HUMAN_REVIEW_REQUIRED", code: "ACS_HIGH_RISK_HUMAN_REVIEW_REQUIRED" },
);
assert.deepEqual(
  validateIdentity({
    brand: "AIC",
    from: "aic@email.agapeic.org",
    replyTo: "aic@agapeic.org",
    duplicateSignature: true,
  }),
  { decision: "DENY", code: "ACS_DUPLICATE_SIGNATURE_BLOCKED" },
);

console.log("AIC ACS sender policy validation PASS");
