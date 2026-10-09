export function dispositionPatch(row, { id, reference, outcome, decidedBy, decisionAt, source, recordedBy, recordedAt }) {
  if (row.jm1_jsjinquiryid !== id || row.jm1_name !== reference) throw new Error('Inquiry identity mismatch');
  if (row.jm1_deliverystate !== 'DELIVERED' || row.jm1_closedat || row.jm1_disposition) throw new Error('Inquiry is not open and undispositioned');
  if (outcome !== 'JUNK') throw new Error('Unsupported disposition');
  if (!decidedBy || decidedBy.length > 120 || !source || source.length > 300 || !recordedBy || recordedBy.length > 120 || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/.test(recordedAt) || !Number.isFinite(Date.parse(recordedAt))) throw new Error('Decision provenance incomplete');
  if (decisionAt && (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/.test(decisionAt) || !Number.isFinite(Date.parse(decisionAt)))) throw new Error('Invalid decision time');
  return {
    jm1_disposition: outcome,
    jm1_dispositiondecidedby: decidedBy,
    jm1_dispositiondecisionat: decisionAt || null,
    jm1_dispositionsource: source,
    jm1_dispositionrecordedby: recordedBy,
    jm1_dispositionrecordedat: recordedAt,
    jm1_closedat: recordedAt,
  };
}

export function sameDataverseSecond(actual, expected) {
  return Math.trunc(Date.parse(actual) / 1000) === Math.trunc(Date.parse(expected) / 1000);
}
