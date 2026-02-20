import type { Metadata } from 'next';
import { cache } from 'react';

import { ensureFound } from '@/lib/ensure-found';
import { createServerCaller } from '@/server/api';

import { TaskEditForm } from './_components/task-edit-form';

export const generateMetadata = async ({
  params,
}: TaskEditPageProps): Promise<Metadata> => {
  const { id } = await params;

  try {
    const task = await fetchTask(id);
    return { title: `タスク編集 ${task.title}` };
  } catch {
    return { title: 'タスク編集' };
  }
};

type TaskEditPageProps = {
  params: Promise<{ id: string }>;
};

const TaskEditPage = async ({ params }: TaskEditPageProps) => {
  const { id } = await params;
  await ensureFound(() => fetchTask(id));

  return <TaskEditForm id={id} />;
};

export default TaskEditPage;

const fetchTask = cache(async (id: string) => {
  const caller = await createServerCaller();
  return caller.task.detail({ id });
});
