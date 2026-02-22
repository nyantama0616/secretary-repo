import { DrizzleDailyReportRepository } from '@/server/infrastructure/db/drizzle-daily-report-repository';
import { DrizzleMonthlyReportRepository } from '@/server/infrastructure/db/drizzle-monthly-report-repository';
import { DrizzleProjectRepository } from '@/server/infrastructure/db/drizzle-project-repository';
import { DrizzleTaskRepository } from '@/server/infrastructure/db/drizzle-task-repository';
import { DrizzleWeeklyReportRepository } from '@/server/infrastructure/db/drizzle-weekly-report-repository';
import { CreateDailyReportUseCase } from '@/server/usecase/daily-report/create-daily-report';
import { GetDailyReportUseCase } from '@/server/usecase/daily-report/get-daily-report';
import { GetDailyReportsUseCase } from '@/server/usecase/daily-report/get-daily-reports';
import { UpdateDailyReportUseCase } from '@/server/usecase/daily-report/update-daily-report';
import { CreateMonthlyReportUseCase } from '@/server/usecase/monthly-report/create-monthly-report';
import { GetMonthlyReportUseCase } from '@/server/usecase/monthly-report/get-monthly-report';
import { GetMonthlyReportsUseCase } from '@/server/usecase/monthly-report/get-monthly-reports';
import { ReviewMonthlyReportUseCase } from '@/server/usecase/monthly-report/review-monthly-report';
import { CreateProjectUseCase } from '@/server/usecase/project/create-project';
import { GetProjectUseCase } from '@/server/usecase/project/get-project';
import { GetProjectsUseCase } from '@/server/usecase/project/get-projects';
import { UpdateProjectUseCase } from '@/server/usecase/project/update-project';
import { UpdateProjectStatusUseCase } from '@/server/usecase/project/update-project-status';
import { AssignDailyReportUseCase } from '@/server/usecase/task/assign-daily-report';
import { CreateTaskUseCase } from '@/server/usecase/task/create-task';
import { DeferTaskUseCase } from '@/server/usecase/task/defer-task';
import { DeleteTaskUseCase } from '@/server/usecase/task/delete-task';
import { GetTaskDetailUseCase } from '@/server/usecase/task/get-task-detail';
import { GetTasksUseCase } from '@/server/usecase/task/get-tasks';
import { UpdateTaskUseCase } from '@/server/usecase/task/update-task';
import { UpdateTaskStatusUseCase } from '@/server/usecase/task/update-task-status';
import { CreateWeeklyReportUseCase } from '@/server/usecase/weekly-report/create-weekly-report';
import { GetWeeklyReportUseCase } from '@/server/usecase/weekly-report/get-weekly-report';
import { GetWeeklyReportsUseCase } from '@/server/usecase/weekly-report/get-weekly-reports';
import { ReviewWeeklyReportUseCase } from '@/server/usecase/weekly-report/review-weekly-report';
import { UpdateWeeklyReportUseCase } from '@/server/usecase/weekly-report/update-weekly-report';

const dailyReportRepository = new DrizzleDailyReportRepository();
const monthlyReportRepository = new DrizzleMonthlyReportRepository();
const weeklyReportRepository = new DrizzleWeeklyReportRepository();

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

export const getMonthlyReportsUseCase = new GetMonthlyReportsUseCase(
  monthlyReportRepository,
);
export const getMonthlyReportUseCase = new GetMonthlyReportUseCase(
  monthlyReportRepository,
  weeklyReportRepository,
);
export const createMonthlyReportUseCase = new CreateMonthlyReportUseCase(
  monthlyReportRepository,
);
export const reviewMonthlyReportUseCase = new ReviewMonthlyReportUseCase(
  monthlyReportRepository,
);

const projectRepository = new DrizzleProjectRepository();

export const getProjectsUseCase = new GetProjectsUseCase(projectRepository);
export const getProjectUseCase = new GetProjectUseCase(projectRepository);
export const createProjectUseCase = new CreateProjectUseCase(projectRepository);
export const updateProjectUseCase = new UpdateProjectUseCase(projectRepository);
export const updateProjectStatusUseCase = new UpdateProjectStatusUseCase(
  projectRepository,
);

export const getWeeklyReportsUseCase = new GetWeeklyReportsUseCase(
  weeklyReportRepository,
);
export const getWeeklyReportUseCase = new GetWeeklyReportUseCase(
  weeklyReportRepository,
  dailyReportRepository,
);
export const createWeeklyReportUseCase = new CreateWeeklyReportUseCase(
  weeklyReportRepository,
);
export const reviewWeeklyReportUseCase = new ReviewWeeklyReportUseCase(
  weeklyReportRepository,
);
export const updateWeeklyReportUseCase = new UpdateWeeklyReportUseCase(
  weeklyReportRepository,
);

const taskRepository = new DrizzleTaskRepository();

export const createTaskUseCase = new CreateTaskUseCase(
  taskRepository,
  projectRepository,
);
export const getTasksUseCase = new GetTasksUseCase(
  taskRepository,
  dailyReportRepository,
);
export const getTaskDetailUseCase = new GetTaskDetailUseCase(
  taskRepository,
  dailyReportRepository,
  projectRepository,
);
export const updateTaskUseCase = new UpdateTaskUseCase(
  taskRepository,
  projectRepository,
);
export const updateTaskStatusUseCase = new UpdateTaskStatusUseCase(
  taskRepository,
);
export const deleteTaskUseCase = new DeleteTaskUseCase(taskRepository);
export const deferTaskUseCase = new DeferTaskUseCase(taskRepository);
export const assignDailyReportUseCase = new AssignDailyReportUseCase(
  taskRepository,
  dailyReportRepository,
);
