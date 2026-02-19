import { test as base } from '@playwright/test';

import { API_KEY } from '../src/config';
import { AUTH_COOKIE_NAME } from '../src/server/api/auth';

// NOTE: 認証済み Cookie を自動注入するカスタムフィクスチャである
export const test = base.extend({
  context: async ({ context }, use) => {
    await context.addCookies([
      {
        name: AUTH_COOKIE_NAME,
        value: API_KEY,
        domain: 'localhost',
        path: '/',
      },
    ]);
    // eslint-disable-next-line react-hooks/rules-of-hooks -- Playwright フィクスチャの use() であり、React Hook ではない
    await use(context);
  },
});

export { expect } from '@playwright/test';
