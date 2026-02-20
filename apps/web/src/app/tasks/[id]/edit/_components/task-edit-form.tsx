'use client';

import { valibotResolver } from '@hookform/resolvers/valibot';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@repo/ui/alert-dialog';
import { Button } from '@repo/ui/button';
import { Input } from '@repo/ui/input';
import { Label } from '@repo/ui/label';
import { Textarea } from '@repo/ui/textarea';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import * as v from 'valibot';

import { ErrorDisplay } from '@/components/feedback/error-display';
import { Loading } from '@/components/feedback/loading';
import { ROUTES } from '@/constants/routes';
import { toDateStr } from '@/lib/format';
import {
  useMutation,
  useQuery,
  useQueryClient,
  useTRPC,
} from '@/trpc/client';

const TaskEditFormSchema = v.object({
  title: v.pipe(v.string(), v.minLength(1, 'タイトルは必須です')),
  description: v.optional(v.string()),
  deadline: v.optional(v.string()),
  estimatedMinutes: v.optional(v.string()),
});

type FormValues = v.InferOutput<typeof TaskEditFormSchema>;

type TaskEditFormProps = {
  id: string;
};

export const TaskEditForm = ({ id }: TaskEditFormProps) => {
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
      <ErrorDisplay message="タスクの取得に失敗しました" onRetry={refetch} />
    );
  }

  return <EditForm id={id} task={task} />;
};

type Task = {
  title: string;
  description: string | null;
  deadline: Date | null;
  estimatedMinutes: number | null;
};

const EditForm = ({ id, task }: { id: string; task: Task }) => {
  const router = useRouter();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { register, handleSubmit, formState } = useForm<FormValues>({
    resolver: valibotResolver(TaskEditFormSchema),
    defaultValues: {
      title: task.title,
      description: task.description ?? '',
      deadline: task.deadline ? toDateStr(task.deadline) : '',
      estimatedMinutes:
        task.estimatedMinutes !== null ? String(task.estimatedMinutes) : '',
    },
  });

  const { mutate, isPending, error } = useMutation(
    trpc.task.update.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.task.list.queryKey(),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.task.detail.queryKey({ id }),
        });
        router.push(ROUTES.taskDetail(id));
      },
    }),
  );

  const {
    mutate: deleteMutate,
    isPending: isDeleting,
    error: deleteError,
  } = useMutation(
    trpc.task.delete.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.task.list.queryKey(),
        });
        router.push(ROUTES.tasks);
      },
    }),
  );

  const onSubmit = (data: FormValues) => {
    mutate({
      id,
      title: data.title,
      description: emptyToUndefined(data.description),
      deadline: data.deadline ? new Date(data.deadline) : undefined,
      estimatedMinutes: data.estimatedMinutes
        ? Number(data.estimatedMinutes)
        : undefined,
    });
  };

  return (
    <div className="grid gap-4 p-8">
      <h1 className="text-2xl font-bold">タスクを編集</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="grid max-w-lg gap-4">
        <div className="grid gap-2">
          <Label htmlFor="title">タイトル</Label>
          <Input id="title" {...register('title')} />
          {formState.errors.title && (
            <p className="text-sm text-destructive">
              {formState.errors.title.message}
            </p>
          )}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="description">説明</Label>
          <Textarea id="description" rows={3} {...register('description')} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="deadline">期限</Label>
            <Input id="deadline" type="date" {...register('deadline')} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="estimatedMinutes">見積もり（分）</Label>
            <Input
              id="estimatedMinutes"
              type="number"
              min={0}
              {...register('estimatedMinutes')}
            />
          </div>
        </div>
        {error && (
          <p className="text-sm text-destructive">
            タスクの更新に失敗しました
          </p>
        )}
        <Button type="submit" disabled={isPending}>
          {isPending ? '保存中...' : '保存する'}
        </Button>
      </form>
      <div className="flex max-w-lg items-center gap-4">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" disabled={isDeleting}>
              削除
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>タスクを削除しますか？</AlertDialogTitle>
              <AlertDialogDescription>
                この操作は取り消せません。
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>キャンセル</AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                onClick={() => deleteMutate({ id })}
              >
                削除する
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        {deleteError && (
          <p className="text-sm text-destructive">タスクの削除に失敗しました</p>
        )}
      </div>
    </div>
  );
};

const emptyToUndefined = (value: string | undefined): string | undefined => {
  if (!value || value.trim() === '') return undefined;
  return value;
};
