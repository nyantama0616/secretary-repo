'use client';

import { valibotResolver } from '@hookform/resolvers/valibot';
import { Button } from '@repo/ui/button';
import { Input } from '@repo/ui/input';
import { Label } from '@repo/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui/select';
import { Textarea } from '@repo/ui/textarea';
import { useRouter } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';
import * as v from 'valibot';

import { ErrorDisplay } from '@/components/feedback/error-display';
import { Loading } from '@/components/feedback/loading';
import { ROUTES } from '@/constants/routes';
import { toDateStr } from '@/lib/format';
import type { ProjectStatus } from '@/server/domain/project/project';
import {
  useMutation,
  useQuery,
  useQueryClient,
  useTRPC,
} from '@/trpc/client';

const ProjectEditFormSchema = v.object({
  name: v.pipe(v.string(), v.minLength(1, 'プロジェクト名は必須です')),
  purpose: v.pipe(v.string(), v.minLength(1, '目的は必須です')),
  deadline: v.optional(v.string()),
  status: v.picklist(['active', 'done']),
});

type FormValues = v.InferOutput<typeof ProjectEditFormSchema>;

const STATUS_OPTIONS: { value: ProjectStatus; label: string }[] = [
  { value: 'active', label: '進行中' },
  { value: 'done', label: '完了' },
];

type ProjectEditFormProps = {
  id: string;
};

export const ProjectEditForm = ({ id }: ProjectEditFormProps) => {
  const trpc = useTRPC();
  const {
    data: project,
    isLoading,
    isError,
    refetch,
  } = useQuery(trpc.project.detail.queryOptions({ id }));

  if (isLoading) {
    return <Loading />;
  }

  if (isError || !project) {
    return (
      <ErrorDisplay
        message="プロジェクトの取得に失敗しました"
        onRetry={refetch}
      />
    );
  }

  return <EditForm id={id} project={project} />;
};

type Project = {
  name: string;
  purpose: string;
  status: ProjectStatus;
  deadline: Date | null;
};

const EditForm = ({ id, project }: { id: string; project: Project }) => {
  const router = useRouter();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { register, handleSubmit, control, formState } = useForm<FormValues>({
    resolver: valibotResolver(ProjectEditFormSchema),
    defaultValues: {
      name: project.name,
      purpose: project.purpose,
      deadline: project.deadline ? toDateStr(project.deadline) : '',
      status: project.status,
    },
  });

  const invalidateQueries = () => {
    queryClient.invalidateQueries({
      queryKey: trpc.project.list.queryKey(),
    });
    queryClient.invalidateQueries({
      queryKey: trpc.project.detail.queryKey({ id }),
    });
  };

  const { mutate: updateMutate, isPending: isUpdating, error: updateError } =
    useMutation(
      trpc.project.update.mutationOptions({
        onSuccess: invalidateQueries,
      }),
    );

  const {
    mutate: updateStatusMutate,
    isPending: isStatusUpdating,
    error: statusError,
  } = useMutation(
    trpc.project.updateStatus.mutationOptions({
      onSuccess: () => {
        invalidateQueries();
        router.push(ROUTES.projectDetail(id));
      },
    }),
  );

  const isPending = isUpdating || isStatusUpdating;
  const error = updateError || statusError;

  const onSubmit = (data: FormValues) => {
    updateMutate(
      {
        id,
        name: data.name,
        purpose: data.purpose,
        deadline: data.deadline ? new Date(data.deadline) : null,
      },
      {
        onSuccess: () => {
          if (data.status !== project.status) {
            updateStatusMutate({ id, status: data.status });
          } else {
            router.push(ROUTES.projectDetail(id));
          }
        },
      },
    );
  };

  return (
    <div className="grid gap-4 p-8">
      <h1 className="text-2xl font-bold">プロジェクトを編集</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="grid max-w-lg gap-4">
        <div className="grid gap-2">
          <Label htmlFor="name">プロジェクト名</Label>
          <Input id="name" {...register('name')} />
          {formState.errors.name && (
            <p className="text-sm text-destructive">
              {formState.errors.name.message}
            </p>
          )}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="purpose">目的</Label>
          <Textarea id="purpose" rows={3} {...register('purpose')} />
          {formState.errors.purpose && (
            <p className="text-sm text-destructive">
              {formState.errors.purpose.message}
            </p>
          )}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="deadline">期限</Label>
          <Input id="deadline" type="date" {...register('deadline')} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="status">ステータス</Label>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="status" className="w-full">
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
            )}
          />
        </div>
        {error && (
          <p className="text-sm text-destructive">
            プロジェクトの更新に失敗しました
          </p>
        )}
        <Button type="submit" disabled={isPending}>
          {isPending ? '保存中...' : '保存する'}
        </Button>
      </form>
    </div>
  );
};
