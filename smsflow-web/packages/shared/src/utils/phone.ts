// E.164 phone number normalization
export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('1') && digits.length === 11) return `+${digits}`;
  if (digits.length === 10) return `+1${digits}`;
  return `+${digits}`;
}

export function isValidPhone(phone: string): boolean {
  const e164 = /^\+[1-9]\d{7,14}$/;
  return e164.test(normalizePhone(phone));
}
