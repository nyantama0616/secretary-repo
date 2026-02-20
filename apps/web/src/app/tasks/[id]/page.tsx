import type { Metadata } from 'next';
import { cache } from 'react';

import { ensureFound } from '@/lib/ensure-found';
import { createServerCaller } from '@/server/api';

import { TaskDetail } from './_components/task-detail';

export const generateMetadata = async ({
  params,
}: TaskDetailPageProps): Promise<Metadata> => {
  const { id } = await params;

  try {
    const task = await fetchTask(id);
    return { title: task.title };
  } catch {
    return { title: 'タスク' };
  }
};

type TaskDetailPageProps = {
  params: Promise<{ id: string }>;
};

const TaskDetailPage = async ({ params }: TaskDetailPageProps) => {
  const { id } = await params;
  await ensureFound(() => fetchTask(id));

  return <TaskDetail id={id} />;
};

export default TaskDetailPage;

const fetchTask = cache(async (id: string) => {
  const caller = await createServerCaller();
  return caller.task.detail({ id });
});
