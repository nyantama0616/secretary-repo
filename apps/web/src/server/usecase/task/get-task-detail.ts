import * as v from 'valibot';

import type { DailyReportRepository } from '@/server/domain/daily-report/daily-report-repository';
import { NotFoundError } from '@/server/domain/error/domain-errors';
import type { ProjectRepository } from '@/server/domain/project/project-repository';
import type { TaskStatus } from '@/server/domain/task/task';
import type { TaskRepository } from '@/server/domain/task/task-repository';

export const GetTaskDetailInputSchema = v.object({
  id: v.string(),
});

type GetTaskDetailInput = v.InferOutput<typeof GetTaskDetailInputSchema>;

type TaskDetailProject = {
  id: string;
  name: string;
};

type TaskDetail = {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  deadline: Date | null;
  estimatedMinutes: number | null;
  incompletionReason: string | null;
  firstAction: string | null;
  dailyReportDate: Date | null;
  project: TaskDetailProject | null;
  createdAt: Date;
};

export class GetTaskDetailUseCase {
  constructor(
    private readonly taskRepository: TaskRepository,
    private readonly dailyReportRepository: DailyReportRepository,
    private readonly projectRepository: ProjectRepository,
  ) {}

  async execute(input: GetTaskDetailInput): Promise<TaskDetail> {
    const task = await this.taskRepository.findById(input.id);

    if (!task) {
      throw new NotFoundError('タスク', input.id);
    }

    const [dailyReportDate, project] = await Promise.all([
      this.resolveDailyReportDate(task.dailyReportId),
      this.resolveProject(task.projectId),
    ]);

    return {
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      deadline: task.deadline,
      estimatedMinutes: task.estimatedMinutes,
      incompletionReason: task.incompletionReason,
      firstAction: task.firstAction,
      dailyReportDate,
      project,
      createdAt: task.createdAt,
    };
  }

  private async resolveDailyReportDate(
    dailyReportId: string | null,
  ): Promise<Date | null> {
    if (!dailyReportId) return null;

    const dailyReport =
      await this.dailyReportRepository.findById(dailyReportId);
    return dailyReport?.date ?? null;
  }

  private async resolveProject(
    projectId: string | null,
  ): Promise<TaskDetailProject | null> {
    if (!projectId) return null;

    const project = await this.projectRepository.findById(projectId);
    if (!project) return null;

    return { id: project.id, name: project.name };
  }
}
