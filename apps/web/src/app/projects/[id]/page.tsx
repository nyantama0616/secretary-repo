import type { Metadata } from 'next';
import { cache } from 'react';

import { ensureFound } from '@/lib/ensure-found';
import { createServerCaller } from '@/server/api';

import { ProjectDetail } from './_components/project-detail';

export const generateMetadata = async ({
  params,
}: ProjectDetailPageProps): Promise<Metadata> => {
  const { id } = await params;

  try {
    const project = await fetchProject(id);
    return { title: project.name };
  } catch {
    return { title: 'プロジェクト' };
  }
};

type ProjectDetailPageProps = {
  params: Promise<{ id: string }>;
};

const ProjectDetailPage = async ({ params }: ProjectDetailPageProps) => {
  const { id } = await params;
  await ensureFound(() => fetchProject(id));

  return <ProjectDetail id={id} />;
};

export default ProjectDetailPage;

const fetchProject = cache(async (id: string) => {
  const caller = await createServerCaller();
  return caller.project.detail({ id });
});
