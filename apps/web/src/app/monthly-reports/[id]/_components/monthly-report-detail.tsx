'use client';

import Link from 'next/link';

import { ErrorDisplay } from '@/components/feedback/error-display';
import { Loading } from '@/components/feedback/loading';
import { MarkdownViewer } from '@/components/viewer/markdown-viewer';
import { ViewerFrame } from '@/components/viewer/viewer-frame';
import { ROUTES } from '@/constants/routes';
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

  const reviewMarkdown = buildReviewMarkdown({
    projectProgress: report.projectProgress,
    growthChanges: report.growthChanges,
    purposeActionGap: report.purposeActionGap,
    improvements: report.improvements,
  });

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

      {reviewMarkdown && (
        <section className="grid gap-2">
          <h2 className="border-b pb-2 text-lg font-semibold">振り返り</h2>
          <ViewerFrame>
            <MarkdownViewer content={reviewMarkdown} />
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

// NOTE: バックエンドが振り返りフィールドを統合するまでの暫定処理である
const buildReviewMarkdown = ({
  projectProgress,
  growthChanges,
  purposeActionGap,
  improvements,
}: {
  projectProgress: string | null;
  growthChanges: string | null;
  purposeActionGap: string | null;
  improvements: string | null;
}): string | null => {
  const sections: string[] = [];
  if (projectProgress) sections.push(`## プロジェクトの進捗\n${projectProgress}`);
  if (growthChanges) sections.push(`## 成長と変化\n${growthChanges}`);
  if (purposeActionGap) sections.push(`## 目的と行動のギャップ\n${purposeActionGap}`);
  if (improvements) sections.push(`## 改善点\n${improvements}`);
  if (sections.length === 0) return null;
  return sections.join('\n\n');
};
