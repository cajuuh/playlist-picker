import { createHmac, timingSafeEqual } from 'crypto';

const COOKIE_NAME = 'admin_session';
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function sign(secret) {
  return createHmac('sha256', secret).update('admin').digest('hex');
}

function safeEqual(a, b) {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
}

function parseCookies(req) {
  const header = req.headers.cookie || '';
  return Object.fromEntries(
    header
      .split(';')
      .map((pair) => pair.trim())
      .filter(Boolean)
      .map((pair) => {
        const idx = pair.indexOf('=');
        return [pair.slice(0, idx), decodeURIComponent(pair.slice(idx + 1))];
      })
  );
}

export function checkPassword(password) {
  const secret = process.env.ADMIN_PASSWORD;
  return Boolean(secret) && Boolean(password) && safeEqual(String(password), secret);
}

export function issueSessionCookie(req) {
  const token = sign(process.env.ADMIN_PASSWORD);
  // `Secure` cookies are silently dropped by browsers over plain HTTP, which
  // is how `vercel dev` serves localhost — only require it when the request
  // actually arrived over HTTPS (Vercel sets this header in production).
  const secure = req.headers['x-forwarded-proto'] === 'https' ? '; Secure' : '';
  return `${COOKIE_NAME}=${token}; HttpOnly${secure}; SameSite=Lax; Path=/; Max-Age=${MAX_AGE}`;
}

export function isAuthedRequest(req) {
  const secret = process.env.ADMIN_PASSWORD;
  if (!secret) return false;
  const token = parseCookies(req)[COOKIE_NAME];
  return Boolean(token) && safeEqual(token, sign(secret));
}
