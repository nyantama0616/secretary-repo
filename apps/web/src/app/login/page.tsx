import type { Metadata } from 'next';

import { LoginForm } from './_components/login-form';

export const metadata: Metadata = {
  title: 'ログイン',
};

const LoginPage = () => {
  return <LoginForm />;
};

export default LoginPage;
