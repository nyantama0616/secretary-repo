import { createHash, timingSafeEqual } from 'node:crypto';

import { cookies } from 'next/headers';

import { API_KEY } from '@/config';
import { AUTH_COOKIE_NAME } from '@/server/api/auth-constants';

export { AUTH_COOKIE_NAME } from '@/server/api/auth-constants';

export const verifyApiKey = (provided: string): boolean => {
  const expectedHash = sha256(API_KEY);
  const providedHash = sha256(provided);
  return timingSafeEqual(expectedHash, providedHash);
};

export const extractApiKey = (req: Request): string | null => {
  const authHeader = req.headers.get('authorization');
  const BEARER_PREFIX = 'Bearer ';
  if (authHeader?.startsWith(BEARER_PREFIX)) {
    return authHeader.slice(BEARER_PREFIX.length);
  }

  const cookieHeader = req.headers.get('cookie');
  if (cookieHeader) {
    const match = cookieHeader
      .split(';')
      .map((c) => c.trim())
      .find((c) => c.startsWith(`${AUTH_COOKIE_NAME}=`));
    if (match) {
      return match.split('=').slice(1).join('=');
    }
  }

  return null;
};

export const isLoggedIn = async (): Promise<boolean> => {
  const cookieStore = await cookies();
  return cookieStore.has(AUTH_COOKIE_NAME);
};

// NOTE: 入力長に依存しない定数時間比較を実現するため、SHA-256 でハッシュ化してから比較する
const sha256 = (value: string): Buffer => {
  return createHash('sha256').update(value).digest();
};
