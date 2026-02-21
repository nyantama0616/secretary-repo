import { execSync } from 'node:child_process';

import { DATABASE_URL_TEST } from '../src/config';

const setup = () => {
  const env = { ...process.env, DATABASE_URL: DATABASE_URL_TEST! };

  execSync('pnpm db:migrate', { stdio: 'inherit', env });
};

export default setup;
