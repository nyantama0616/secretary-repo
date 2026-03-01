'use client';

import { Button } from '@repo/ui/button';
import Link from 'next/link';

import { ErrorDisplay } from '@/components/feedback/error-display';
import { Loading } from '@/components/feedback/loading';
import { MarkdownViewer } from '@/components/viewer/markdown-viewer';
import { ViewerFrame } from '@/components/viewer/viewer-frame';
import { ROUTES } from '@/constants/routes';
import { formatDate, formatWeekRange } from '@/lib/format';
import { useQuery, useTRPC } from '@/trpc/client';

type WeeklyReportDetailProps = {
  id: string;
};

export const WeeklyReportDetail = ({ id }: WeeklyReportDetailProps) => {
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
      <ErrorDisplay
        message="週報の取得に失敗しました"
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="grid gap-6 p-8">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold">
          {formatWeekRange(report.startDate)}
        </h1>
        <Button variant="outline" asChild>
          <Link href={ROUTES.weeklyReportEdit(id)}>編集</Link>
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

      {report.review && (
        <section className="grid gap-2">
          <h2 className="border-b pb-2 text-lg font-semibold">振り返り</h2>
          <ViewerFrame>
            <MarkdownViewer content={report.review} />
          </ViewerFrame>
        </section>
      )}

      {report.dailyReports.length > 0 && (
        <section className="grid gap-3">
          <h2 className="border-b pb-2 text-lg font-semibold">日報</h2>
          <div className="grid gap-2">
            {report.dailyReports.map((dailyReport) => (
              <Link
                key={dailyReport.id}
                href={ROUTES.dailyReportDetail(dailyReport.id)}
              >
                <DailyReportCard
                  date={dailyReport.date}
                  summary={dailyReport.summary}
                />
              </Link>
            ))}
          </div>
        </section>
      )}

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

const DailyReportCard = ({
  date,
  summary,
}: {
  date: Date;
  summary: string | null;
}) => {
  return (
    <div className="rounded-lg border p-4 transition-colors hover:bg-muted/50">
      <p className="font-semibold">{formatDate(date)}</p>
      {summary && (
        <p className="mt-1 text-sm text-muted-foreground">{summary}</p>
      )}
    </div>
  );
};
