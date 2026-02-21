import { protectedProcedure, router } from '@/server/api/trpc';
import { getProjectsUseCase } from '@/server/infrastructure/di/container';

export const projectRouter = router({
  list: protectedProcedure.query(() => getProjectsUseCase.execute()),
});
