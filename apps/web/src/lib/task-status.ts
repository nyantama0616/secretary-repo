// NOTE: タスクステータスごとの一覧表示（見た目・並び順）を定義している

import type { Badge } from '@repo/ui/badge';
import type { ComponentProps } from 'react';


import type { TaskStatus } from '@/server/domain/task/task';

export const STATUS_CONFIG: Record<
  TaskStatus,
  {
    label: string;
    variant: ComponentProps<typeof Badge>['variant'];
    muted: boolean;
  }
> = {
  not_started: { label: '未着手', variant: 'secondary', muted: false },
  in_progress: { label: '着手中', variant: 'info', muted: false },
  done: { label: '完了', variant: 'success', muted: true },
  cancelled: { label: '中止', variant: 'destructive', muted: true },
  deferred: { label: '延期', variant: 'warning', muted: true },
};

export const INACTIVE_STATUSES: Set<TaskStatus> = new Set([
  'done',
  'cancelled',
  'deferred',
]);

export const sortInactiveFirst = <T extends { status: TaskStatus }>(
  tasks: T[],
): T[] => {
  const inactive = tasks.filter((t) => INACTIVE_STATUSES.has(t.status));
  const active = tasks.filter((t) => !INACTIVE_STATUSES.has(t.status));
  return [...inactive, ...active];
};
