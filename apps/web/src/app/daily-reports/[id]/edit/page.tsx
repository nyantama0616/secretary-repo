import type { Metadata } from 'next';

import { formatDate } from '@/lib/format';
import { createCaller } from '@/server/api';

import { DailyReportEditForm } from './_components/daily-report-edit-form';

export const generateMetadata = async ({
  params,
}: DailyReportEditPageProps): Promise<Metadata> => {
  const { id } = await params;
  const caller = createCaller({});
  const report = await caller.dailyReport.detail({ id });

  return { title: `日報編集 ${formatDate(report.date)}` };
};

type DailyReportEditPageProps = {
  params: Promise<{ id: string }>;
};

const DailyReportEditPage = async ({ params }: DailyReportEditPageProps) => {
  const { id } = await params;

  return <DailyReportEditForm id={id} />;
};

export default DailyReportEditPage;
