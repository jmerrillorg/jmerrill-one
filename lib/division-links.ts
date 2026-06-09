export function isInquiryLedDivision(id: string) {
  return id === "productions";
}

export function getDivisionPublicHref(id: string, domain: string) {
  return isInquiryLedDivision(id) ? "/contact?division=productions" : `https://${domain}`;
}

export function getDivisionInquiryHref(id: string) {
  return isInquiryLedDivision(id) ? "/contact?division=productions" : "/contact";
}
