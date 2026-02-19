import type { Metadata } from 'next';

import { DailyReportCreateForm } from './_components/daily-report-create-form';

export const metadata: Metadata = {
  title: '日報作成',
};

const DailyReportCreatePage = () => {
  return <DailyReportCreateForm />;
};

export default DailyReportCreatePage;
