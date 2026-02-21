import type { Metadata } from 'next';

import { ProjectList } from './_components/project-list';

export const metadata: Metadata = {
  title: 'プロジェクト一覧',
};

const ProjectsPage = () => {
  return <ProjectList />;
};

export default ProjectsPage;
