import { protectedProcedure, router } from '@/server/api/trpc';
import { getTasksUseCase } from '@/server/infrastructure/di/container';

export const taskRouter = router({
  list: protectedProcedure.query(() => getTasksUseCase.execute()),
});
