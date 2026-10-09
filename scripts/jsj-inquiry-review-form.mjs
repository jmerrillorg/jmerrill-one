import { createHash } from 'node:crypto';

export const formId = 'd04a3990-b6d3-46c6-a351-4024f45c39a9';
export const table = 'jm1_jsjinquiry';
const baselineHash = '234c9c4baee27bf8d9ef3d9c46ddccc335334a0e6b2d68ecca5c9f626c97cb04';
const textControl = '{4273EDBD-AC1D-40D3-9FB2-095C621B552D}';
const memoControl = '{E0DECE4B-6FC8-4A8F-A065-082708572369}';
const dateControl = '{5B773807-9FB2-42DB-97C3-7A91EFF8ADFF}';

const reviewFields = [
  ['jm1_contactname', 'Contact name', textControl, true],
  ['jm1_email', 'Email', textControl, true],
  ['jm1_inquirytype', 'Inquiry type', textControl, true],
  ['jm1_message', 'Message', memoControl, true],
  ['jm1_receivedat', 'Received at', dateControl, true],
  ['jm1_deliverystate', 'Delivery state', textControl, true],
  ['jm1_closedat', 'Closed at', dateControl, false],
];
const dispositionFields = [
  ['jm1_disposition', 'Disposition', textControl, true],
  ['jm1_dispositiondecidedby', 'Decision by', textControl, true],
  ['jm1_dispositiondecisionat', 'Decision at', dateControl, true],
  ['jm1_dispositionsource', 'Decision source', textControl, true],
  ['jm1_dispositionrecordedby', 'Recorded by', textControl, true],
  ['jm1_dispositionrecordedat', 'Recorded at', dateControl, true],
];

function cellId(field) {
  const hex = createHash('sha256').update(`JM1-Core JSJ review form ${field}`).digest('hex').slice(0, 32);
  return `{${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}}`;
}

function rows(fields) { return fields.map(([field, label, classid, disabled]) =>
  `<row><cell id="${cellId(field)}"><labels><label description="${label}" languagecode="1033" /></labels><control id="${field}" classid="${classid}" datafieldname="${field}" disabled="${disabled}" /></cell></row>`
).join(''); }

export const legacyReviewRows = rows(reviewFields);
const dispositionRows = rows(dispositionFields);
export const addedRows = legacyReviewRows + dispositionRows;

export function reviewFormXml(current) {
  if (current.includes(addedRows)) {
    if (createHash('sha256').update(current.replace(addedRows, '')).digest('hex') !== baselineHash) {
      throw new Error('JSJ review form drifted after the governed rows were added');
    }
    return current;
  }
  if (current.includes(legacyReviewRows)) {
    if (createHash('sha256').update(current.replace(legacyReviewRows, '')).digest('hex') !== baselineHash) {
      throw new Error('JSJ review form drifted after the governed rows were added');
    }
    return current.replace(legacyReviewRows, addedRows);
  }
  if (createHash('sha256').update(current).digest('hex') !== baselineHash) {
    throw new Error('JSJ review form baseline changed; inspect before applying');
  }
  if (current.split('</rows>').length !== 2) throw new Error('Unexpected JSJ form layout');
  return current.replace('</rows>', `${addedRows}</rows>`);
}

export function restoreFormXml(current) {
  if (!current.includes(addedRows)) throw new Error('Governed JSJ review rows are not present');
  const previous = current.replace(addedRows, legacyReviewRows);
  if (createHash('sha256').update(previous.replace(legacyReviewRows, '')).digest('hex') !== baselineHash) {
    throw new Error('JSJ review form drifted; refusing to restore');
  }
  return previous;
}
