import { createHmac, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';

const COOKIE_NAME = 'cms_admin_session';
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

function getSecrets() {
  const password = process.env.ADMIN_PASSWORD;
  const sessionSecret = process.env.SESSION_SECRET ?? process.env.ADMIN_PASSWORD;
  if (!password || !sessionSecret) {
    return null;
  }
  return { password, sessionSecret };
}

function signToken(sessionSecret: string) {
  const expires = Date.now() + MAX_AGE_SECONDS * 1000;
  const payload = `v1.${expires}`;
  const sig = createHmac('sha256', sessionSecret).update(payload).digest('hex');
  return `${payload}.${sig}`;
}

function verifyToken(token: string, sessionSecret: string) {
  const parts = token.split('.');
  if (parts.length !== 3 || parts[0] !== 'v1') return false;
  const expires = Number(parts[1]);
  if (!Number.isFinite(expires) || expires < Date.now()) return false;
  const payload = `${parts[0]}.${parts[1]}`;
  const expected = createHmac('sha256', sessionSecret).update(payload).digest('hex');
  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(parts[2]));
  } catch {
    return false;
  }
}

export function adminConfigured() {
  return Boolean(getSecrets());
}

export function verifyAdminPassword(candidate: string) {
  const secrets = getSecrets();
  if (!secrets) return false;
  const a = Buffer.from(secrets.password);
  const b = Buffer.from(candidate);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function createAdminSession() {
  const secrets = getSecrets();
  if (!secrets) throw new Error('Admin auth is not configured');
  const token = signToken(secrets.sessionSecret);
  const jar = await cookies();
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: MAX_AGE_SECONDS
  });
}

export async function clearAdminSession() {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}

export async function isAdminSessionValid() {
  const secrets = getSecrets();
  if (!secrets) return false;
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return false;
  return verifyToken(token, secrets.sessionSecret);
}

export async function requireAdminSession() {
  const ok = await isAdminSessionValid();
  if (!ok) {
    throw new Error('Unauthorized');
  }
}
