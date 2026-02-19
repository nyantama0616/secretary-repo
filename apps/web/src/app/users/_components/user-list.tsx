'use client';

import Link from 'next/link';

import { ErrorDisplay } from '@/components/feedback/error-display';
import { Loading } from '@/components/feedback/loading';
import { ROUTES } from '@/constants/routes';
import { useQuery, useTRPC } from '@/trpc/client';

export const UserList = () => {
  const trpc = useTRPC();
  const { data: users, isLoading, isError, refetch } = useQuery(trpc.user.list.queryOptions());

  if (isLoading) {
    return <Loading />;
  }

  if (isError || !users) {
    return <ErrorDisplay message="ユーザーの取得に失敗しました" onRetry={refetch} />;
  }

  return (
    <div className="grid gap-4 p-8">
      <h1 className="text-2xl font-bold">Users</h1>
      <div className="grid gap-3">
        {users.map((user) => (
          <UserCard key={user.id} href={ROUTES.userDetail(user.id)} name={user.name} email={user.email} />
        ))}
      </div>
    </div>
  );
};

const UserCard = ({ href, name, email }: { href: string; name: string; email: string }) => {
  return (
    <Link href={href} className="block rounded-lg border p-4 hover:bg-accent">
      <p className="font-semibold">{name}</p>
      <p className="text-sm text-gray-500">{email}</p>
    </Link>
  );
};
