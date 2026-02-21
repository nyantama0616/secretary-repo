'use client';

import { Button } from '@repo/ui/button';
import Link from 'next/link';

import { ErrorDisplay } from '@/components/feedback/error-display';
import { Loading } from '@/components/feedback/loading';
import { MarkdownViewer } from '@/components/viewer/markdown-viewer';
import { ViewerFrame } from '@/components/viewer/viewer-frame';
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
  const reviewMarkdown = buildReviewMarkdown({
    goodPoints: report.goodPoints,
    badPoints: report.badPoints,
    learnings: report.learnings,
    nextActions: report.nextActions,
  });

  return (
    <div className="grid gap-6 p-8">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold">{formatDate(report.date)}</h1>
        <Button variant="outline" asChild>
          <Link href={ROUTES.dailyReportEdit(id)}>編集</Link>
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

      {timeLabel && (
        <section className="grid gap-2">
          <h2 className="border-b pb-2 text-lg font-semibold">起床・就寝</h2>
          <p>{timeLabel}</p>
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

// NOTE: バックエンドが振り返りフィールドを統合するまでの暫定処理である
const buildReviewMarkdown = ({
  goodPoints,
  badPoints,
  learnings,
  nextActions,
}: {
  goodPoints: string | null;
  badPoints: string | null;
  learnings: string | null;
  nextActions: string | null;
}): string | null => {
  const sections: string[] = [];
  if (goodPoints) sections.push(`## 良かった点\n${goodPoints}`);
  if (badPoints) sections.push(`## 改善点\n${badPoints}`);
  if (learnings) sections.push(`## 学び\n${learnings}`);
  if (nextActions) sections.push(`## ネクストアクション\n${nextActions}`);
  if (sections.length === 0) return null;
  return sections.join('\n\n');
};
