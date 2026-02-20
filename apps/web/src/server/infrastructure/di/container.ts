import { DrizzleDailyReportRepository } from '@/server/infrastructure/db/drizzle-daily-report-repository';
import { DrizzleTaskRepository } from '@/server/infrastructure/db/drizzle-task-repository';
import { CreateDailyReportUseCase } from '@/server/usecase/daily-report/create-daily-report';
import { DeleteDailyReportUseCase } from '@/server/usecase/daily-report/delete-daily-report';
import { GetDailyReportUseCase } from '@/server/usecase/daily-report/get-daily-report';
import { GetDailyReportsUseCase } from '@/server/usecase/daily-report/get-daily-reports';
import { UpdateDailyReportUseCase } from '@/server/usecase/daily-report/update-daily-report';
import { AssignDailyReportUseCase } from '@/server/usecase/task/assign-daily-report';
import { DeleteTaskUseCase } from '@/server/usecase/task/delete-task';
import { GetTaskDetailUseCase } from '@/server/usecase/task/get-task-detail';
import { GetTasksUseCase } from '@/server/usecase/task/get-tasks';
import { UpdateTaskUseCase } from '@/server/usecase/task/update-task';
import { UpdateTaskStatusUseCase } from '@/server/usecase/task/update-task-status';

const dailyReportRepository = new DrizzleDailyReportRepository();

export const getDailyReportsUseCase = new GetDailyReportsUseCase(
  dailyReportRepository,
);
export const getDailyReportUseCase = new GetDailyReportUseCase(
  dailyReportRepository,
);
export const createDailyReportUseCase = new CreateDailyReportUseCase(
  dailyReportRepository,
);
export const updateDailyReportUseCase = new UpdateDailyReportUseCase(
  dailyReportRepository,
);
export const deleteDailyReportUseCase = new DeleteDailyReportUseCase(
  dailyReportRepository,
);

const taskRepository = new DrizzleTaskRepository();

export const getTasksUseCase = new GetTasksUseCase(
  taskRepository,
  dailyReportRepository,
);
export const getTaskDetailUseCase = new GetTaskDetailUseCase(
  taskRepository,
  dailyReportRepository,
);
export const updateTaskUseCase = new UpdateTaskUseCase(taskRepository);
export const updateTaskStatusUseCase = new UpdateTaskStatusUseCase(
  taskRepository,
);
export const deleteTaskUseCase = new DeleteTaskUseCase(taskRepository);
export const assignDailyReportUseCase = new AssignDailyReportUseCase(
  taskRepository,
  dailyReportRepository,
);
