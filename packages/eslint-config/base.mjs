import prettierConfig from 'eslint-config-prettier';
import tseslint from 'typescript-eslint';

// NOTE: import プラグインは eslint-config-next が提供するため、ここでは登録しない
// import/order ルールは next config と併用することで動作する
const baseConfig = [
  tseslint.configs.base,
  {
    files: ['**/*.{js,jsx,ts,tsx,mjs}'],
    rules: {
      'func-style': ['error', 'expression'],
      'no-restricted-syntax': [
        'error',
        {
          selector:
            "ExportDefaultDeclaration[declaration.type='FunctionDeclaration']",
          message:
            'Use arrow function with separate export instead: const Foo = () => {}; export default Foo;',
        },
      ],
      'no-restricted-exports': [
        'error',
        {
          restrictDefaultExports: {
            direct: true,
            named: true,
            defaultFrom: true,
            namedFrom: true,
            namespaceFrom: true,
          },
        },
      ],
      'no-console': 'warn',
      eqeqeq: ['error', 'always'],
      'prefer-const': 'error',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports' },
      ],
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['../../*'],
              message:
                '2階層以上の相対パスは禁止です。@/ エイリアスを使用してください。',
            },
          ],
        },
      ],
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
          ],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
    },
  },
  prettierConfig,
];

export default baseConfig;
