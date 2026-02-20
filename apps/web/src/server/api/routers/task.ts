import * as v from 'valibot';

import { protectedProcedure, router } from '@/server/api/trpc';
import {
  assignDailyReportUseCase,
  deleteTaskUseCase,
  getTaskDetailUseCase,
  getTasksUseCase,
  updateTaskStatusUseCase,
  updateTaskUseCase,
} from '@/server/infrastructure/di/container';
import { AssignDailyReportInputSchema } from '@/server/usecase/task/assign-daily-report';
import { DeleteTaskInputSchema } from '@/server/usecase/task/delete-task';
import { GetTaskDetailInputSchema } from '@/server/usecase/task/get-task-detail';
import { UpdateTaskInputSchema } from '@/server/usecase/task/update-task';
import { UpdateTaskStatusInputSchema } from '@/server/usecase/task/update-task-status';

export const taskRouter = router({
  list: protectedProcedure.query(() => getTasksUseCase.execute()),
  detail: protectedProcedure
    .input(v.parser(GetTaskDetailInputSchema))
    .query(({ input }) => getTaskDetailUseCase.execute(input)),
  update: protectedProcedure
    .input(v.parser(UpdateTaskInputSchema))
    .mutation(({ input }) => updateTaskUseCase.execute(input)),
  updateStatus: protectedProcedure
    .input(v.parser(UpdateTaskStatusInputSchema))
    .mutation(({ input }) => updateTaskStatusUseCase.execute(input)),
  delete: protectedProcedure
    .input(v.parser(DeleteTaskInputSchema))
    .mutation(({ input }) => deleteTaskUseCase.execute(input)),
  assignDailyReport: protectedProcedure
    .input(v.parser(AssignDailyReportInputSchema))
    .mutation(({ input }) => assignDailyReportUseCase.execute(input)),
});
