'use client';

import { move } from '@dnd-kit/helpers';
import { DragDropProvider } from '@dnd-kit/react';
import { useSortable } from '@dnd-kit/react/sortable';
import { Badge } from '@repo/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@repo/ui/dropdown-menu';
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
  const updateStatusMutation = useMutation(
    trpc.task.updateStatus.mutationOptions(),
  );

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

  const handleStatusChange = (taskId: string, status: SelectableStatus) => {
    updateStatusMutation.mutate(
      { id: taskId, status },
      { onSuccess: invalidateTasks },
    );
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
                onStatusChange={handleStatusChange}
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

const SELECTABLE_STATUSES = [
  'not_started',
  'in_progress',
  'done',
  'cancelled',
] as const;

type SelectableStatus = (typeof SELECTABLE_STATUSES)[number];

const SortableTaskRow = ({
  task,
  index,
  isNext,
  onStatusChange,
}: {
  task: TaskItem;
  index: number;
  isNext: boolean;
  onStatusChange: (taskId: string, status: SelectableStatus) => void;
}) => {
  const { ref, isDragging } = useSortable({ id: task.id, index });
  const config = STATUS_CONFIG[task.status];
  const isDone = task.status === 'done';

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onStatusChange(task.id, isDone ? 'not_started' : 'done');
  };

  return (
    <div
      ref={ref}
      className={`flex items-center gap-2 ${isDragging ? 'opacity-50' : ''} ${config.muted ? 'opacity-50' : ''} ${isNext ? '-translate-x-2' : ''}`}
    >
      <div className="flex w-6 shrink-0 cursor-grab items-center justify-center text-sm font-medium text-muted-foreground active:cursor-grabbing">
        {index + 1}
      </div>
      <div
        className={`flex min-w-0 flex-1 items-center gap-2 rounded-lg border transition-colors ${isNext ? 'shadow-md p-4' : 'p-3'}`}
      >
        <button
          type="button"
          aria-label={isDone ? 'タスクを未完了にする' : 'タスクを完了にする'}
          onClick={handleCheckboxClick}
          className={`flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-full border-2 transition-colors ${isDone ? 'border-success bg-success text-white' : 'border-muted-foreground/40 hover:border-success hover:bg-success/10'}`}
        >
          {isDone && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-3"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" className="shrink-0 cursor-pointer">
              <Badge variant={config.variant}>{config.label}</Badge>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuRadioGroup
              value={task.status}
              onValueChange={(value) =>
                onStatusChange(task.id, value as SelectableStatus)
              }
            >
              {SELECTABLE_STATUSES.map((status) => (
                <DropdownMenuRadioItem key={status} value={status}>
                  <Badge variant={STATUS_CONFIG[status].variant}>
                    {STATUS_CONFIG[status].label}
                  </Badge>
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        <Link
          href={ROUTES.taskDetail(task.id)}
          className="min-w-0 flex-1 hover:underline"
        >
          <span
            className={`truncate font-medium ${isNext ? 'text-base' : 'text-sm'} ${config.muted ? 'text-muted-foreground line-through' : ''}`}
          >
            {task.title}
          </span>
        </Link>
      </div>
    </div>
  );
};
