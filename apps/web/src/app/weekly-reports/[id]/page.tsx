import type { Metadata } from 'next';
import { cache } from 'react';

import { ensureFound } from '@/lib/ensure-found';
import { formatWeekRange } from '@/lib/format';
import { createServerCaller } from '@/server/api';

import { WeeklyReportDetail } from './_components/weekly-report-detail';

export const generateMetadata = async ({
  params,
}: WeeklyReportDetailPageProps): Promise<Metadata> => {
  const { id } = await params;

  try {
    const report = await fetchWeeklyReport(id);
    return { title: `週報 ${formatWeekRange(report.startDate)}` };
  } catch {
    return { title: '週報' };
  }
};

type WeeklyReportDetailPageProps = {
  params: Promise<{ id: string }>;
};

const WeeklyReportDetailPage = async ({
  params,
}: WeeklyReportDetailPageProps) => {
  const { id } = await params;
  await ensureFound(() => fetchWeeklyReport(id));

  return <WeeklyReportDetail id={id} />;
};

export default WeeklyReportDetailPage;

const fetchWeeklyReport = cache(async (id: string) => {
  const caller = await createServerCaller();
  return caller.weeklyReport.detail({ id });
});
