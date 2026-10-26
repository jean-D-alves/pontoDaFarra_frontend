export const PHONE_REGEX = /^\+\d{2}\(\d{2}\)(\d{4}|\d{5})-\d{4}$/;
export const PHONE_PLAIN_REGEX = /^\d{12,13}$/;

export function formatPhone(input: string): string {
  const d = input.replace(/\D/g, "").slice(0, 13);
  if (!d) return "";

  let out = "+" + d.slice(0, 2);
  if (d.length > 2) out += "(" + d.slice(2, 4);
  if (d.length > 4) {
    const local = d.slice(4);
    const split = local.length > 8 ? 5 : 4; 
    out += ")" + local.slice(0, split);
    if (local.length > split) out += "-" + local.slice(split);
  }
  return out;
}

export function isValidPhone(value: string): boolean {
  return PHONE_REGEX.test(value) || PHONE_PLAIN_REGEX.test(value);
}

export function phoneToDigits(value: string): string {
  return value.replace(/\D/g, "");
}