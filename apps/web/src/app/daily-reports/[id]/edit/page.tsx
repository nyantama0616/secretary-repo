import type { Metadata } from 'next';
import { cache } from 'react';

import { ensureFound } from '@/lib/ensure-found';
import { formatDate } from '@/lib/format';
import { createServerCaller } from '@/server/api';

import { DailyReportEditForm } from './_components/daily-report-edit-form';

export const generateMetadata = async ({
  params,
}: DailyReportEditPageProps): Promise<Metadata> => {
  const { id } = await params;

  try {
    const report = await fetchDailyReport(id);
    return { title: `日報編集 ${formatDate(report.date)}` };
  } catch {
    return { title: '日報編集' };
  }
};

type DailyReportEditPageProps = {
  params: Promise<{ id: string }>;
};

const DailyReportEditPage = async ({ params }: DailyReportEditPageProps) => {
  const { id } = await params;
  await ensureFound(() => fetchDailyReport(id));

  return <DailyReportEditForm id={id} />;
};

export default DailyReportEditPage;

const fetchDailyReport = cache((id: string) => {
  const caller = createServerCaller();
  return caller.dailyReport.detail({ id });
});
