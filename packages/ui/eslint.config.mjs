import baseConfig from '@repo/eslint-config/base';
import reactConfig from '@repo/eslint-config/react';
import importPlugin from 'eslint-plugin-import';
import reactPlugin from 'eslint-plugin-react';

// NOTE: base.mjs の import/order と react.mjs のルールは eslint-plugin-import, eslint-plugin-react の登録が必要である
// apps/web では eslint-config-next が提供するが、packages/ui では明示的に登録する
const eslintConfig = [
  {
    plugins: {
      import: importPlugin,
      react: reactPlugin,
    },
  },
  ...baseConfig,
  ...reactConfig,
  {
    files: ['*.config.{js,mjs,ts}'],
    rules: {
      'no-restricted-exports': 'off',
    },
  },
];

export default eslintConfig;
