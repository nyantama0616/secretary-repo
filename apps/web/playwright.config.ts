import { defineConfig, devices } from '@playwright/test';

import { API_KEY, DATABASE_URL_TEST, IS_CI } from './src/config';

// NOTE: 開発中の dev サーバー（3000番）と並行起動できるよう、E2E 用は別ポートを使う
const e2ePort = 3100;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: IS_CI,
  retries: IS_CI ? 2 : 0,
  workers: IS_CI ? 1 : undefined,
  reporter: 'html',
  globalSetup: './e2e/setup.ts',
  use: {
    baseURL: `http://localhost:${e2ePort}`,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: `pnpm dev --port ${e2ePort}`,
    url: `http://localhost:${e2ePort}`,
    reuseExistingServer: !IS_CI,
    env: {
      // NOTE: next dev は NODE_ENV=development を強制するため、DATABASE_URL を直接テスト DB の URL で上書きする
      DATABASE_URL: DATABASE_URL_TEST!,
      API_KEY,
      // NOTE: 開発用の .next/ とロックファイルが競合しないよう、E2E 用は別ディレクトリを使う
      NEXT_DIST_DIR: '.next-e2e',
    },
  },
});
