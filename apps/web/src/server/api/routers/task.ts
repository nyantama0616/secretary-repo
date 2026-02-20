import * as v from 'valibot';

import { protectedProcedure, router } from '@/server/api/trpc';
import {
  getTaskDetailUseCase,
  getTasksUseCase,
  updateTaskStatusUseCase,
} from '@/server/infrastructure/di/container';
import { GetTaskDetailInputSchema } from '@/server/usecase/task/get-task-detail';
import { UpdateTaskStatusInputSchema } from '@/server/usecase/task/update-task-status';

export const taskRouter = router({
  list: protectedProcedure.query(() => getTasksUseCase.execute()),
  detail: protectedProcedure
    .input(v.parser(GetTaskDetailInputSchema))
    .query(({ input }) => getTaskDetailUseCase.execute(input)),
  updateStatus: protectedProcedure
    .input(v.parser(UpdateTaskStatusInputSchema))
    .mutation(({ input }) => updateTaskStatusUseCase.execute(input)),
});
