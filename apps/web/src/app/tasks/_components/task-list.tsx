'use client';

import { Badge } from '@repo/ui/badge';
import Link from 'next/link';
import type { ComponentProps } from 'react';

import { ErrorDisplay } from '@/components/feedback/error-display';
import { Loading } from '@/components/feedback/loading';
import { ROUTES } from '@/constants/routes';
import { formatDate } from '@/lib/format';
import type { TaskStatus } from '@/server/domain/task/task';
import { useQuery, useTRPC } from '@/trpc/client';

const STATUS_CONFIG: Record<
  TaskStatus,
  { label: string; variant: ComponentProps<typeof Badge>['variant'] }
> = {
  not_started: { label: '未着手', variant: 'secondary' },
  in_progress: { label: '着手中', variant: 'default' },
  done: { label: '完了', variant: 'outline' },
  cancelled: { label: '中止', variant: 'destructive' },
};

export const TaskList = () => {
  const trpc = useTRPC();
  const { data: tasks, isLoading, isError, refetch } = useQuery(
    trpc.task.list.queryOptions(),
  );

  if (isLoading) {
    return <Loading />;
  }

  if (isError || !tasks) {
    return (
      <ErrorDisplay
        message="タスクの取得に失敗しました"
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="grid gap-4 p-8">
      <h1 className="text-2xl font-bold">タスク一覧</h1>
      {tasks.length === 0 ? (
        <p className="text-muted-foreground">タスクがまだありません</p>
      ) : (
        <div className="grid gap-3">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              href={ROUTES.taskDetail(task.id)}
              title={task.title}
              status={task.status}
              dailyReportDate={task.dailyReportDate}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const TaskCard = ({
  href,
  title,
  status,
  dailyReportDate,
}: {
  href: string;
  title: string;
  status: TaskStatus;
  dailyReportDate: Date | null;
}) => {
  return (
    <Link href={href} className="block rounded-lg border p-4 transition-colors hover:bg-muted/50">
      <p className="font-semibold">{title}</p>
      <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
        <Badge className="w-14" variant={STATUS_CONFIG[status].variant}>
          {STATUS_CONFIG[status].label}
        </Badge>
        {dailyReportDate && (
          <span>{formatDate(dailyReportDate)}</span>
        )}
      </div>
    </Link>
  );
};
