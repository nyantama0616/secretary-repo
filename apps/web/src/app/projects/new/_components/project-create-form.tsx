'use client';

import { valibotResolver } from '@hookform/resolvers/valibot';
import { Button } from '@repo/ui/button';
import { Input } from '@repo/ui/input';
import { Label } from '@repo/ui/label';
import { useRouter } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';
import * as v from 'valibot';

import { MarkdownEditor } from '@/components/editor/markdown-editor';
import { ROUTES } from '@/constants/routes';
import { useMutation, useQueryClient, useTRPC } from '@/trpc/client';

const ProjectCreateFormSchema = v.object({
  name: v.pipe(v.string(), v.minLength(1, 'プロジェクト名は必須です')),
  purpose: v.pipe(v.string(), v.minLength(1, '目的は必須です')),
  deadline: v.optional(v.string()),
});

type FormValues = v.InferOutput<typeof ProjectCreateFormSchema>;

export const ProjectCreateForm = () => {
  const router = useRouter();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: valibotResolver(ProjectCreateFormSchema),
  });

  const { mutate, isPending, error } = useMutation(
    trpc.project.create.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.project.list.queryKey(),
        });
        router.push(ROUTES.projects);
      },
    }),
  );

  const onSubmit = (data: FormValues) => {
    mutate({
      name: data.name,
      purpose: data.purpose,
      deadline: data.deadline ? new Date(data.deadline) : undefined,
    });
  };

  return (
    <div className="grid gap-4 p-8">
      <h1 className="text-2xl font-bold">プロジェクト作成</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="grid max-w-lg gap-4">
        <div className="grid gap-2">
          <Label htmlFor="name">プロジェクト名</Label>
          <Input id="name" {...register('name')} />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          )}
        </div>
        <div className="grid gap-2">
          <Label>目的</Label>
          <Controller
            name="purpose"
            control={control}
            render={({ field }) => (
              <MarkdownEditor
                value={field.value ?? ''}
                onChange={field.onChange}
              />
            )}
          />
          {errors.purpose && (
            <p className="text-sm text-destructive">{errors.purpose.message}</p>
          )}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="deadline">期限</Label>
          <Input id="deadline" type="date" {...register('deadline')} />
        </div>
        {error && (
          <p className="text-sm text-destructive">
            プロジェクトの作成に失敗しました
          </p>
        )}
        <Button type="submit" disabled={isPending}>
          {isPending ? '作成中...' : '作成'}
        </Button>
      </form>
    </div>
  );
};
