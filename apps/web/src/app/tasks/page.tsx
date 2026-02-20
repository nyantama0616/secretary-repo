import type { Metadata } from 'next';

import { TaskList } from './_components/task-list';

export const metadata: Metadata = {
  title: 'タスク一覧',
};

const TasksPage = () => {
  return <TaskList />;
};

export default TasksPage;
