'use client';

import { valibotResolver } from '@hookform/resolvers/valibot';
import { Button } from '@repo/ui/button';
import { Input } from '@repo/ui/input';
import { Label } from '@repo/ui/label';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as v from 'valibot';

import { ROUTES } from '@/constants/routes';

const LoginFormSchema = v.object({
  apiKey: v.pipe(v.string(), v.minLength(1, 'API Key を入力してください')),
});

type FormValues = v.InferOutput<typeof LoginFormSchema>;

export const LoginForm = () => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: valibotResolver(LoginFormSchema),
  });

  const onSubmit = async (data: FormValues) => {
    setError(null);
    setIsPending(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: data.apiKey }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setError(body?.error ?? 'ログインに失敗しました');
        return;
      }

      router.push(ROUTES.dailyReports);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="grid gap-4 p-8">
      <h1 className="text-2xl font-bold">ログイン</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="grid max-w-sm gap-4">
        <div className="grid gap-2">
          <Label htmlFor="apiKey">API Key</Label>
          <Input
            id="apiKey"
            type="password"
            autoComplete="current-password"
            {...register('apiKey')}
          />
          {errors.apiKey && (
            <p className="text-sm text-destructive">
              {errors.apiKey.message}
            </p>
          )}
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" disabled={isPending}>
          {isPending ? 'ログイン中...' : 'ログイン'}
        </Button>
      </form>
    </div>
  );
};
