import type { Metadata } from 'next';

import { MonthlyReportCreateForm } from './_components/monthly-report-create-form';

export const metadata: Metadata = {
  title: '月報作成',
};

const MonthlyReportCreatePage = () => {
  return <MonthlyReportCreateForm />;
};

export default MonthlyReportCreatePage;
