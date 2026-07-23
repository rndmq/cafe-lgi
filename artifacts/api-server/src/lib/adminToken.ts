import { createHmac, timingSafeEqual } from 'crypto';

// Stateless signed admin token: `${expiresAt}.${signature}`.
// No sessions table needed — this fits the app's existing single-shared-
// password admin model. If you later add per-user admin accounts, swap
// this for real sessions or JWT-with-claims instead.

const DEFAULT_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

function getSecret(): string {
  const secret = process.env.ADMIN_PASSWORD;
  if (!secret) {
    throw new Error(
      'ADMIN_PASSWORD environment variable not set. Add it to your Vercel project environment variables.',
    );
  }
  return secret;
}

function sign(payload: string): string {
  return createHmac('sha256', getSecret()).update(payload).digest('hex');
}

/** Issues a new admin token valid for DEFAULT_TTL_MS from now. */
export function issueAdminToken(): string {
  const expiresAt = Date.now() + DEFAULT_TTL_MS;
  const payload = String(expiresAt);
  const signature = sign(payload);
  return `${payload}.${signature}`;
}

/** Verifies a token's signature and expiry. Returns true if valid. */
export function verifyAdminToken(token: string | undefined | null): boolean {
  if (!token) return false;

  const parts = token.split('.');
  if (parts.length !== 2) return false;

  const [payload, signature] = parts;
  const expected = sign(payload);

  // Constant-time comparison to avoid timing attacks. Guard the length
  // check first since timingSafeEqual throws on mismatched buffer sizes.
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;

  const expiresAt = Number(payload);
  if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) return false;

  return true;
}
