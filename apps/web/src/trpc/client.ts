import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createTRPCContext } from '@trpc/tanstack-react-query';

import type { AppRouter } from '@/server/api';

export const { TRPCProvider, useTRPC, useTRPCClient } =
  createTRPCContext<AppRouter>();

// NOTE: ページ側が @tanstack/react-query に直接依存しなくて済むように re-export している
export { useQuery, useMutation, useQueryClient };
