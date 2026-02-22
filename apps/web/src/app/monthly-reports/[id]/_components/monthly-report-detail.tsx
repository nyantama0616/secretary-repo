'use client';

import { ErrorDisplay } from '@/components/feedback/error-display';
import { Loading } from '@/components/feedback/loading';
import { MarkdownViewer } from '@/components/viewer/markdown-viewer';
import { ViewerFrame } from '@/components/viewer/viewer-frame';
import { formatDate, formatMonth } from '@/lib/format';
import { useQuery, useTRPC } from '@/trpc/client';

type MonthlyReportDetailProps = {
  id: string;
};

export const MonthlyReportDetail = ({ id }: MonthlyReportDetailProps) => {
  const trpc = useTRPC();
  const {
    data: report,
    isLoading,
    isError,
    refetch,
  } = useQuery(trpc.monthlyReport.detail.queryOptions({ id }));

  if (isLoading) {
    return <Loading />;
  }

  if (isError || !report) {
    return (
      <ErrorDisplay
        message="月報の取得に失敗しました"
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="grid gap-6 p-8">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold">{formatMonth(report.startDate)}</h1>
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
          <ViewerFrame>
            <MarkdownViewer content={report.goal} />
          </ViewerFrame>
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

      {report.notes && (
        <section className="grid gap-2">
          <h2 className="border-b pb-2 text-lg font-semibold">その他メモ</h2>
          <ViewerFrame>
            <MarkdownViewer content={report.notes} />
          </ViewerFrame>
        </section>
      )}

      {report.weeklyReports.length > 0 && (
        <section className="grid gap-3">
          <h2 className="border-b pb-2 text-lg font-semibold">週報</h2>
          <div className="grid gap-2">
            {report.weeklyReports.map((weeklyReport) => (
              <WeeklyReportCard
                key={weeklyReport.id}
                startDate={weeklyReport.startDate}
                goal={weeklyReport.goal}
              />
            ))}
          </div>
        </section>
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
    <div className="rounded-lg border p-4">
      <p className="font-semibold">{formatDate(startDate)}〜</p>
      {goal && (
        <p className="mt-1 text-sm text-muted-foreground">{goal}</p>
      )}
    </div>
  );
};

