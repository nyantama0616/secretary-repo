'use client';

import { useMemo } from 'react';

import { ErrorDisplay } from '@/components/feedback/error-display';
import { Loading } from '@/components/feedback/loading';
import { formatDate, toDateStr } from '@/lib/format';
import { useQuery, useTRPC } from '@/trpc/client';

import { DailyTaskSection } from './daily-task-section';

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
    <div className="grid gap-8 p-8">
      <h1 className="text-2xl font-bold">ダッシュボード</h1>

      <DailyTaskSection
        label="今日のタスク"
        dateLabel={formatDate(today)}
        dailyReportId={todayReport?.id ?? null}
      />

      <DailyTaskSection
        label="明日のタスク"
        dateLabel={formatDate(tomorrow)}
        dailyReportId={tomorrowReport?.id ?? null}
      />
    </div>
  );
};
