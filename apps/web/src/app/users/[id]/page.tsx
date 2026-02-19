import type { Metadata } from 'next';

import { createCaller } from '@/server/api';

import { UserDetail } from './_components/user-detail';

export const generateMetadata = async ({ params }: UserDetailPageProps): Promise<Metadata> => {
  const { id } = await params;
  const caller = createCaller({});
  const user = await caller.user.detail({ id });

  return { title: user.name };
};

type UserDetailPageProps = {
  params: Promise<{ id: string }>;
};

const UserDetailPage = async ({ params }: UserDetailPageProps) => {
  const { id } = await params;

  return <UserDetail id={id} />;
};

export default UserDetailPage;
