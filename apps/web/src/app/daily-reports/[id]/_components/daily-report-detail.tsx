'use client';

import { Button } from '@repo/ui/button';
import Link from 'next/link';

import { ErrorDisplay } from '@/components/feedback/error-display';
import { Loading } from '@/components/feedback/loading';
import { MarkdownViewer } from '@/components/viewer/markdown-viewer';
import { ViewerFrame } from '@/components/viewer/viewer-frame';
import { ROUTES } from '@/constants/routes';
import { formatDate, formatTime } from '@/lib/format';
import { useQuery, useTRPC } from '@/trpc/client';

import { DailyReportTaskList } from './daily-report-task-list';

type DailyReportDetailProps = {
  id: string;
};

export const DailyReportDetail = ({ id }: DailyReportDetailProps) => {
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
      <ErrorDisplay
        message="日報の取得に失敗しました"
        onRetry={refetch}
      />
    );
  }

  const timeLabel = buildTimeLabel(report.wakeUpTime, report.bedTime);
  return (
    <div className="grid gap-6 p-8">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold">{formatDate(report.date)}</h1>
        <Button variant="outline" asChild>
          <Link href={ROUTES.dailyReportEdit(id)}>編集</Link>
        </Button>
      </div>

      {report.summary && (
        <section className="grid gap-2">
          <h2 className="border-b pb-2 text-lg font-semibold">サマリー</h2>
          <p className="whitespace-pre-wrap">{report.summary}</p>
        </section>
      )}

      {report.goal && (
        <section className="grid gap-2">
          <h2 className="border-b pb-2 text-lg font-semibold">目標</h2>
          <p className="whitespace-pre-wrap">{report.goal}</p>
        </section>
      )}

      {timeLabel && (
        <section className="grid gap-2">
          <h2 className="border-b pb-2 text-lg font-semibold">起床・就寝</h2>
          <p>{timeLabel}</p>
        </section>
      )}

      {report.review && (
        <section className="grid gap-2">
          <h2 className="border-b pb-2 text-lg font-semibold">
            振り返り
            {report.reviewStartedAt && report.reviewFinishedAt && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                {buildReviewDurationLabel(report.reviewStartedAt, report.reviewFinishedAt)}
              </span>
            )}
          </h2>
          <ViewerFrame>
            <MarkdownViewer content={report.review} />
          </ViewerFrame>
        </section>
      )}

      <section className="grid gap-2">
        <h2 className="border-b pb-2 text-lg font-semibold">タスク</h2>
        <DailyReportTaskList dailyReportId={id} />
      </section>

      {report.notes && (
        <section className="grid gap-2">
          <h2 className="border-b pb-2 text-lg font-semibold">その他メモ</h2>
          <ViewerFrame>
            <MarkdownViewer content={report.notes} />
          </ViewerFrame>
        </section>
      )}
    </div>
  );
};

const buildReviewDurationLabel = (
  startedAt: Date,
  finishedAt: Date,
): string => {
  const minutes = Math.round(
    (finishedAt.getTime() - startedAt.getTime()) / 60000,
  );
  return `${minutes}分（${formatTime(startedAt)}〜${formatTime(finishedAt)}）`;
};

const buildTimeLabel = (
  wakeUpTime: Date | null,
  bedTime: Date | null,
): string | null => {
  if (!wakeUpTime && !bedTime) return null;
  const parts: string[] = [];
  if (wakeUpTime) parts.push(`起床 ${formatTime(wakeUpTime)}`);
  if (bedTime) parts.push(`就寝 ${formatTime(bedTime)}`);
  return parts.join(' / ');
};
