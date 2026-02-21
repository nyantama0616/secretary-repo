import type { Metadata } from 'next';
import { cache } from 'react';

import { ensureFound } from '@/lib/ensure-found';
import { formatMonth } from '@/lib/format';
import { createServerCaller } from '@/server/api';

import { MonthlyReportDetail } from './_components/monthly-report-detail';

export const generateMetadata = async ({
  params,
}: MonthlyReportDetailPageProps): Promise<Metadata> => {
  const { id } = await params;

  try {
    const report = await fetchMonthlyReport(id);
    return { title: `月報 ${formatMonth(report.startDate)}` };
  } catch {
    return { title: '月報' };
  }
};

type MonthlyReportDetailPageProps = {
  params: Promise<{ id: string }>;
};

const MonthlyReportDetailPage = async ({
  params,
}: MonthlyReportDetailPageProps) => {
  const { id } = await params;
  await ensureFound(() => fetchMonthlyReport(id));

  return <MonthlyReportDetail id={id} />;
};

export default MonthlyReportDetailPage;

const fetchMonthlyReport = cache(async (id: string) => {
  const caller = await createServerCaller();
  return caller.monthlyReport.detail({ id });
});
