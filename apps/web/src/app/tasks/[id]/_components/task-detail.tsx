'use client';

import { Badge } from '@repo/ui/badge';
import { Button } from '@repo/ui/button';
import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';

import { ErrorDisplay } from '@/components/feedback/error-display';
import { Loading } from '@/components/feedback/loading';
import { MarkdownViewer } from '@/components/viewer/markdown-viewer';
import { ViewerFrame } from '@/components/viewer/viewer-frame';
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
  deferred: { label: '延期', variant: 'secondary' },
};

type TaskDetailProps = {
  id: string;
};

export const TaskDetail = ({ id }: TaskDetailProps) => {
  const trpc = useTRPC();
  const {
    data: task,
    isLoading,
    isError,
    refetch,
  } = useQuery(trpc.task.detail.queryOptions({ id }));

  if (isLoading) {
    return <Loading />;
  }

  if (isError || !task) {
    return (
      <ErrorDisplay
        message="タスクの取得に失敗しました"
        onRetry={refetch}
      />
    );
  }

  const isIncomplete =
    task.status === 'cancelled' || task.status === 'deferred';

  return (
    <div className="grid gap-4 p-8">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold">{task.title}</h1>
        <Button variant="outline" asChild>
          <Link href={ROUTES.taskEdit(id)}>編集</Link>
        </Button>
      </div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Badge variant={STATUS_CONFIG[task.status].variant}>
          {STATUS_CONFIG[task.status].label}
        </Badge>
        {task.dailyReportDate && (
          <span>{formatDate(task.dailyReportDate)}</span>
        )}
      </div>
      <dl className="grid gap-4">
        <DetailItem label="ファーストアクション" value={task.firstAction} />
        {task.description && (
          <DetailItem label="説明">
            <ViewerFrame>
              <MarkdownViewer content={task.description} />
            </ViewerFrame>
          </DetailItem>
        )}
        {task.project && (
          <div>
            <dt className="text-sm text-muted-foreground">プロジェクト</dt>
            <dd className="mt-1">
              <Link
                href={ROUTES.projectDetail(task.project.id)}
                className="text-primary underline-offset-4 hover:underline"
              >
                {task.project.name}
              </Link>
            </dd>
          </div>
        )}
        <DetailItem
          label="期限"
          value={task.deadline ? formatDate(task.deadline) : null}
        />
        <DetailItem
          label="見積もり"
          value={
            task.estimatedMinutes !== null
              ? `${task.estimatedMinutes}分`
              : null
          }
        />
        {isIncomplete && (
          <DetailItem
            label="未完了の理由"
            value={task.incompletionReason}
          />
        )}
      </dl>
    </div>
  );
};

const DetailItem = ({
  label,
  value,
  children,
}: {
  label: string;
  value?: string | null;
  children?: ReactNode;
}) => {
  if (!value && !children) return null;

  return (
    <div>
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="mt-1">
        {children ?? <span className="whitespace-pre-wrap">{value}</span>}
      </dd>
    </div>
  );
};
