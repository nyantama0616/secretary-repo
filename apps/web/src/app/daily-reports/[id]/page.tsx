import type { Metadata } from 'next';
import { cache } from 'react';

import { ensureFound } from '@/lib/ensure-found';
import { formatDate } from '@/lib/format';
import { createCaller } from '@/server/api';

import { DailyReportDetail } from './_components/daily-report-detail';

export const generateMetadata = async ({
  params,
}: DailyReportDetailPageProps): Promise<Metadata> => {
  const { id } = await params;

  try {
    const report = await fetchDailyReport(id);
    return { title: `日報 ${formatDate(report.date)}` };
  } catch {
    return { title: '日報' };
  }
};

type DailyReportDetailPageProps = {
  params: Promise<{ id: string }>;
};

const DailyReportDetailPage = async ({
  params,
}: DailyReportDetailPageProps) => {
  const { id } = await params;
  await ensureFound(() => fetchDailyReport(id));

  return <DailyReportDetail id={id} />;
};

export default DailyReportDetailPage;

const fetchDailyReport = cache((id: string) => {
  const caller = createCaller({});
  return caller.dailyReport.detail({ id });
});
