import { fetchRequestHandler } from '@trpc/server/adapters/fetch';

import { logger } from '@/lib/logger';
import { appRouter } from '@/server/api';
import { extractApiKey, verifyApiKey } from '@/server/api/auth';
import type { Context } from '@/server/api/trpc';

const createContext = (req: Request): Context => {
  const apiKey = extractApiKey(req);
  if (!apiKey) {
    return { isAuthenticated: false };
  }

  const isValid = verifyApiKey(apiKey);
  if (!isValid) {
    logger.warn('API Key 認証に失敗した');
  }
  return { isAuthenticated: isValid };
};

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: () => createContext(req),
  });

export { handler as GET, handler as POST };
