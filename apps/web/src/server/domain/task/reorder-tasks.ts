import { ValidationError } from '@/server/domain/error/domain-errors';
import type { Task } from '@/server/domain/task/task';

/**
 * NOTE: sortOrder は同一日報内での優先順位を表すため、
 * 並び替え対象のタスクは全て同一の日報に紐づいている必要がある
 */
export const reorderTasks = (tasks: Task[]): Task[] => {
  const firstDailyReportId = tasks[0].dailyReportId;

  if (firstDailyReportId === null) {
    throw new ValidationError(
      '日報に紐づいていないタスクは並び替えできない',
    );
  }

  const hasDifferentReport = tasks.some(
    (task) => task.dailyReportId !== firstDailyReportId,
  );

  if (hasDifferentReport) {
    throw new ValidationError(
      '異なる日報に属するタスクをまとめて並び替えできない',
    );
  }

  return tasks.map((task, i) => task.update({ sortOrder: i }));
};
