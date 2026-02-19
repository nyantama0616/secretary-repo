'use client';

import { ErrorDisplay } from '@/components/feedback/error-display';
import { Loading } from '@/components/feedback/loading';
import { useQuery, useTRPC } from '@/trpc/client';

type UserDetailProps = {
  id: string;
};

export const UserDetail = ({ id }: UserDetailProps) => {
  const trpc = useTRPC();
  const { data: user, isLoading, isError, refetch } = useQuery(
    trpc.user.detail.queryOptions({ id }),
  );

  if (isLoading) {
    return <Loading />;
  }

  if (isError || !user) {
    return <ErrorDisplay message="ユーザーの取得に失敗しました" onRetry={refetch} />;
  }

  return (
    <div className="grid gap-4 p-8">
      <h1 className="text-2xl font-bold">{user.name}</h1>
      <dl className="grid gap-2">
        <div>
          <dt className="text-sm text-muted-foreground">ID</dt>
          <dd>{user.id}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">Email</dt>
          <dd>{user.email}</dd>
        </div>
      </dl>
    </div>
  );
};
