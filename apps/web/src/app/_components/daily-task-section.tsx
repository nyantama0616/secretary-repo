'use client';

import { move } from '@dnd-kit/helpers';
import { DragDropProvider } from '@dnd-kit/react';
import { useSortable } from '@dnd-kit/react/sortable';
import { Badge } from '@repo/ui/badge';
import Link from 'next/link';
import type { ComponentProps } from 'react';
import { useState } from 'react';

import { ErrorDisplay } from '@/components/feedback/error-display';
import { Loading } from '@/components/feedback/loading';
import { ROUTES } from '@/constants/routes';
import type { TaskStatus } from '@/server/domain/task/task';
import {
  useMutation,
  useQuery,
  useQueryClient,
  useTRPC,
} from '@/trpc/client';

import { TaskAddForm } from './task-add-form';

const STATUS_CONFIG: Record<
  TaskStatus,
  {
    label: string;
    variant: ComponentProps<typeof Badge>['variant'];
    muted: boolean;
  }
> = {
  not_started: { label: '未着手', variant: 'secondary', muted: false },
  in_progress: { label: '着手中', variant: 'info', muted: false },
  done: { label: '完了', variant: 'success', muted: true },
  cancelled: { label: '中止', variant: 'destructive', muted: true },
  deferred: { label: '延期', variant: 'warning', muted: true },
};

type TaskItem = {
  id: string;
  title: string;
  status: TaskStatus;
};

type DailyTaskSectionProps = {
  label: string;
  dateLabel: string;
  dailyReportId: string | null;
};

export const DailyTaskSection = ({
  label,
  dateLabel,
  dailyReportId,
}: DailyTaskSectionProps) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const taskQueryOptions = trpc.task.list.queryOptions(
    dailyReportId ? { dailyReportId } : undefined,
  );
  const {
    data: tasks,
    dataUpdatedAt,
    isLoading,
    isError,
    refetch,
  } = useQuery({ ...taskQueryOptions, enabled: !!dailyReportId });

  const reorderMutation = useMutation(trpc.task.reorder.mutationOptions());
  const createMutation = useMutation(trpc.task.create.mutationOptions());

  // NOTE: D&D による楽観的な並び順を保持するためにローカル状態を使う
  // サーバーデータが更新（dataUpdatedAt が変化）したらローカル状態をリセットする
  const [optimisticTasks, setOptimisticTasks] = useState<{
    tasks: TaskItem[];
    dataUpdatedAt: number;
  } | null>(null);
  // NOTE: 完了済みタスクを上に、未完了タスクを下に表示する
  // 各グループ内では sortOrder（元の並び順）を維持する
  const displayTasks = sortByCompletion(
    optimisticTasks?.dataUpdatedAt === dataUpdatedAt
      ? optimisticTasks.tasks
      : (tasks ?? []),
  );

  const invalidateTasks = () => {
    queryClient.invalidateQueries({ queryKey: taskQueryOptions.queryKey });
  };

  const handleAddTask = async (title: string) => {
    if (!dailyReportId) return;
    await createMutation.mutateAsync({ title, dailyReportId });
    invalidateTasks();
  };

  return (
    <section className="grid gap-3">
      <div className="flex items-baseline gap-2">
        <h2 className="text-lg font-semibold">{label}</h2>
        <span className="text-sm text-muted-foreground">{dateLabel}</span>
      </div>

      {!dailyReportId ? (
        <p className="text-sm text-muted-foreground">
          タスクはまだありません
        </p>
      ) : isLoading ? (
        <Loading />
      ) : isError ? (
        <ErrorDisplay
          message="タスクの取得に失敗しました"
          onRetry={refetch}
        />
      ) : displayTasks.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          タスクはまだありません
        </p>
      ) : (
        <DragDropProvider
          onDragEnd={(event) => {
            const updated = move(displayTasks, event);
            setOptimisticTasks({ tasks: updated, dataUpdatedAt });
            reorderMutation.mutate(
              { taskIds: updated.map((t) => t.id) },
              { onSuccess: invalidateTasks },
            );
          }}
        >
          <div className="grid gap-2">
            {displayTasks.map((task, index) => (
              <SortableTaskRow
                key={task.id}
                task={task}
                index={index}
                isNext={task.id === findNextTaskId(displayTasks)}
              />
            ))}
          </div>
        </DragDropProvider>
      )}

      {dailyReportId && (
        <div className="pl-8">
          <TaskAddForm
            disabled={createMutation.isPending}
            onSubmit={handleAddTask}
          />
        </div>
      )}
    </section>
  );
};

const INACTIVE_STATUSES: Set<TaskStatus> = new Set([
  'done',
  'cancelled',
  'deferred',
]);

const sortByCompletion = (tasks: TaskItem[]): TaskItem[] => {
  const done = tasks.filter((t) => INACTIVE_STATUSES.has(t.status));
  const active = tasks.filter((t) => !INACTIVE_STATUSES.has(t.status));
  return [...done, ...active];
};

const findNextTaskId = (tasks: TaskItem[]): string | null => {
  const next = tasks.find((t) => !INACTIVE_STATUSES.has(t.status));
  return next?.id ?? null;
};

const SortableTaskRow = ({
  task,
  index,
  isNext,
}: {
  task: TaskItem;
  index: number;
  isNext: boolean;
}) => {
  const { ref, isDragging } = useSortable({ id: task.id, index });
  const config = STATUS_CONFIG[task.status];

  return (
    <div
      ref={ref}
      className={`flex items-center gap-2 ${isDragging ? 'opacity-50' : ''} ${config.muted ? 'opacity-50' : ''} ${isNext ? '-translate-x-2' : ''}`}
    >
      <div className="flex w-6 shrink-0 cursor-grab items-center justify-center text-sm font-medium text-muted-foreground active:cursor-grabbing">
        {index + 1}
      </div>
      <Link
        href={ROUTES.taskDetail(task.id)}
        className={`flex min-w-0 flex-1 items-center gap-2 rounded-lg border transition-colors hover:bg-muted/50 ${isNext ? 'shadow-md p-4' : 'p-3'}`}
      >
        <Badge className="shrink-0" variant={config.variant}>
          {config.label}
        </Badge>
        <span
          className={`truncate font-medium ${isNext ? 'text-base' : 'text-sm'} ${config.muted ? 'text-muted-foreground line-through' : ''}`}
        >
          {task.title}
        </span>
      </Link>
    </div>
  );
};
