import * as v from 'valibot';

import { protectedProcedure, router } from '@/server/api/trpc';
import {
  assignDailyReportUseCase,
  createTaskUseCase,
  deferTaskUseCase,
  deleteTaskUseCase,
  getTaskDetailUseCase,
  getTasksUseCase,
  reorderTasksUseCase,
  updateTaskStatusUseCase,
  updateTaskUseCase,
} from '@/server/infrastructure/di/container';
import { AssignDailyReportInputSchema } from '@/server/usecase/task/assign-daily-report';
import { CreateTaskInputSchema } from '@/server/usecase/task/create-task';
import { DeferTaskInputSchema } from '@/server/usecase/task/defer-task';
import { DeleteTaskInputSchema } from '@/server/usecase/task/delete-task';
import { GetTaskDetailInputSchema } from '@/server/usecase/task/get-task-detail';
import { GetTasksInputSchema } from '@/server/usecase/task/get-tasks';
import { ReorderTasksInputSchema } from '@/server/usecase/task/reorder-tasks';
import { UpdateTaskInputSchema } from '@/server/usecase/task/update-task';
import { UpdateTaskStatusInputSchema } from '@/server/usecase/task/update-task-status';

export const taskRouter = router({
  list: protectedProcedure
    .input(v.parser(GetTasksInputSchema))
    .query(({ input }) => getTasksUseCase.execute(input)),
  create: protectedProcedure
    .input(v.parser(CreateTaskInputSchema))
    .mutation(({ input }) => createTaskUseCase.execute(input)),
  detail: protectedProcedure
    .input(v.parser(GetTaskDetailInputSchema))
    .query(({ input }) => getTaskDetailUseCase.execute(input)),
  update: protectedProcedure
    .input(v.parser(UpdateTaskInputSchema))
    .mutation(({ input }) => updateTaskUseCase.execute(input)),
  updateStatus: protectedProcedure
    .input(v.parser(UpdateTaskStatusInputSchema))
    .mutation(({ input }) => updateTaskStatusUseCase.execute(input)),
  defer: protectedProcedure
    .input(v.parser(DeferTaskInputSchema))
    .mutation(({ input }) => deferTaskUseCase.execute(input)),
  delete: protectedProcedure
    .input(v.parser(DeleteTaskInputSchema))
    .mutation(({ input }) => deleteTaskUseCase.execute(input)),
  reorder: protectedProcedure
    .input(v.parser(ReorderTasksInputSchema))
    .mutation(({ input }) => reorderTasksUseCase.execute(input)),
  assignDailyReport: protectedProcedure
    .input(v.parser(AssignDailyReportInputSchema))
    .mutation(({ input }) => assignDailyReportUseCase.execute(input)),
});
