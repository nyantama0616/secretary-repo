import type { Metadata } from 'next';
import { cache } from 'react';

import { ensureFound } from '@/lib/ensure-found';
import { formatWeekRange } from '@/lib/format';
import { createServerCaller } from '@/server/api';

import { WeeklyReportEditForm } from './_components/weekly-report-edit-form';

export const generateMetadata = async ({
  params,
}: WeeklyReportEditPageProps): Promise<Metadata> => {
  const { id } = await params;

  try {
    const report = await fetchWeeklyReport(id);
    return { title: `週報編集 ${formatWeekRange(report.startDate)}` };
  } catch {
    return { title: '週報編集' };
  }
};

type WeeklyReportEditPageProps = {
  params: Promise<{ id: string }>;
};

const WeeklyReportEditPage = async ({ params }: WeeklyReportEditPageProps) => {
  const { id } = await params;
  await ensureFound(() => fetchWeeklyReport(id));

  return <WeeklyReportEditForm id={id} />;
};

export default WeeklyReportEditPage;

const fetchWeeklyReport = cache(async (id: string) => {
  const caller = await createServerCaller();
  return caller.weeklyReport.detail({ id });
});
