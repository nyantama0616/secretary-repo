import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

const nextConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: [
      '**/page.tsx',
      '**/layout.tsx',
      '**/loading.tsx',
      '**/error.tsx',
      '**/not-found.tsx',
      '**/template.tsx',
      '*.config.{js,mjs,ts}',
    ],
    rules: {
      'no-restricted-exports': 'off',
    },
  },
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts']),
]);

export default nextConfig;
