import type { Metadata } from 'next';

import { UserList } from './_components/user-list';

export const metadata: Metadata = {
  title: 'Users',
};

const UsersPage = () => {
  return <UserList />;
};

export default UsersPage;
