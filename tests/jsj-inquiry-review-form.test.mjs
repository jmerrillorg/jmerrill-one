import assert from 'node:assert/strict';
import test from 'node:test';
import { addedRows, legacyReviewRows, reviewFormXml, restoreFormXml } from '../scripts/jsj-inquiry-review-form.mjs';

const baseline = '<form><tabs><tab verticallayout="true" id="{a7b542db-63cb-4c22-bce9-3a98453662d0}" IsUserDefined="1"><labels><label description="General" languagecode="1033" /></labels><columns><column width="100%"><sections><section showlabel="false" showbar="false" IsUserDefined="0" id="{369b771b-84dd-43cb-be6c-e97a2584a10a}"><labels><label description="General" languagecode="1033" /></labels><rows><row><cell id="{b9c4d127-be04-4e88-bca6-e946fe5b0aa6}"><labels><label description="Inquiry reference" languagecode="1033" /></labels><control id="jm1_name" classid="{4273EDBD-AC1D-40d3-9FB2-095C621B552D}" datafieldname="jm1_name" /></cell></row><row><cell id="{004b648c-68c2-43be-870f-85a53ee44b53}"><labels><label description="Owner" languagecode="1033" /></labels><control id="ownerid" classid="{270BD3DB-D9AF-4782-9025-509E298DEC0A}" datafieldname="ownerid" /></cell></row></rows></section></sections></column></columns></tab></tabs></form>';

test('JSJ reviewer form adds protected inquiry fields and an editable closure field', () => {
  const updated = reviewFormXml(baseline);
  assert.equal(reviewFormXml(updated), updated);
  assert.equal(restoreFormXml(updated), baseline.replace('</rows>', `${legacyReviewRows}</rows>`));
  assert.match(addedRows, /datafieldname="jm1_message" disabled="true"/);
  assert.match(addedRows, /datafieldname="jm1_closedat" disabled="false"/);
  assert.match(addedRows, /datafieldname="jm1_disposition" disabled="true"/);
});

test('JSJ reviewer form upgrades the published review form without changing its baseline', () => {
  const published = baseline.replace('</rows>', `${legacyReviewRows}</rows>`);
  const updated = reviewFormXml(published);
  assert.equal(updated, baseline.replace('</rows>', `${addedRows}</rows>`));
  assert.equal(reviewFormXml(updated), updated);
  assert.equal(restoreFormXml(updated), published);
});

test('JSJ reviewer form refuses an unknown baseline or changed managed rows', () => {
  assert.throws(() => reviewFormXml(baseline.replace('Owner', 'Changed')), /baseline changed/);
  assert.throws(() => reviewFormXml(reviewFormXml(baseline).replace('Closed at', 'Changed')), /baseline changed|drifted/);
});
