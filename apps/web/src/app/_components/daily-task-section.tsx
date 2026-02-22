'use client';

import { move } from '@dnd-kit/helpers';
import { DragDropProvider } from '@dnd-kit/react';
import { useSortable } from '@dnd-kit/react/sortable';
import { Badge } from '@repo/ui/badge';
import Link from 'next/link';
import { useState } from 'react';
import type { ComponentProps } from 'react';

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
  { label: string; variant: ComponentProps<typeof Badge>['variant'] }
> = {
  not_started: { label: '未着手', variant: 'secondary' },
  in_progress: { label: '着手中', variant: 'default' },
  done: { label: '完了', variant: 'outline' },
  cancelled: { label: '中止', variant: 'destructive' },
  deferred: { label: '延期', variant: 'secondary' },
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
  const displayTasks =
    optimisticTasks?.dataUpdatedAt === dataUpdatedAt
      ? optimisticTasks.tasks
      : (tasks ?? []);

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

const SortableTaskRow = ({
  task,
  index,
}: {
  task: TaskItem;
  index: number;
}) => {
  const { ref, isDragging } = useSortable({ id: task.id, index });

  return (
    <div
      ref={ref}
      className={`flex items-center gap-2 ${isDragging ? 'opacity-50' : ''}`}
    >
      <div className="flex w-6 shrink-0 cursor-grab items-center justify-center text-sm font-medium text-muted-foreground active:cursor-grabbing">
        {index + 1}
      </div>
      <Link
        href={ROUTES.taskDetail(task.id)}
        className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border p-3 transition-colors hover:bg-muted/50"
      >
        <span className="truncate font-medium">{task.title}</span>
        <Badge
          className="ml-auto shrink-0"
          variant={STATUS_CONFIG[task.status].variant}
        >
          {STATUS_CONFIG[task.status].label}
        </Badge>
      </Link>
    </div>
  );
};
