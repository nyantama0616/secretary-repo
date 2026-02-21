import type { Metadata } from 'next';

import { MonthlyReportList } from './_components/monthly-report-list';

export const metadata: Metadata = {
  title: '月報一覧',
};

const MonthlyReportsPage = () => {
  return <MonthlyReportList />;
};

export default MonthlyReportsPage;
