import baseConfig from '@repo/eslint-config/base';
import nextConfig from '@repo/eslint-config/next';
import reactConfig from '@repo/eslint-config/react';

const eslintConfig = [
  {
    ignores: ['.next-e2e/'],
  },
  ...baseConfig,
  ...nextConfig,
  ...reactConfig,
  {
    files: ['src/server/infrastructure/db/seed.ts', 'src/mcp/index.ts', 'e2e/seed.ts'],
    rules: {
      'no-console': 'off',
    },
  },
  {
    // NOTE: Playwright の globalSetup は export default を要求するため、e2e ディレクトリでは許可する
    files: ['e2e/**/*.ts'],
    rules: {
      'no-restricted-exports': 'off',
    },
  },
];

export default eslintConfig;
