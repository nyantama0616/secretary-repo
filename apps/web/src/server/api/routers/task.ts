import * as v from 'valibot';

import { protectedProcedure, router } from '@/server/api/trpc';
import {
  getTaskDetailUseCase,
  getTasksUseCase,
} from '@/server/infrastructure/di/container';
import { GetTaskDetailInputSchema } from '@/server/usecase/task/get-task-detail';

export const taskRouter = router({
  list: protectedProcedure.query(() => getTasksUseCase.execute()),
  detail: protectedProcedure
    .input(v.parser(GetTaskDetailInputSchema))
    .query(({ input }) => getTaskDetailUseCase.execute(input)),
});
