'use client';

import { valibotResolver } from '@hookform/resolvers/valibot';
import { Button } from '@repo/ui/button';
import { Input } from '@repo/ui/input';
import { Label } from '@repo/ui/label';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import * as v from 'valibot';

import { ROUTES } from '@/constants/routes';
import { useMutation, useQueryClient, useTRPC } from '@/trpc/client';

const UserCreateFormSchema = v.object({
  name: v.pipe(v.string(), v.minLength(1)),
  email: v.pipe(v.string(), v.email()),
});

type FormValues = v.InferOutput<typeof UserCreateFormSchema>;

export const UserCreateForm = () => {
  const router = useRouter();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: valibotResolver(UserCreateFormSchema),
  });

  const { mutate, isPending, error } = useMutation(
    trpc.user.create.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: trpc.user.list.queryKey() });
        router.push(ROUTES.users);
      },
    }),
  );

  const onSubmit = (data: FormValues) => {
    mutate(data);
  };

  return (
    <div className="grid gap-4 p-8">
      <h1 className="text-2xl font-bold">ユーザー作成</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="grid max-w-md gap-4">
        <div className="grid gap-2">
          <Label htmlFor="name">名前</Label>
          <Input id="name" {...register('name')} />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          )}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">メールアドレス</Label>
          <Input id="email" type="email" {...register('email')} />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>
        {error && (
          <p className="text-sm text-destructive">{error.message}</p>
        )}
        <Button type="submit" disabled={isPending}>
          {isPending ? '作成中...' : '作成'}
        </Button>
      </form>
    </div>
  );
};
