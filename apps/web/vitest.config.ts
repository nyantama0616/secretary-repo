import path from 'node:path';

import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  test: {
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    exclude: ['e2e/**', 'node_modules/**', '.next/**', '.next-e2e/**'],
    // NOTE: 統合テストは DB を共有するため、ファイル間の並列実行を無効にする
    fileParallelism: false,
  },
});
