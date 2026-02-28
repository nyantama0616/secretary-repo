import { ValidationError } from '@/server/domain/error/domain-errors';
import { Task } from '@/server/domain/task/task';

type DeferTaskParams = {
  id: string;
  createdAt: Date;
  incompletionReason?: string | null;
};

type DeferTaskResult = {
  deferred: Task;
  newTask: Task;
};

const DEFERRABLE_STATUSES = new Set(['not_started', 'in_progress']);

export const deferTask = (
  task: Task,
  params: DeferTaskParams,
): DeferTaskResult => {
  if (!DEFERRABLE_STATUSES.has(task.status)) {
    throw new ValidationError(
      `ステータスが「${task.status}」のタスクは延期できません`,
    );
  }

  const deferred = task.update({
    status: 'deferred',
    incompletionReason: params.incompletionReason,
  });

  const newTask = Task.create({
    id: params.id,
    dailyReportId: null,
    projectId: task.projectId,
    title: task.title,
    description: task.description,
    deadline: task.deadline,
    estimatedMinutes: task.estimatedMinutes,
    firstAction: task.firstAction,
    notes: task.notes,
    carriedOverFromId: task.id,
    createdAt: params.createdAt,
  });

  return { deferred, newTask };
};
