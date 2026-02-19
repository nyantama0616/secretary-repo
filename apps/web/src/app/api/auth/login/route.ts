import { NextResponse } from 'next/server';
import * as v from 'valibot';

import { NODE_ENV } from '@/config';
import { logger } from '@/lib/logger';
import { AUTH_COOKIE_NAME, verifyApiKey } from '@/server/api/auth';

const LoginBodySchema = v.object({
  apiKey: v.pipe(v.string(), v.minLength(1)),
});

const COOKIE_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;

export const POST = async (req: Request) => {
  const body = await req.json().catch(() => null);
  const parsed = v.safeParse(LoginBodySchema, body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'API Key が必要です' },
      { status: 400 },
    );
  }

  const { apiKey } = parsed.output;

  if (!verifyApiKey(apiKey)) {
    logger.warn('ログイン認証に失敗した');
    return NextResponse.json(
      { error: 'API Key が正しくありません' },
      { status: 401 },
    );
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(AUTH_COOKIE_NAME, apiKey, {
    httpOnly: true,
    secure: NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: COOKIE_MAX_AGE_SECONDS,
  });
  return response;
};
