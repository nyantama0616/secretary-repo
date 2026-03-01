'use client';

import { Button } from '@repo/ui/button';
import Link from 'next/link';

import { ErrorDisplay } from '@/components/feedback/error-display';
import { Loading } from '@/components/feedback/loading';
import { ROUTES } from '@/constants/routes';
import { formatWeekRange } from '@/lib/format';
import { useQuery, useTRPC } from '@/trpc/client';

export const WeeklyReportList = () => {
  const trpc = useTRPC();
  const {
    data: weeklyReports,
    isLoading,
    isError,
    refetch,
  } = useQuery(trpc.weeklyReport.list.queryOptions());

  if (isLoading) {
    return <Loading />;
  }

  if (isError || !weeklyReports) {
    return (
      <ErrorDisplay
        message="週報の取得に失敗しました"
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="grid gap-4 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">週報一覧</h1>
        <Button asChild>
          <Link href={ROUTES.weeklyReportCreate}>週報を作成</Link>
        </Button>
      </div>
      {weeklyReports.length === 0 ? (
        <p className="text-muted-foreground">週報がまだありません</p>
      ) : (
        <div className="grid gap-3">
          {weeklyReports.map((report) => (
            <Link
              key={report.id}
              href={ROUTES.weeklyReportDetail(report.id)}
            >
              <WeeklyReportCard
                startDate={report.startDate}
                goal={report.goal}
              />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

const WeeklyReportCard = ({
  startDate,
  goal,
}: {
  startDate: Date;
  goal: string | null;
}) => {
  return (
    <div className="rounded-lg border p-4 transition-colors hover:bg-muted/50">
      <p className="font-semibold">{formatWeekRange(startDate)}</p>
      {goal && (
        <p className="mt-1 text-sm text-muted-foreground">{goal}</p>
      )}
    </div>
  );
};
