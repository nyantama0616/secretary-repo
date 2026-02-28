'use client';

import { Badge } from '@repo/ui/badge';
import { useState } from 'react';

type MockTask = {
  id: string;
  title: string;
  status: 'not_started' | 'in_progress' | 'done' | 'cancelled' | 'deferred';
  firstAction: string | null;
};

const MOCK_TASKS: MockTask[] = [
  { id: '1', title: 'ゴミを出す', status: 'done', firstAction: null },
  {
    id: '2',
    title: '買い物リストを作る',
    status: 'in_progress',
    firstAction: 'まず冷蔵庫の中身を確認する',
  },
  {
    id: '3',
    title: '部屋を掃除する',
    status: 'not_started',
    firstAction: '掃除機を出す',
  },
  {
    id: '4',
    title: '本を読む',
    status: 'not_started',
    firstAction: null,
  },
  {
    id: '5',
    title: 'レポートを書く',
    status: 'not_started',
    firstAction: 'テーマを決める',
  },
];

const STATUS_CONFIG = {
  not_started: { label: '未着手', variant: 'secondary' as const, muted: false },
  in_progress: { label: '着手中', variant: 'info' as const, muted: false },
  done: { label: '完了', variant: 'success' as const, muted: true },
  cancelled: { label: '中止', variant: 'destructive' as const, muted: true },
  deferred: { label: '延期', variant: 'warning' as const, muted: true },
};

const INACTIVE_STATUSES = new Set(['done', 'cancelled', 'deferred']);

export const Wireframe = () => {
  const inactive = MOCK_TASKS.filter((t) => INACTIVE_STATUSES.has(t.status));
  const active = MOCK_TASKS.filter((t) => !INACTIVE_STATUSES.has(t.status));
  const sorted = [...inactive, ...active];

  const defaultSpotlightId = active[0]?.id ?? null;
  const [spotlightId, setSpotlightId] = useState<string | null>(
    defaultSpotlightId,
  );

  return (
    <div className="grid max-w-2xl gap-8 p-8">
      <h1 className="text-2xl font-bold">ファーストアクション表示 ワイヤーフレーム</h1>

      <section className="grid gap-3">
        <div className="flex items-baseline gap-2">
          <h2 className="text-lg font-semibold">今日のタスク</h2>
          <span className="text-sm text-muted-foreground">2/28(金)</span>
        </div>

        <div
          className="grid gap-2"
          onMouseLeave={() => setSpotlightId(defaultSpotlightId)}
        >
          {sorted.map((task, index) => {
            const isInactive = INACTIVE_STATUSES.has(task.status);
            return (
              <TaskRow
                key={task.id}
                task={task}
                index={index}
                variant={task.id === spotlightId ? 'spotlight' : 'default'}
                onMouseEnter={
                  isInactive ? undefined : () => setSpotlightId(task.id)
                }
              />
            );
          })}
        </div>
      </section>

      <section className="grid gap-2 rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
        <p className="font-semibold">挙動の説明</p>
        <ul className="grid list-disc gap-1 pl-4">
          <li>常に1つのタスクだけが Spotlight 状態になる</li>
          <li>初期状態では「次のタスク」（最初のアクティブタスク）が Spotlight になる</li>
          <li>アクティブタスクをホバーすると、Spotlight がそのタスクに移る</li>
          <li>マウスがリストから離れると、Spotlight は「次のタスク」に戻る</li>
          <li>非アクティブタスク（完了・中止・延期）はホバーしても Spotlight にならない</li>
        </ul>
      </section>
    </div>
  );
};

const TaskRow = ({
  task,
  index,
  variant,
  onMouseEnter,
}: {
  task: MockTask;
  index: number;
  variant: 'default' | 'spotlight';
  onMouseEnter?: () => void;
}) => {
  const config = STATUS_CONFIG[task.status];
  const isDone = task.status === 'done';
  const isSpotlight = variant === 'spotlight';

  return (
    <div
      className={`flex items-start gap-2 ${config.muted ? 'opacity-50' : ''} ${isSpotlight ? '-translate-x-2' : ''}`}
      onMouseEnter={onMouseEnter}
    >
      <div className="flex w-6 shrink-0 items-center justify-center pt-3 text-sm font-medium text-muted-foreground">
        {index + 1}
      </div>
      <div
        className={`flex min-w-0 flex-1 flex-col rounded-lg border transition-all ${isSpotlight ? 'shadow-md p-4' : 'p-3'}`}
      >
        <div className="flex items-center gap-2">
          <div
            className={`flex size-5 shrink-0 items-center justify-center rounded-full border-2 ${isDone ? 'border-success bg-success text-white' : 'border-muted-foreground/40'}`}
          >
            {isDone && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-3"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </div>
          <Badge variant={config.variant}>{config.label}</Badge>
          <span
            className={`truncate font-medium ${isSpotlight ? 'text-base' : 'text-sm'} ${config.muted ? 'text-muted-foreground line-through' : ''}`}
          >
            {task.title}
          </span>
        </div>
        {isSpotlight && task.firstAction && (
          <p className="mt-1 pl-7 text-sm text-muted-foreground">
            → {task.firstAction}
          </p>
        )}
      </div>
    </div>
  );
};
