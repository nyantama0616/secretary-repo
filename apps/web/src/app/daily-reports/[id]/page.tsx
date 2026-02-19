import type { Metadata } from 'next';

import { formatDate } from '@/lib/format';
import { createCaller } from '@/server/api';

import { DailyReportDetail } from './_components/daily-report-detail';

export const generateMetadata = async ({
  params,
}: DailyReportDetailPageProps): Promise<Metadata> => {
  const { id } = await params;
  const caller = createCaller({});
  const report = await caller.dailyReport.detail({ id });

  return { title: `日報 ${formatDate(report.date)}` };
};

type DailyReportDetailPageProps = {
  params: Promise<{ id: string }>;
};

const DailyReportDetailPage = async ({
  params,
}: DailyReportDetailPageProps) => {
  const { id } = await params;

  return <DailyReportDetail id={id} />;
};

export default DailyReportDetailPage;
