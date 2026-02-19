'use client';

import { ErrorDisplay } from '@/components/feedback/error-display';
import { Loading } from '@/components/feedback/loading';
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

  if (dailyReports.length === 0) {
    return (
      <div className="grid gap-4 p-8">
        <h1 className="text-2xl font-bold">日報一覧</h1>
        <p className="text-muted-foreground">日報がまだありません</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 p-8">
      <h1 className="text-2xl font-bold">日報一覧</h1>
      <div className="grid gap-3">
        {dailyReports.map((report) => (
          <DailyReportCard
            key={report.id}
            date={report.date}
            plan={report.plan}
            wakeUpTime={report.wakeUpTime}
            bedTime={report.bedTime}
          />
        ))}
      </div>
    </div>
  );
};

const DailyReportCard = ({
  date,
  plan,
  wakeUpTime,
  bedTime,
}: {
  date: string;
  plan: string | null;
  wakeUpTime: string | null;
  bedTime: string | null;
}) => {
  const timeLabel = buildTimeLabel(wakeUpTime, bedTime);

  return (
    <div className="rounded-lg border p-4">
      <p className="font-semibold">{formatDate(date)}</p>
      {plan && (
        <p className="mt-1 text-sm text-muted-foreground">{plan}</p>
      )}
      {timeLabel && (
        <p className="mt-1 text-sm text-muted-foreground">{timeLabel}</p>
      )}
    </div>
  );
};

const buildTimeLabel = (
  wakeUpTime: string | null,
  bedTime: string | null,
): string | null => {
  if (!wakeUpTime && !bedTime) return null;
  const parts: string[] = [];
  if (wakeUpTime) parts.push(`起床 ${formatTime(wakeUpTime)}`);
  if (bedTime) parts.push(`就寝 ${formatTime(bedTime)}`);
  return parts.join(' / ');
};
