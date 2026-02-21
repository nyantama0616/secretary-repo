'use client';

import { valibotResolver } from '@hookform/resolvers/valibot';
import { Button } from '@repo/ui/button';
import { Input } from '@repo/ui/input';
import { Label } from '@repo/ui/label';
import { Textarea } from '@repo/ui/textarea';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import * as v from 'valibot';

import { ROUTES } from '@/constants/routes';
import { formatMonth } from '@/lib/format';
import { useMutation, useQueryClient, useTRPC } from '@/trpc/client';

const MonthlyReportCreateFormSchema = v.object({
  month: v.pipe(v.string(), v.minLength(1)),
  goal: v.optional(v.string()),
});

type FormValues = v.InferOutput<typeof MonthlyReportCreateFormSchema>;

export const MonthlyReportCreateForm = () => {
  const router = useRouter();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: valibotResolver(MonthlyReportCreateFormSchema),
  });

  const { mutate, isPending, error } = useMutation(
    trpc.monthlyReport.create.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.monthlyReport.list.queryKey(),
        });
        router.push(ROUTES.monthlyReports);
      },
    }),
  );

  const onSubmit = (data: FormValues) => {
    mutate({
      startDate: toFirstOfMonth(data.month),
      goal: emptyToUndefined(data.goal),
    });
  };

  return (
    <div className="grid gap-4 p-8">
      <h1 className="text-2xl font-bold">月報作成</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="grid max-w-lg gap-4">
        <div className="grid gap-2">
          <Label htmlFor="month">月</Label>
          <Input id="month" type="month" {...register('month')} />
          {errors.month && (
            <p className="text-sm text-destructive">{errors.month.message}</p>
          )}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="goal">目標</Label>
          <Textarea id="goal" rows={2} {...register('goal')} />
        </div>
        {error && (
          <p className="text-sm text-destructive">
            {toErrorMessage(error, getValues('month'))}
          </p>
        )}
        <Button type="submit" disabled={isPending}>
          {isPending ? '作成中...' : '作成'}
        </Button>
      </form>
    </div>
  );
};

const toErrorMessage = (
  error: { data?: { code?: string } | null },
  month: string,
): string => {
  if (error.data?.code === 'CONFLICT') {
    return `${formatMonth(toFirstOfMonth(month))}の月報はすでに存在します`;
  }
  return '月報の作成に失敗しました';
};

const toFirstOfMonth = (monthStr: string): Date => {
  return new Date(`${monthStr}-01`);
};

const emptyToUndefined = (value: string | undefined): string | undefined => {
  if (!value || value.trim() === '') return undefined;
  return value;
};
