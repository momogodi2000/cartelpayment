import crypto from "node:crypto";

const CROCKFORD_ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

function randomCrockford(length: number): string {
  const bytes = crypto.randomBytes(length);
  let result = "";
  for (let i = 0; i < length; i++) {
    result += CROCKFORD_ALPHABET[bytes[i] % 32];
  }
  return result;
}

export function generateOrderReference(): string {
  return `PW-${randomCrockford(10)}`;
}

export function generateTicketReference(): string {
  return `TK-${randomCrockford(8)}`;
}

export function isValidOrderReference(ref: string): boolean {
  return /^PW-[0-9A-HJKMNP-TV-Z]{10}$/i.test(ref.trim());
}

export function isValidTicketReference(ref: string): boolean {
  return /^TK-[0-9A-HJKMNP-TV-Z]{8}$/i.test(ref.trim());
}
