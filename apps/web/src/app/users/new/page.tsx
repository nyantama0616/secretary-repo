import type { Metadata } from 'next';

import { UserCreateForm } from './_components/user-create-form';

export const metadata: Metadata = {
  title: 'Create User',
};

const UserCreatePage = () => {
  return <UserCreateForm />;
};

export default UserCreatePage;
