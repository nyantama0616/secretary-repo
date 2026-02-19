import type { Metadata } from 'next';

import { DailyReportList } from './_components/daily-report-list';

export const metadata: Metadata = {
  title: '日報一覧',
};

const DailyReportsPage = () => {
  return <DailyReportList />;
};

export default DailyReportsPage;
