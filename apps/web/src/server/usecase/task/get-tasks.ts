import type { DailyReportRepository } from '@/server/domain/daily-report/daily-report-repository';
import type { TaskStatus } from '@/server/domain/task/task';
import type { TaskRepository } from '@/server/domain/task/task-repository';

export type TaskListItem = {
  id: string;
  title: string;
  status: TaskStatus;
  dailyReportDate: Date | null;
};

export class GetTasksUseCase {
  constructor(
    private readonly taskRepository: TaskRepository,
    private readonly dailyReportRepository: DailyReportRepository,
  ) {}

  async execute(): Promise<TaskListItem[]> {
    const tasks = await this.taskRepository.findAll();

    const dailyReportIds = [
      ...new Set(
        tasks.map((t) => t.dailyReportId).filter((id) => id !== null),
      ),
    ];
    const dailyReports = await Promise.all(
      dailyReportIds.map((id) => this.dailyReportRepository.findById(id)),
    );
    const dateById = new Map(
      dailyReports
        .filter((r) => r !== null)
        .map((r) => [r.id, r.date]),
    );

    return tasks.map((t) => ({
      id: t.id,
      title: t.title,
      status: t.status,
      dailyReportDate: t.dailyReportId ? (dateById.get(t.dailyReportId) ?? null) : null,
    }));
  }
}
