'use client';

import { Button } from '@repo/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui/select';
import Link from 'next/link';

import { ErrorDisplay } from '@/components/feedback/error-display';
import { Loading } from '@/components/feedback/loading';
import { ROUTES } from '@/constants/routes';
import { formatDate } from '@/lib/format';
import type { TaskStatus } from '@/server/domain/task/task';
import {
  useMutation,
  useQuery,
  useQueryClient,
  useTRPC,
} from '@/trpc/client';

const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: 'not_started', label: '未着手' },
  { value: 'in_progress', label: '着手中' },
  { value: 'done', label: '完了' },
  { value: 'cancelled', label: '中止' },
];

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

  return (
    <div className="grid gap-4 p-8">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold">{task.title}</h1>
        <Button variant="outline" asChild>
          <Link href={ROUTES.taskEdit(id)}>編集</Link>
        </Button>
      </div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <StatusSelect id={id} currentStatus={task.status} />
        {task.dailyReportDate && (
          <span>{formatDate(task.dailyReportDate)}</span>
        )}
      </div>
      <dl className="grid gap-4">
        <DetailItem label="説明" value={task.description} />
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
        {task.status === 'cancelled' && (
          <DetailItem label="中止理由" value={task.incompletionReason} />
        )}
      </dl>
    </div>
  );
};

const StatusSelect = ({
  id,
  currentStatus,
}: {
  id: string;
  currentStatus: TaskStatus;
}) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { mutate } = useMutation(
    trpc.task.updateStatus.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.task.list.queryKey(),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.task.detail.queryKey({ id }),
        });
      },
    }),
  );

  const handleStatusChange = (status: TaskStatus) => {
    mutate({ id, status });
  };

  return (
    <Select value={currentStatus} onValueChange={handleStatusChange}>
      <SelectTrigger size="sm" aria-label="ステータス">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {STATUS_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

const DetailItem = ({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) => {
  if (!value) return null;

  return (
    <div>
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="mt-1 whitespace-pre-wrap">{value}</dd>
    </div>
  );
};
