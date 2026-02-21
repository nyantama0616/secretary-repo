'use client';

import { Button } from '@repo/ui/button';
import Link from 'next/link';

import { ErrorDisplay } from '@/components/feedback/error-display';
import { Loading } from '@/components/feedback/loading';
import { ROUTES } from '@/constants/routes';
import { formatMonth } from '@/lib/format';
import { useQuery, useTRPC } from '@/trpc/client';

export const MonthlyReportList = () => {
  const trpc = useTRPC();
  const {
    data: monthlyReports,
    isLoading,
    isError,
    refetch,
  } = useQuery(trpc.monthlyReport.list.queryOptions());

  if (isLoading) {
    return <Loading />;
  }

  if (isError || !monthlyReports) {
    return (
      <ErrorDisplay
        message="月報の取得に失敗しました"
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="grid gap-4 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">月報一覧</h1>
        <Button asChild>
          <Link href={ROUTES.monthlyReportCreate}>月報を作成</Link>
        </Button>
      </div>
      {monthlyReports.length === 0 ? (
        <p className="text-muted-foreground">月報がまだありません</p>
      ) : (
        <div className="grid gap-3">
          {monthlyReports.map((report) => (
            <Link
              key={report.id}
              href={ROUTES.monthlyReportDetail(report.id)}
            >
              <MonthlyReportCard
                startDate={report.startDate}
                summary={report.notes}
              />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

const MonthlyReportCard = ({
  startDate,
  summary,
}: {
  startDate: Date;
  // TODO: バックエンドに summary フィールドを追加後、notes からの仮表示を置き換える
  summary: string | null;
}) => {
  return (
    <div className="rounded-lg border p-4 transition-colors hover:bg-muted/50">
      <p className="font-semibold">{formatMonth(startDate)}</p>
      {summary && (
        <p className="mt-1 text-sm text-muted-foreground">{summary}</p>
      )}
    </div>
  );
};
