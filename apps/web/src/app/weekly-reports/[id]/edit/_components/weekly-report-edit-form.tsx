'use client';

import { valibotResolver } from '@hookform/resolvers/valibot';
import { Button } from '@repo/ui/button';
import { Label } from '@repo/ui/label';
import { Textarea } from '@repo/ui/textarea';
import { useRouter } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';
import * as v from 'valibot';

import { MarkdownEditor } from '@/components/editor/markdown-editor';
import { ErrorDisplay } from '@/components/feedback/error-display';
import { Loading } from '@/components/feedback/loading';
import { ROUTES } from '@/constants/routes';
import { formatWeekRange } from '@/lib/format';
import {
  useMutation,
  useQuery,
  useQueryClient,
  useTRPC,
} from '@/trpc/client';

const WeeklyReportEditFormSchema = v.object({
  goal: v.optional(v.string()),
  summary: v.optional(v.string()),
  review: v.optional(v.string()),
  notes: v.optional(v.string()),
});

type FormValues = v.InferOutput<typeof WeeklyReportEditFormSchema>;

type WeeklyReportEditFormProps = {
  id: string;
};

export const WeeklyReportEditForm = ({ id }: WeeklyReportEditFormProps) => {
  const trpc = useTRPC();
  const {
    data: report,
    isLoading,
    isError,
    refetch,
  } = useQuery(trpc.weeklyReport.detail.queryOptions({ id }));

  if (isLoading) {
    return <Loading />;
  }

  if (isError || !report) {
    return (
      <ErrorDisplay message="週報の取得に失敗しました" onRetry={refetch} />
    );
  }

  return <EditForm id={id} report={report} />;
};

type Report = {
  startDate: Date;
  goal: string | null;
  summary: string | null;
  review: string | null;
  notes: string | null;
};

const EditForm = ({ id, report }: { id: string; report: Report }) => {
  const router = useRouter();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { register, handleSubmit, control } = useForm<FormValues>({
    resolver: valibotResolver(WeeklyReportEditFormSchema),
    defaultValues: {
      goal: report.goal ?? '',
      summary: report.summary ?? '',
      review: report.review ?? '',
      notes: report.notes ?? '',
    },
  });

  const { mutate, isPending, error } = useMutation(
    trpc.weeklyReport.update.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.weeklyReport.list.queryKey(),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.weeklyReport.detail.queryKey({ id }),
        });
        router.push(ROUTES.weeklyReportDetail(id));
      },
    }),
  );

  const onSubmit = (data: FormValues) => {
    mutate({
      id,
      goal: emptyToUndefined(data.goal),
      summary: emptyToUndefined(data.summary),
      review: emptyToUndefined(data.review),
      notes: emptyToUndefined(data.notes),
    });
  };

  return (
    <div className="grid gap-4 p-8">
      <h1 className="text-2xl font-bold">週報編集</h1>
      <p className="text-muted-foreground">
        {formatWeekRange(report.startDate)}
      </p>
      <form onSubmit={handleSubmit(onSubmit)} className="grid max-w-lg gap-4">
        <div className="grid gap-2">
          <Label htmlFor="goal">目標</Label>
          <Textarea id="goal" rows={2} {...register('goal')} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="summary">サマリー</Label>
          <Textarea id="summary" rows={2} {...register('summary')} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="review">振り返り</Label>
          <Controller
            name="review"
            control={control}
            render={({ field }) => (
              <MarkdownEditor
                id="review"
                value={field.value ?? ''}
                onChange={field.onChange}
              />
            )}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="notes">メモ</Label>
          <Controller
            name="notes"
            control={control}
            render={({ field }) => (
              <MarkdownEditor
                id="notes"
                value={field.value ?? ''}
                onChange={field.onChange}
              />
            )}
          />
        </div>
        {error && (
          <p className="text-sm text-destructive">週報の更新に失敗しました</p>
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
