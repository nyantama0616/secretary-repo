'use client';

import { valibotResolver } from '@hookform/resolvers/valibot';
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
import { formatDate, formatTime } from '@/lib/format';
import {
  useMutation,
  useQuery,
  useQueryClient,
  useTRPC,
} from '@/trpc/client';

const DailyReportEditFormSchema = v.object({
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

type FormValues = v.InferOutput<typeof DailyReportEditFormSchema>;

type DailyReportEditFormProps = {
  id: string;
};

export const DailyReportEditForm = ({ id }: DailyReportEditFormProps) => {
  const trpc = useTRPC();
  const {
    data: report,
    isLoading,
    isError,
    refetch,
  } = useQuery(trpc.dailyReport.detail.queryOptions({ id }));

  if (isLoading) {
    return <Loading />;
  }

  if (isError || !report) {
    return (
      <ErrorDisplay message="日報の取得に失敗しました" onRetry={refetch} />
    );
  }

  return <EditForm id={id} report={report} />;
};

type Report = {
  date: Date;
  plan: string | null;
  summary: string | null;
  wakeUpTime: Date | null;
  bedTime: Date | null;
  goodPoints: string | null;
  badPoints: string | null;
  learnings: string | null;
  nextActions: string | null;
  notes: string | null;
};

const EditForm = ({ id, report }: { id: string; report: Report }) => {
  const router = useRouter();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const dateStr = toDateStr(report.date);

  const { register, handleSubmit } = useForm<FormValues>({
    resolver: valibotResolver(DailyReportEditFormSchema),
    defaultValues: {
      plan: report.plan ?? '',
      summary: report.summary ?? '',
      wakeUpTime: report.wakeUpTime ? formatTime(report.wakeUpTime) : '',
      bedTime: report.bedTime ? formatTime(report.bedTime) : '',
      goodPoints: report.goodPoints ?? '',
      badPoints: report.badPoints ?? '',
      learnings: report.learnings ?? '',
      nextActions: report.nextActions ?? '',
      notes: report.notes ?? '',
    },
  });

  const { mutate, isPending, error } = useMutation(
    trpc.dailyReport.update.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.dailyReport.list.queryKey(),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.dailyReport.detail.queryKey({ id }),
        });
        router.push(ROUTES.dailyReportDetail(id));
      },
    }),
  );

  const onSubmit = (data: FormValues) => {
    mutate({
      id,
      plan: emptyToUndefined(data.plan),
      summary: emptyToUndefined(data.summary),
      wakeUpTime: timeToDate(dateStr, data.wakeUpTime),
      bedTime: timeToDate(dateStr, data.bedTime),
      goodPoints: emptyToUndefined(data.goodPoints),
      badPoints: emptyToUndefined(data.badPoints),
      learnings: emptyToUndefined(data.learnings),
      nextActions: emptyToUndefined(data.nextActions),
      notes: emptyToUndefined(data.notes),
    });
  };

  return (
    <div className="grid gap-4 p-8">
      <h1 className="text-2xl font-bold">日報編集</h1>
      <p className="text-muted-foreground">{formatDate(report.date)}</p>
      <form onSubmit={handleSubmit(onSubmit)} className="grid max-w-lg gap-4">
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
          <p className="text-sm text-destructive">日報の更新に失敗しました</p>
        )}
        <Button type="submit" disabled={isPending}>
          {isPending ? '更新中...' : '更新'}
        </Button>
      </form>
    </div>
  );
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

const toDateStr = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};
