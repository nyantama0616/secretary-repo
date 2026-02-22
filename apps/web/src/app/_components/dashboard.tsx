'use client';

import { Button } from '@repo/ui/button';
import Link from 'next/link';
import { useMemo } from 'react';

import { ErrorDisplay } from '@/components/feedback/error-display';
import { Loading } from '@/components/feedback/loading';
import { MarkdownViewer } from '@/components/viewer/markdown-viewer';
import { ViewerFrame } from '@/components/viewer/viewer-frame';
import { ROUTES } from '@/constants/routes';
import { formatDate, toDateStr } from '@/lib/format';
import { useQuery, useTRPC } from '@/trpc/client';

import { DailyTaskSection } from './daily-task-section';
import { ProjectSection } from './project-section';

export const Dashboard = () => {
  const trpc = useTRPC();
  const {
    data: dailyReports,
    isLoading,
    isError,
    refetch,
  } = useQuery(trpc.dailyReport.list.queryOptions());

  const { todayReport, tomorrowReport } = useMemo(() => {
    if (!dailyReports) return { todayReport: null, tomorrowReport: null };

    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayStr = toDateStr(today);
    const tomorrowStr = toDateStr(tomorrow);

    return {
      todayReport:
        dailyReports.find((r) => toDateStr(new Date(r.date)) === todayStr) ??
        null,
      tomorrowReport:
        dailyReports.find(
          (r) => toDateStr(new Date(r.date)) === tomorrowStr,
        ) ?? null,
    };
  }, [dailyReports]);

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    return (
      <ErrorDisplay message="データの取得に失敗しました" onRetry={refetch} />
    );
  }

  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  return (
    <div className="grid max-w-2xl gap-8 p-8">
      <h1 className="text-2xl font-bold">ダッシュボード</h1>

      {todayReport ? (
        <section className="grid gap-2">
          <div className="flex items-baseline justify-between">
            <h2 className="text-lg font-semibold">今日の目標</h2>
            <Button variant="outline" asChild>
              <Link href={ROUTES.dailyReportEdit(todayReport.id)}>編集</Link>
            </Button>
          </div>
          {todayReport.goal && (
            <p className="whitespace-pre-wrap">{todayReport.goal}</p>
          )}
        </section>
      ) : (
        <div className="flex justify-end">
          <Button variant="outline" asChild>
            <Link href={ROUTES.dailyReportCreate}>日報を書く</Link>
          </Button>
        </div>
      )}

      <DailyTaskSection
        label="今日のタスク"
        dateLabel={formatDate(today)}
        dailyReportId={todayReport?.id ?? null}
      />

      {todayReport?.review && (
        <section className="grid gap-2">
          <h2 className="text-lg font-semibold">振り返り</h2>
          <ViewerFrame>
            <MarkdownViewer content={todayReport.review} />
          </ViewerFrame>
        </section>
      )}

      <DailyTaskSection
        label="明日のタスク"
        dateLabel={formatDate(tomorrow)}
        dailyReportId={tomorrowReport?.id ?? null}
      />

      <ProjectSection />
    </div>
  );
};
