import type { Metadata } from 'next';

import { WeeklyReportList } from './_components/weekly-report-list';

export const metadata: Metadata = {
  title: '週報一覧',
};

const WeeklyReportsPage = () => {
  return <WeeklyReportList />;
};

export default WeeklyReportsPage;
