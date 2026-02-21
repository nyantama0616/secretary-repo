import type { Metadata } from 'next';

import { ProjectCreateForm } from './_components/project-create-form';

export const metadata: Metadata = {
  title: 'プロジェクト作成',
};

const ProjectCreatePage = () => {
  return <ProjectCreateForm />;
};

export default ProjectCreatePage;
