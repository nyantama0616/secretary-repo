import pino from 'pino';
import pretty from 'pino-pretty';

import { LOG_LEVEL, NODE_ENV } from '@/config';

const isDev = NODE_ENV === 'development';

const stream = isDev ? pretty({ colorize: true }) : undefined;

export const logger = pino(
  {
    level: LOG_LEVEL,
  },
  stream,
);
