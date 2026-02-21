import type { Metadata } from 'next';
import { cache } from 'react';

import { ensureFound } from '@/lib/ensure-found';
import { createServerCaller } from '@/server/api';

import { ProjectEditForm } from './_components/project-edit-form';

export const generateMetadata = async ({
  params,
}: ProjectEditPageProps): Promise<Metadata> => {
  const { id } = await params;

  try {
    const project = await fetchProject(id);
    return { title: `プロジェクト編集 ${project.name}` };
  } catch {
    return { title: 'プロジェクト編集' };
  }
};

type ProjectEditPageProps = {
  params: Promise<{ id: string }>;
};

const ProjectEditPage = async ({ params }: ProjectEditPageProps) => {
  const { id } = await params;
  await ensureFound(() => fetchProject(id));

  return <ProjectEditForm id={id} />;
};

export default ProjectEditPage;

const fetchProject = cache(async (id: string) => {
  const caller = await createServerCaller();
  return caller.project.detail({ id });
});
