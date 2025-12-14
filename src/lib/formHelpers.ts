// src/lib/formHelpers.ts

export function formatPhoneNumber(phone: string): string {
  return phone.replace(/\D/g, '').replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
}