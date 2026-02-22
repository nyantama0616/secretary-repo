'use client';

import { Input } from '@repo/ui/input';
import { useState } from 'react';

type TaskAddFormProps = {
  disabled?: boolean;
  onSubmit: (title: string) => Promise<void>;
};

export const TaskAddForm = ({ disabled, onSubmit }: TaskAddFormProps) => {
  const [title, setTitle] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;

    setError(null);
    try {
      await onSubmit(trimmed);
      setTitle('');
    } catch {
      setError('タスクの追加に失敗しました');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-1">
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        disabled={disabled}
        placeholder="タスクを追加する"
        aria-label="新しいタスクのタイトル"
        className="h-auto py-3"
      />
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </form>
  );
};
