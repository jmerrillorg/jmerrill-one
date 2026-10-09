import { createHash } from 'node:crypto';
import { addedRows, reviewFormXml } from './jsj-inquiry-review-form.mjs';

export const resourceName = 'jm1_jsj_inquiry_review.html';
const textControl = '{4273EDBD-AC1D-40D3-9FB2-095C621B552D}';
const dateControl = '{5B773807-9FB2-42DB-97C3-7A91EFF8ADFF}';
const htmlControl = '{9FDF5F91-88B1-47f4-AD53-C11EFC01A01D}';
const editableClosure = `id="jm1_closedat" classid="${dateControl}" datafieldname="jm1_closedat" disabled="false"`;
const lockedClosure = `id="jm1_closedat" classid="${dateControl}" datafieldname="jm1_closedat" disabled="true"`;

function cellId(name) {
  const hex = createHash('sha256').update(`JM1-Core JSJ action form ${name}`).digest('hex').slice(0, 32);
  return `{${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}}`;
}

export function actionRows(resourceId) {
  if (!/^[0-9a-f-]{36}$/i.test(resourceId)) throw new Error('JSJ review resource ID invalid');
  const readOnly = [
    ['jm1_reviewnextaction', 'Next action', textControl],
    ['jm1_reviewdueat', 'Next action due', dateControl],
    ['jm1_reviewexternalreference', 'Reported external reference', textControl],
  ].map(([field, label, classid]) =>
    `<row><cell id="${cellId(field)}"><labels><label description="${label}" languagecode="1033" /></labels><control id="${field}" classid="${classid}" datafieldname="${field}" disabled="true" /></cell></row>`
  ).join('');
  const web = `<row><cell id="${cellId(resourceName)}" showlabel="false" rowspan="14"><labels><label description="Inquiry review action" languagecode="1033" /></labels><control id="WebResource_JSJInquiryReview" classid="${htmlControl}"><parameters><Url>${resourceName}</Url><PassParameters>true</PassParameters><ShowOnMobileClient>true</ShowOnMobileClient><Security>false</Security><Scrolling>auto</Scrolling><Border>false</Border><WebResourceId>{${resourceId}}</WebResourceId></parameters></control></cell></row>`;
  return readOnly + web;
}

export function actionFormXml(current, resourceId) {
  const rows = actionRows(resourceId);
  const withoutAction = current.includes(rows) ? current.replace(rows, '').replace(lockedClosure, editableClosure) : current;
  if (!withoutAction.includes(addedRows) || reviewFormXml(withoutAction) !== withoutAction) {
    throw new Error('JSJ reviewer form drifted before review action migration');
  }
  return current.includes(rows) ? current : current.replace(addedRows, addedRows + rows).replace(editableClosure, lockedClosure);
}

export function restoreActionFormXml(current, resourceId) {
  const rows = actionRows(resourceId);
  if (!current.includes(rows)) throw new Error('JSJ review action rows absent');
  const original = current.replace(rows, '').replace(lockedClosure, editableClosure);
  if (reviewFormXml(original) !== original) throw new Error('JSJ reviewer form drifted before restore');
  return original;
}
