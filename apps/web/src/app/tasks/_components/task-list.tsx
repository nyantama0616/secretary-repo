'use client';

import { ErrorDisplay } from '@/components/feedback/error-display';
import { Loading } from '@/components/feedback/loading';
import { formatDate } from '@/lib/format';
import type { TaskStatus } from '@/server/domain/task/task';
import { useQuery, useTRPC } from '@/trpc/client';


const STATUS_LABELS: Record<TaskStatus, string> = {
  not_started: '未着手',
  in_progress: '着手中',
  done: '完了',
  cancelled: '中止',
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
  title,
  status,
  dailyReportDate,
}: {
  title: string;
  status: TaskStatus;
  dailyReportDate: Date | null;
}) => {
  return (
    <div className="rounded-lg border p-4">
      <p className="font-semibold">{title}</p>
      <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
        <span>{STATUS_LABELS[status]}</span>
        {dailyReportDate && (
          <>
            <span>·</span>
            <span>{formatDate(dailyReportDate)}</span>
          </>
        )}
      </div>
    </div>
  );
};
