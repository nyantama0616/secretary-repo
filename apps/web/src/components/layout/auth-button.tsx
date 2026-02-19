'use client';

import { Button } from '@repo/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { ROUTES } from '@/constants/routes';

type AuthButtonProps = {
  isLoggedIn: boolean;
};

export const AuthButton = ({ isLoggedIn }: AuthButtonProps) => {
  const router = useRouter();

  if (!isLoggedIn) {
    return (
      <Button variant="outline" asChild>
        <Link href={ROUTES.login}>ログイン</Link>
      </Button>
    );
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push(ROUTES.login);
    router.refresh();
  };

  return (
    <Button variant="outline" onClick={handleLogout}>
      ログアウト
    </Button>
  );
};
