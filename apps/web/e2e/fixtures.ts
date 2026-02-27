import { test as base } from '@playwright/test';

import { API_KEY } from '../src/config';
import { AUTH_COOKIE_NAME } from '../src/server/api/auth';

import { TODAY } from './seed';

// NOTE: 認証済み Cookie を自動注入し、ブラウザの時計を固定するカスタムフィクスチャである
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
  // NOTE: seed の固定日付と一致させることで、テストが実行日時に依存しなくなる
  page: async ({ page }, use) => {
    await page.clock.setFixedTime(TODAY);
    // eslint-disable-next-line react-hooks/rules-of-hooks -- Playwright フィクスチャの use() であり、React Hook ではない
    await use(page);
  },
});

export { expect } from '@playwright/test';
