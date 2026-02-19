const reactConfig = [
  {
    files: ['**/*.{jsx,tsx}'],
    rules: {
      'react/self-closing-comp': 'error',
      'react/jsx-curly-brace-presence': [
        'error',
        { props: 'never', children: 'never' },
      ],
    },
  },
];

export default reactConfig;
