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
import { formatDate } from '@/lib/format';
import { useMutation, useQueryClient, useTRPC } from '@/trpc/client';

const DailyReportCreateFormSchema = v.object({
  date: v.pipe(v.string(), v.minLength(1)),
  plan: v.optional(v.string()),
  summary: v.optional(v.string()),
  wakeUpTime: v.optional(v.string()),
  bedTime: v.optional(v.string()),
  goodPoints: v.optional(v.string()),
  badPoints: v.optional(v.string()),
  learnings: v.optional(v.string()),
  nextActions: v.optional(v.string()),
  notes: v.optional(v.string()),
});

type FormValues = v.InferOutput<typeof DailyReportCreateFormSchema>;

export const DailyReportCreateForm = () => {
  const router = useRouter();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: valibotResolver(DailyReportCreateFormSchema),
  });

  const { mutate, isPending, error } = useMutation(
    trpc.dailyReport.create.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.dailyReport.list.queryKey(),
        });
        router.push(ROUTES.dailyReports);
      },
    }),
  );

  const onSubmit = (data: FormValues) => {
    mutate({
      date: new Date(data.date),
      plan: emptyToUndefined(data.plan),
      summary: emptyToUndefined(data.summary),
      wakeUpTime: timeToDate(data.date, data.wakeUpTime),
      bedTime: timeToDate(data.date, data.bedTime),
      goodPoints: emptyToUndefined(data.goodPoints),
      badPoints: emptyToUndefined(data.badPoints),
      learnings: emptyToUndefined(data.learnings),
      nextActions: emptyToUndefined(data.nextActions),
      notes: emptyToUndefined(data.notes),
    });
  };

  return (
    <div className="grid gap-4 p-8">
      <h1 className="text-2xl font-bold">日報作成</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="grid max-w-lg gap-4">
        <div className="grid gap-2">
          <Label htmlFor="date">日付</Label>
          <Input id="date" type="date" {...register('date')} />
          {errors.date && (
            <p className="text-sm text-destructive">{errors.date.message}</p>
          )}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="plan">予定</Label>
          <Textarea id="plan" rows={2} {...register('plan')} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="summary">サマリー</Label>
          <Textarea id="summary" rows={2} {...register('summary')} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="wakeUpTime">起床時刻</Label>
            <Input id="wakeUpTime" type="time" {...register('wakeUpTime')} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="bedTime">就寝時刻</Label>
            <Input id="bedTime" type="time" {...register('bedTime')} />
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="goodPoints">良かった点</Label>
          <Textarea id="goodPoints" rows={2} {...register('goodPoints')} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="badPoints">改善点</Label>
          <Textarea id="badPoints" rows={2} {...register('badPoints')} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="learnings">学び</Label>
          <Textarea id="learnings" rows={2} {...register('learnings')} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="nextActions">ネクストアクション</Label>
          <Textarea id="nextActions" rows={2} {...register('nextActions')} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="notes">メモ</Label>
          <Textarea id="notes" rows={2} {...register('notes')} />
        </div>
        {error && (
          <p className="text-sm text-destructive">
            {toErrorMessage(error, getValues('date'))}
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
  date: string,
): string => {
  if (error.data?.code === 'CONFLICT') {
    return `${formatDate(new Date(date))}の日報はすでに存在します`;
  }
  return '日報の作成に失敗しました';
};

const emptyToUndefined = (value: string | undefined): string | undefined => {
  if (!value || value.trim() === '') return undefined;
  return value;
};

const timeToDate = (
  dateStr: string,
  timeStr: string | undefined,
): Date | undefined => {
  if (!timeStr || timeStr.trim() === '') return undefined;
  return new Date(`${dateStr}T${timeStr}`);
};
