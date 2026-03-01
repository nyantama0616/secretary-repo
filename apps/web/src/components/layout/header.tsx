import Link from 'next/link';

import { ROUTES } from '@/constants/routes';
import { SITE_NAME } from '@/constants/site';
import { isLoggedIn } from '@/server/api/auth';

import { AuthButton } from './auth-button';

const NAV_ITEMS = [
  { href: ROUTES.dashboard, label: 'ダッシュボード' },
  { href: ROUTES.dailyReports, label: '日報一覧' },
  { href: ROUTES.weeklyReports, label: '週報一覧' },
  { href: ROUTES.monthlyReports, label: '月報一覧' },
  { href: ROUTES.tasks, label: 'タスク一覧' },
  { href: ROUTES.projects, label: 'プロジェクト一覧' },
] as const;

export const Header = async () => {
  const loggedIn = await isLoggedIn();

  return (
    <header className="border-b">
      <div className="flex h-14 items-center gap-6 px-6">
        <Link href="/" className="text-lg font-bold">
          {SITE_NAME}
        </Link>
        <nav className="flex gap-4">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto">
          <AuthButton isLoggedIn={loggedIn} />
        </div>
      </div>
    </header>
  );
};

