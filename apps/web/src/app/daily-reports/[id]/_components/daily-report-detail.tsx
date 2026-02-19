'use client';

import { Button } from '@repo/ui/button';
import Link from 'next/link';

import { ErrorDisplay } from '@/components/feedback/error-display';
import { Loading } from '@/components/feedback/loading';
import { ROUTES } from '@/constants/routes';
import { formatDate, formatTime } from '@/lib/format';
import { useQuery, useTRPC } from '@/trpc/client';

type DailyReportDetailProps = {
  id: string;
};

export const DailyReportDetail = ({ id }: DailyReportDetailProps) => {
  const trpc = useTRPC();
  const {
    data: report,
    isLoading,
    isError,
    refetch,
  } = useQuery(trpc.dailyReport.detail.queryOptions({ id }));

  if (isLoading) {
    return <Loading />;
  }

  if (isError || !report) {
    return (
      <ErrorDisplay
        message="日報の取得に失敗しました"
        onRetry={refetch}
      />
    );
  }

  const timeLabel = buildTimeLabel(report.wakeUpTime, report.bedTime);

  return (
    <div className="grid gap-4 p-8">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold">{formatDate(report.date)}</h1>
        <Button variant="outline" asChild>
          <Link href={ROUTES.dailyReportEdit(id)}>編集</Link>
        </Button>
      </div>
      <dl className="grid gap-4">
        <DetailItem label="サマリー" value={report.summary} />
        <DetailItem label="予定" value={report.plan} />
        {timeLabel && <DetailItem label="起床・就寝" value={timeLabel} />}
        <DetailItem label="良かった点" value={report.goodPoints} />
        <DetailItem label="改善点" value={report.badPoints} />
        <DetailItem label="学び" value={report.learnings} />
        <DetailItem label="ネクストアクション" value={report.nextActions} />
        <DetailItem label="メモ" value={report.notes} />
      </dl>
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

const buildTimeLabel = (
  wakeUpTime: Date | null,
  bedTime: Date | null,
): string | null => {
  if (!wakeUpTime && !bedTime) return null;
  const parts: string[] = [];
  if (wakeUpTime) parts.push(`起床 ${formatTime(wakeUpTime)}`);
  if (bedTime) parts.push(`就寝 ${formatTime(bedTime)}`);
  return parts.join(' / ');
};
