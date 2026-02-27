'use client';

import { Button } from '@repo/ui/button';
import Link from 'next/link';

import { ErrorDisplay } from '@/components/feedback/error-display';
import { Loading } from '@/components/feedback/loading';
import { ROUTES } from '@/constants/routes';
import { formatDate, formatTime } from '@/lib/format';
import { useQuery, useTRPC } from '@/trpc/client';

export const DailyReportList = () => {
  const trpc = useTRPC();
  const {
    data: dailyReports,
    isLoading,
    isError,
    refetch,
  } = useQuery(trpc.dailyReport.list.queryOptions());

  if (isLoading) {
    return <Loading />;
  }

  if (isError || !dailyReports) {
    return (
      <ErrorDisplay
        message="日報の取得に失敗しました"
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="grid gap-4 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">日報一覧</h1>
        <Button asChild>
          <Link href={ROUTES.dailyReportCreate}>日報を作成</Link>
        </Button>
      </div>
      {dailyReports.length === 0 ? (
        <p className="text-muted-foreground">日報がまだありません</p>
      ) : (
        <div className="grid gap-3">
          {dailyReports.map((report) => (
            <Link key={report.id} href={ROUTES.dailyReportDetail(report.id)}>
              <DailyReportCard
                date={report.date}
                summary={report.summary}
                wakeUpTime={report.wakeUpTime}
                bedTime={report.bedTime}
              />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

const DailyReportCard = ({
  date,
  summary,
  wakeUpTime,
  bedTime,
}: {
  date: Date;
  summary: string | null;
  wakeUpTime: Date | null;
  bedTime: Date | null;
}) => {
  const timeLabel = buildTimeLabel(wakeUpTime, bedTime, date);

  return (
    <div className="rounded-lg border p-4 transition-colors hover:bg-muted/50">
      <p className="font-semibold">{formatDate(date)}</p>
      {summary && (
        <p className="mt-1 text-sm text-muted-foreground">{summary}</p>
      )}
      {timeLabel && (
        <p className="mt-1 text-sm text-muted-foreground">{timeLabel}</p>
      )}
    </div>
  );
};

const buildTimeLabel = (
  wakeUpTime: Date | null,
  bedTime: Date | null,
  baseDate: Date,
): string | null => {
  if (!wakeUpTime && !bedTime) return null;
  const parts: string[] = [];
  if (wakeUpTime) parts.push(`起床 ${formatTime(wakeUpTime, baseDate)}`);
  if (bedTime) parts.push(`就寝 ${formatTime(bedTime, baseDate)}`);
  return parts.join(' / ');
};
