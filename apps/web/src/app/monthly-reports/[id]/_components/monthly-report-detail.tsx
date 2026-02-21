'use client';

import Link from 'next/link';

import { ErrorDisplay } from '@/components/feedback/error-display';
import { Loading } from '@/components/feedback/loading';
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

  const hasReview =
    report.projectProgress ||
    report.growthChanges ||
    report.purposeActionGap ||
    report.improvements;

  return (
    <div className="grid gap-6 p-8">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold">{formatMonth(report.startDate)}</h1>
      </div>

      <dl className="grid gap-4">
        <DetailItem label="目標" value={report.goal} />
        <DetailItem label="サマリー" value={report.summary} />
      </dl>

      {hasReview && (
        <section className="grid gap-4">
          <h2 className="border-b pb-2 text-lg font-semibold">振り返り</h2>
          <dl className="grid gap-4">
            <DetailItem
              label="プロジェクトの進捗"
              value={report.projectProgress}
            />
            <DetailItem label="成長と変化" value={report.growthChanges} />
            <DetailItem
              label="目的と行動のギャップ"
              value={report.purposeActionGap}
            />
            <DetailItem label="改善点" value={report.improvements} />
          </dl>
        </section>
      )}

      <dl className="grid gap-4">
        <DetailItem label="メモ" value={report.notes} />
      </dl>

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

const DetailItem = ({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) => {
  if (!value) return null;

  return (
    <div>
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="mt-1 whitespace-pre-wrap">{value}</dd>
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
