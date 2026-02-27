'use client';

import { Badge } from '@repo/ui/badge';
import Link from 'next/link';

import { ErrorDisplay } from '@/components/feedback/error-display';
import { Loading } from '@/components/feedback/loading';
import { ROUTES } from '@/constants/routes';
import { STATUS_CONFIG, sortInactiveFirst } from '@/lib/task-status';
import { useQuery, useTRPC } from '@/trpc/client';

type DailyReportTaskListProps = {
  dailyReportId: string;
};

export const DailyReportTaskList = ({
  dailyReportId,
}: DailyReportTaskListProps) => {
  const trpc = useTRPC();
  const {
    data: tasks,
    isLoading,
    isError,
    refetch,
  } = useQuery(trpc.task.list.queryOptions({ dailyReportId }));

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    return (
      <ErrorDisplay
        message="タスクの取得に失敗しました"
        onRetry={refetch}
      />
    );
  }

  if (!tasks || tasks.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        タスクはまだありません
      </p>
    );
  }

  const sorted = sortInactiveFirst(tasks);

  return (
    <div className="grid gap-2">
      {sorted.map((task) => {
        const config = STATUS_CONFIG[task.status];
        return (
          <div
            key={task.id}
            className={`flex items-center gap-2 rounded-lg border p-3 ${config.muted ? 'opacity-50' : ''}`}
          >
            <Badge variant={config.variant}>{config.label}</Badge>
            <Link
              href={ROUTES.taskDetail(task.id)}
              className="min-w-0 flex-1 hover:underline"
            >
              <span
                className={`truncate text-sm font-medium ${config.muted ? 'text-muted-foreground line-through' : ''}`}
              >
                {task.title}
              </span>
            </Link>
          </div>
        );
      })}
    </div>
  );
};
