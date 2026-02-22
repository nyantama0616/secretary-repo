import type { Metadata } from 'next';

import { Dashboard } from './_components/dashboard';

export const metadata: Metadata = {
  title: 'ダッシュボード',
};

const DashboardPage = () => <Dashboard />;

export default DashboardPage;
